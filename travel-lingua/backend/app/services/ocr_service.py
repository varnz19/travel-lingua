from app.schemas.ocr import OCRExtractResponse
from app.services.ml.ocr.paddle_ocr_service import extract_image_text
from app.services.translation_service import translation_service


class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str) -> OCRExtractResponse:
        """
        FastAPI OCR Service abstraction.
        Passes image file bytes to Person 3's PaddleOCR / Vision ML pipeline
        and dynamically translates the detected Japanese text into English.
        """
        ml_result = extract_image_text(file_bytes, filename)
        extracted = ml_result.get("extracted_text", "")

        translated_res = await translation_service.translate_text(
            text=extracted,
            source_lang="ja",
            target_lang="en"
        )

        return OCRExtractResponse(
            extracted_text=extracted,
            confidence=ml_result.get("confidence", 95.0),
            detected_language="ja",
            translated_text=translated_res.translated_text,
            info={
                "bounding_boxes": ml_result.get("bounding_boxes", []),
                "orientation": ml_result.get("orientation", "horizontal"),
                "file_name": filename,
                "bytes_size": len(file_bytes),
                "engine": "PaddleOCR Japanese Engine"
            }
        )


ocr_service = OCRService()
