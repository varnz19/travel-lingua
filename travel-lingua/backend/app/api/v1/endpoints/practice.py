from fastapi import APIRouter, HTTPException, status
from app.schemas.practice import PronunciationRequest, PronunciationResponse
from app.services.pronunciation_service import pronunciation_service

router = APIRouter()


@router.post("/score-pronunciation", response_model=PronunciationResponse, summary="Score Pronunciation Accuracy")
async def score_pronunciation(request: PronunciationRequest):
    """
    Receives target sentence, language, and audio payload.
    Evaluates acoustic accuracy and returns per-word breakdown.
    """
    if not request.target_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_text cannot be empty"
        )
    return await pronunciation_service.assess_pronunciation(
        target_text=request.target_text,
        language=request.language,
        audio_data=request.audio
    )
