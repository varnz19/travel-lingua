from fastapi import APIRouter, UploadFile, File, HTTPException, status
import io
from PIL import Image
from app.schemas.ocr import OCRExtractResponse
from app.services.ocr_service import ocr_service

router = APIRouter()


@router.post("/extract", response_model=OCRExtractResponse, summary="Extract Text from Image (Camera OCR)")
async def extract_ocr_text(file: UploadFile = File(...)):
    """
    Accepts uploaded image file (JPEG, PNG, WEBP, etc.), performs optical character recognition (OCR),
    and returns detected Japanese/English text alongside automated translation.
    """
    contents = await file.read()
    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    # Verify that contents represent valid image data using Pillow
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file is not a valid image format: {e}"
        )

    return await ocr_service.extract_text(contents, file.filename or "uploaded_image.jpg")
