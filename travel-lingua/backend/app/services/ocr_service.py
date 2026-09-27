from app.schemas.ocr import OCRExtractResponse
from app.services.ml.ocr.paddle_ocr_service import extract_image_text
from app.services.translation_service import translation_service


class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str) -> OCRExtractResponse:
        """
        FastAPI OCR Service abstraction.
        Passes image file bytes to the OCR pipeline, detects language,
        and dynamically translates detected text (e.g. Japanese -> English or English -> Japanese).
        """
        ml_result = extract_image_text(file_bytes, filename)
        extracted = ml_result.get("extracted_text", "").strip()

        # Language detection heuristic
        has_japanese = any(
            '\u3040' <= char <= '\u309F' or  # Hiragana
            '\u30A0' <= char <= '\u30FF' or  # Katakana
            '\u4E00' <= char <= '\u9FFF'     # Kanji
            for char in extracted
        )
        source_lang = "ja" if has_japanese else "en"
        target_lang = "en" if source_lang == "ja" else "ja"

        translated_text = ""
        if extracted:
            try:
                translated_res = await translation_service.translate_text(
                    text=extracted,
                    source_lang=source_lang,
                    target_lang=target_lang
                )
                translated_text = translated_res.translated_text
            except Exception:
                translated_text = f"[{target_lang.upper()}] {extracted}"

        return OCRExtractResponse(
            extracted_text=extracted,
            confidence=ml_result.get("confidence", 95.0),
            detected_language=source_lang,
            translated_text=translated_text,
            info={
                "bounding_boxes": ml_result.get("bounding_boxes", []),
                "orientation": ml_result.get("orientation", "horizontal"),
                "file_name": filename,
                "bytes_size": len(file_bytes),
                "engine": ml_result.get("engine", "Tesseract Vision OCR Engine")
            }
        )


ocr_service = OCRService()
