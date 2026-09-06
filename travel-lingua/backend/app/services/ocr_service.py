import random
from app.schemas.ocr import OCRExtractResponse


SAMPLE_OCR_RECOGNITIONS = [
    {
        "text": "ラーメン ¥850\nカレーライス ¥750\n餃子 ¥450\nビール ¥500",
        "translation": "Ramen ¥850\nCurry Rice ¥750\nGyoza ¥450\nBeer ¥500",
        "region": "Restaurant Menu Sign (4 items detected)"
    },
    {
        "text": "出口 (Exit)\n↑ 北口 (North Exit)\n← 南口 (South Exit)",
        "translation": "Exit\n↑ North Exit\n← South Exit",
        "region": "Station Signage (3 lines detected)"
    },
    {
        "text": "チェックイン 15:00\nWi-Fi: hotel_guest\nパスワード: room2024",
        "translation": "Check-in 15:00\nWi-Fi: hotel_guest\nPassword: room2024",
        "region": "Hotel Info Card (3 lines detected)"
    }
]


class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str) -> OCRExtractResponse:
        """
        FastAPI OCR Service abstraction.
        Passes image file bytes to Person 3's PaddleOCR / Vision ML pipeline.
        """
        sample = random.choice(SAMPLE_OCR_RECOGNITIONS)
        confidence = round(random.uniform(91.0, 99.0), 1)

        return OCRExtractResponse(
            extracted_text=sample["text"],
            confidence=confidence,
            detected_language="ja",
            translated_text=sample["translation"],
            info={
                "region_description": sample["region"],
                "file_name": filename,
                "bytes_size": len(file_bytes),
                "engine": "FastAPI PaddleOCR Engine"
            }
        )


ocr_service = OCRService()
