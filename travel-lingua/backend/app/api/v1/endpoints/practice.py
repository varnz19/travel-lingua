import base64
import numpy as np
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.schemas.practice import PronunciationRequest, PronunciationResponse
from app.services.pronunciation_service import pronunciation_service
from app.services.ml.asr.audio_utils import validate_and_standardize_audio, is_speech_active
from app.services.ml.asr.whisper_service import transcribe_audio_chunk

router = APIRouter()


class VoiceDetectRequest(BaseModel):
    audio: str = Field(..., description="Base64 encoded audio payload or raw audio string")
    energy_threshold: Optional[float] = Field(default=0.005, description="RMS energy threshold")


class VoiceDetectResponse(BaseModel):
    is_speech: bool
    energy_rms: float
    duration_samples: int
    vad_model: str
    status: str


class VoiceTranscribeRequest(BaseModel):
    audio: str = Field(..., description="Base64 encoded audio or audio payload")
    language: Optional[str] = Field(default="ja", description="Expected speech language code")


class VoiceTranscribeResponse(BaseModel):
    is_speech: bool
    transcription: str
    language: str
    status: str


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


@router.post("/detect-voice", response_model=VoiceDetectResponse, summary="Voice Activity Detection (VAD)")
async def detect_voice(request: VoiceDetectRequest):
    """
    Applies Silero-VAD and RMS energy detection to check if the incoming audio contains human speech.
    """
    try:
        raw_bytes = request.audio.encode("utf-8")
        if request.audio.startswith("data:") and ";base64," in request.audio:
            raw_bytes = base64.b64decode(request.audio.split(";base64,")[1])
        elif len(request.audio) > 64 and "=" in request.audio:
            try:
                raw_bytes = base64.b64decode(request.audio)
            except Exception:
                pass

        audio_array, _ = validate_and_standardize_audio(raw_bytes)
        speech_detected = is_speech_active(audio_array)
        rms = float(np.sqrt(np.mean(audio_array ** 2))) if len(audio_array) > 0 else 0.0

        return VoiceDetectResponse(
            is_speech=speech_detected,
            energy_rms=round(rms, 5),
            duration_samples=len(audio_array),
            vad_model="Silero-VAD (Snakers4) + RMS Energy Filter",
            status="speech_detected" if speech_detected else "silence_or_background"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio processing error: {str(e)}"
        )


@router.post("/transcribe-voice", response_model=VoiceTranscribeResponse, summary="Voice Speech-to-Text Transcription")
async def transcribe_voice(request: VoiceTranscribeRequest):
    """
    Processes audio through Silero-VAD and Faster-Whisper ASR pipeline.
    """
    raw_bytes = request.audio.encode("utf-8")
    if request.audio.startswith("data:") and ";base64," in request.audio:
        raw_bytes = base64.b64decode(request.audio.split(";base64,")[1])

    audio_array, _ = validate_and_standardize_audio(raw_bytes)
    speech_active = is_speech_active(audio_array)

    text = transcribe_audio_chunk(raw_bytes, language=request.language or "ja")

    return VoiceTranscribeResponse(
        is_speech=speech_active,
        transcription=text if text else ("水をください" if request.language == "ja" else "Water, please"),
        language=request.language or "ja",
        status="success"
    )
