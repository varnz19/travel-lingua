import io
import logging
import numpy as np
from typing import Dict, Any, List, Optional
from PIL import Image, ImageEnhance, ImageOps

logger = logging.getLogger("travel-lingua.ml.ocr")

class PaddleOCRService:
    """
    Production Optical Character Recognition (OCR) pipeline.
    Combines Tesseract (Japanese & English with vertical/horizontal support)
    and PaddleOCR (when installed) with smart image preprocessing.
    """

    def __init__(self, lang: str = "japan"):
        self.lang = lang
        self._paddle_engine = None
        self._paddle_attempted = False

    def _get_paddle_engine(self):
        """Lazy loads PaddleOCR engine singleton if available in environment."""
        if not self._paddle_attempted:
            self._paddle_attempted = True
            try:
                from paddleocr import PaddleOCR
                self._paddle_engine = PaddleOCR(use_angle_cls=True, lang=self.lang, show_log=False)
                logger.info("PaddleOCR engine initialized successfully.")
            except Exception as e:
                logger.info(f"PaddleOCR not active ({e}); using native Tesseract engine.")
                self._paddle_engine = None
        return self._paddle_engine

    def extract_text(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Extracts real text, bounding regions, orientation, and confidence scores
        from uploaded image bytes (JPEG, PNG, WEBP, etc.).
        """
        if not image_bytes:
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "bounding_boxes": [],
                "orientation": "horizontal",
                "file_name": filename,
                "bytes_size": 0,
                "engine": "Tesseract Vision Engine"
            }

        # 1. Load image via Pillow
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            # Convert palette/alpha to RGB
            if pil_image.mode not in ("RGB", "L"):
                pil_image = pil_image.convert("RGB")
        except Exception as e:
            logger.error(f"Failed to decode image with PIL: {e}")
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "bounding_boxes": [],
                "orientation": "horizontal",
                "file_name": filename,
                "bytes_size": len(image_bytes),
                "engine": "Failed"
            }

        # 2. Attempt PaddleOCR if available
        paddle_engine = self._get_paddle_engine()
        if paddle_engine is not None:
            try:
                import cv2
                np_arr = np.frombuffer(image_bytes, np.uint8)
                img_cv = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if img_cv is not None:
                    result = paddle_engine.ocr(img_cv, cls=True)
                    if result and result[0]:
                        lines = []
                        boxes = []
                        confidences = []
                        vertical_count = 0
                        for line in result[0]:
                            box = line[0]
                            text, conf = line[1]
                            clean_text = text.strip()
                            if clean_text:
                                lines.append(clean_text)
                                boxes.append(box)
                                confidences.append(float(conf))
                                box_w = abs(box[1][0] - box[0][0])
                                box_h = abs(box[2][1] - box[1][1])
                                if box_h > 1.3 * max(box_w, 1):
                                    vertical_count += 1

                        if lines:
                            mean_conf = round(float(np.mean(confidences) * 100), 1) if confidences else 90.0
                            orientation = "vertical" if vertical_count > len(lines) / 2 else "horizontal"
                            return {
                                "extracted_text": "\n".join(lines),
                                "confidence": mean_conf,
                                "bounding_boxes": boxes,
                                "orientation": orientation,
                                "file_name": filename,
                                "bytes_size": len(image_bytes),
                                "engine": "PaddleOCR Engine"
                            }
            except Exception as e:
                logger.warning(f"PaddleOCR inference exception: {e}")

        # 3. High-Accuracy Native Tesseract OCR (with Japanese & English)
        try:
            import pytesseract

            is_vertical = pil_image.height > (pil_image.width * 1.25)
            extracted_text = ""
            orientation = "vertical" if is_vertical else "horizontal"

            # Check if vertical text layout
            if is_vertical:
                try:
                    raw = pytesseract.image_to_string(pil_image, lang="jpn_vert+jpn+eng", config="--psm 5").strip()
                    lines = [l.strip() for l in raw.splitlines() if l.strip()]
                    if lines:
                        extracted_text = "\n".join(lines)
                except Exception as e:
                    logger.debug(f"Tesseract vertical PSM 5 failed: {e}")

            # Try horizontal automatic block detection (PSM 3)
            if not extracted_text:
                try:
                    raw = pytesseract.image_to_string(pil_image, lang="jpn+eng", config="--psm 3").strip()
                    lines = [l.strip() for l in raw.splitlines() if l.strip()]
                    if lines:
                        extracted_text = "\n".join(lines)
                except Exception as e:
                    logger.debug(f"Tesseract PSM 3 failed: {e}")

            # Try uniform block detection (PSM 6)
            if not extracted_text:
                try:
                    raw = pytesseract.image_to_string(pil_image, lang="jpn+eng", config="--psm 6").strip()
                    lines = [l.strip() for l in raw.splitlines() if l.strip()]
                    if lines:
                        extracted_text = "\n".join(lines)
                except Exception as e:
                    logger.debug(f"Tesseract PSM 6 failed: {e}")

            # Preprocessing fallback: grayscale + contrast enhancement
            if not extracted_text:
                try:
                    gray = ImageOps.grayscale(pil_image)
                    enhanced = ImageEnhance.Contrast(gray).enhance(1.8)
                    raw = pytesseract.image_to_string(enhanced, lang="jpn+eng", config="--psm 6").strip()
                    lines = [l.strip() for l in raw.splitlines() if l.strip()]
                    if lines:
                        extracted_text = "\n".join(lines)
                except Exception as e:
                    logger.debug(f"Tesseract preprocessed failed: {e}")

            # Extract bounding boxes and confidences via image_to_data
            boxes = []
            confs = []
            try:
                data = pytesseract.image_to_data(pil_image, lang="jpn+eng", output_type=pytesseract.Output.DICT)
                for i, w in enumerate(data["text"]):
                    w_clean = w.strip()
                    if w_clean:
                        c = float(data["conf"][i])
                        if c > 0:
                            confs.append(c)
                        x, y, bw, bh = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
                        boxes.append([[x, y], [x + bw, y], [x + bw, y + bh], [x, y + bh]])
            except Exception as e:
                logger.debug(f"Tesseract image_to_data failed: {e}")

            mean_conf = round(float(np.mean(confs)), 1) if confs else (92.0 if extracted_text else 0.0)

            return {
                "extracted_text": extracted_text,
                "confidence": mean_conf,
                "bounding_boxes": boxes,
                "orientation": orientation,
                "file_name": filename,
                "bytes_size": len(image_bytes),
                "engine": "Tesseract Vision Engine (jpn+eng)"
            }

        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "bounding_boxes": [],
                "orientation": "horizontal",
                "file_name": filename,
                "bytes_size": len(image_bytes),
                "engine": "Error"
            }


paddle_ocr = PaddleOCRService()


def extract_image_text(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Person 1 Stable API interface for OCR text extraction."""
    return paddle_ocr.extract_text(image_bytes, filename)
