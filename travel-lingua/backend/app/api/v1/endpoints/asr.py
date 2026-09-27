import io
import base64
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel, Field
from app.services.ml.asr.whisper_service import whisper_service
from app.services.ml.asr.audio_utils import validate_and_standardize_audio, is_speech_active

logger = logging.getLogger("travel-lingua.api.asr")

router = APIRouter()


class ASRBase64Request(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio (WAV, MP3, WebM, PCM)")
    language: Optional[str] = Field("auto", description="ISO 639-1 language code or 'auto'")


class ASRResponse(BaseModel):
    text: str
    language: str
    vad_active: bool
    status: str = "success"


class VADCheckRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio chunk")
    threshold: Optional[float] = Field(0.5, description="VAD confidence threshold (0.1 - 0.9)")


class VADCheckResponse(BaseModel):
    is_speech: bool
    status: str = "success"


@router.post("/transcribe", response_model=ASRResponse)
async def transcribe_audio_endpoint(payload: ASRBase64Request):
    """
    Real-time Speech-to-Text (ASR) powered by Faster-Whisper (CTranslate2 INT8)
    and Silero-VAD ONNX.
    Accepts JSON with base64 audio.
    """
    if not payload.audio_base64:
        raise HTTPException(status_code=400, detail="audio_base64 payload must be provided")

    try:
        raw_b64 = payload.audio_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        audio_bytes = base64.b64decode(raw_b64)
        lang_code = payload.language or "auto"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 audio: {e}")

    if not audio_bytes or len(audio_bytes) < 100:
        return ASRResponse(text="", language=lang_code, vad_active=False)

    try:
        result = whisper_service.transcribe(audio_bytes, language=lang_code)
        return ASRResponse(
            text=result.get("text", ""),
            language=result.get("language", lang_code),
            vad_active=result.get("vad_active", False)
        )
    except Exception as e:
        logger.error(f"ASR transcription endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcribe-file", response_model=ASRResponse)
async def transcribe_file_endpoint(
    file: UploadFile = File(...),
    language: Optional[str] = Form("auto")
):
    """
    Real-time Speech-to-Text (ASR) accepting multipart audio file upload (WAV, MP3, WebM, OGG).
    """
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read audio file: {e}")

    lang_code = language or "auto"
    if not audio_bytes or len(audio_bytes) < 100:
        return ASRResponse(text="", language=lang_code, vad_active=False)

    try:
        result = whisper_service.transcribe(audio_bytes, language=lang_code)
        return ASRResponse(
            text=result.get("text", ""),
            language=result.get("language", lang_code),
            vad_active=result.get("vad_active", False)
        )
    except Exception as e:
        logger.error(f"ASR file transcription endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/detect-voice", response_model=VADCheckResponse)
async def detect_voice_endpoint(request: VADCheckRequest):
    """
    Real Neural Voice Activity Detection (VAD) via Silero-VAD ONNX.
    Determines if actual human speech is present in the audio buffer.
    """
    try:
        raw_b64 = request.audio_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        audio_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {e}")

    audio_array, _ = validate_and_standardize_audio(audio_bytes, target_sample_rate=16000)
    has_speech = is_speech_active(audio_array, threshold=request.threshold or 0.5)

    return VADCheckResponse(is_speech=has_speech)
