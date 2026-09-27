import base64
import numpy as np
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.schemas.practice import PronunciationRequest, PronunciationResponse
from app.services.pronunciation_service import pronunciation_service
from app.services.ml.asr.audio_utils import validate_and_standardize_audio, is_speech_active
from app.services.ml.asr.whisper_service import whisper_service

router = APIRouter()


class VoiceDetectRequest(BaseModel):
    audio: str = Field(..., description="Base64 encoded audio payload")
    energy_threshold: Optional[float] = Field(default=0.005, description="RMS energy threshold")


class VoiceDetectResponse(BaseModel):
    is_speech: bool
    energy_rms: float
    duration_samples: int
    vad_model: str
    status: str


class VoiceTranscribeRequest(BaseModel):
    audio: str = Field(..., description="Base64 encoded audio payload")
    language: Optional[str] = Field(default="ja", description="Expected speech language code")


class VoiceTranscribeResponse(BaseModel):
    is_speech: bool
    transcription: str
    language: str
    status: str


def _parse_audio_base64(raw_str: str) -> bytes:
    """Helper to cleanly extract and decode base64 audio regardless of data URL formatting."""
    clean = raw_str.strip()
    if "," in clean:
        clean = clean.split(",", 1)[1]
    missing_padding = len(clean) % 4
    if missing_padding:
        clean += "=" * (4 - missing_padding)
    return base64.b64decode(clean)


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
    Applies Silero-VAD deep neural network to check if incoming audio contains actual human speech.
    """
    try:
        raw_bytes = _parse_audio_base64(request.audio)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 audio payload: {str(e)}"
        )

    audio_array, _ = validate_and_standardize_audio(raw_bytes, target_sample_rate=16000)
    speech_detected = is_speech_active(audio_array)
    rms = float(np.sqrt(np.mean(audio_array ** 2))) if len(audio_array) > 0 else 0.0

    return VoiceDetectResponse(
        is_speech=speech_detected,
        energy_rms=round(rms, 5),
        duration_samples=len(audio_array),
        vad_model="Silero-VAD Neural Model (ONNX)",
        status="speech_detected" if speech_detected else "silence_or_background"
    )


@router.post("/transcribe-voice", response_model=VoiceTranscribeResponse, summary="Voice Speech-to-Text Transcription")
async def transcribe_voice(request: VoiceTranscribeRequest):
    """
    Processes audio through Silero-VAD and Faster-Whisper ASR pipeline.
    """
    try:
        raw_bytes = _parse_audio_base64(request.audio)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 audio payload: {str(e)}"
        )

    audio_array, _ = validate_and_standardize_audio(raw_bytes, target_sample_rate=16000)
    speech_active = is_speech_active(audio_array)

    if not speech_active:
        return VoiceTranscribeResponse(
            is_speech=False,
            transcription="",
            language=request.language or "ja",
            status="no_speech"
        )

    res = whisper_service.transcribe(audio_array, language=request.language or "ja")
    text = res.get("text", "").strip()

    return VoiceTranscribeResponse(
        is_speech=True,
        transcription=text,
        language=res.get("language", request.language or "ja"),
        status="success"
    )
