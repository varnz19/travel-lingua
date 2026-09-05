from fastapi import APIRouter, HTTPException, status
from app.schemas.translation import TranslationRequest, TranslationResponse
from app.services.translation_service import translation_service

router = APIRouter()


@router.post("", response_model=TranslationResponse, summary="Translate Text")
async def translate_text(request: TranslationRequest):
    """
    Translates text between Japanese and English.
    Checks Redis cache before invoking translation service.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input text cannot be empty"
        )
    return await translation_service.translate_text(
        text=request.text,
        source_lang=request.source_lang,
        target_lang=request.target_lang
    )
