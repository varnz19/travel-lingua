from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.ocr import OCRExtractResponse
from app.services.ocr_service import ocr_service

router = APIRouter()


@router.post("/extract", response_model=OCRExtractResponse, summary="Extract Text from Image (Camera OCR)")
async def extract_ocr_text(file: UploadFile = File(...)):
    """
    Accepts uploaded image file (JPEG, PNG, WEBP), performs optical character recognition (OCR),
    and returns detected Japanese text alongside English translation.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, WEBP)"
        )
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )
    return await ocr_service.extract_text(contents, file.filename or "uploaded_image.jpg")
