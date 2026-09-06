from app.schemas.ocr import OCRExtractResponse
from app.services.ml.ocr.paddle_ocr_service import extract_image_text


class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str) -> OCRExtractResponse:
        """
        FastAPI OCR Service abstraction.
        Passes image file bytes to Person 3's PaddleOCR / Vision ML pipeline.
        """
        ml_result = extract_image_text(file_bytes, filename)

        return OCRExtractResponse(
            extracted_text=ml_result["extracted_text"],
            confidence=ml_result["confidence"],
            detected_language="ja",
            translated_text="Exit\n↑ North Exit\n← South Exit",
            info={
                "bounding_boxes": ml_result.get("bounding_boxes", []),
                "orientation": ml_result.get("orientation", "horizontal"),
                "file_name": filename,
                "bytes_size": len(file_bytes),
                "engine": "PaddleOCR Japanese Engine"
            }
        )


ocr_service = OCRService()
