import base64
import hashlib
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel, Field
from typing import Optional
from app.services.ml.tts.piper_service import synthesize_speech
from app.core.redis_client import redis_service

router = APIRouter()


class TTSRequest(BaseModel):
    text: str = Field(..., description="Text to synthesize")
    language: str = Field(default="ja", description="Language code (ja, en, es, fr, de, it, ko, zh)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech rate multiplier (0.5 to 2.0)")


class TTSResponse(BaseModel):
    text: str
    language: str
    audio_base64: str
    format: str = "audio/wav"
    sample_rate: int = 16000
    cached: bool = False


@router.post("/synthesize", response_model=TTSResponse, summary="Synthesize Text-to-Speech")
async def tts_synthesize(req: TTSRequest):
    """
    Synthesizes speech from text in the requested language.
    Returns base64-encoded WAV audio data, cached via Redis.
    """
    clean_text = req.text.strip()
    if not clean_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty")

    cache_hash = hashlib.md5(f"{clean_text}:{req.language}:{req.speed}".encode("utf-8")).hexdigest()
    cache_key = f"tts:{req.language}:{cache_hash}"

    # Check cache
    cached_b64 = redis_service.get_cache(cache_key)
    if cached_b64:
        return TTSResponse(
            text=clean_text,
            language=req.language,
            audio_base64=cached_b64,
            cached=True
        )

    # Synthesize
    wav_bytes = synthesize_speech(
        text=clean_text,
        language=req.language,
        sample_rate=16000,
        speed_multiplier=req.speed
    )

    audio_b64 = base64.b64encode(wav_bytes).decode("ascii")

    # Save to Redis cache (24 hours TTL)
    redis_service.set_cache(cache_key, audio_b64, ttl_seconds=86400)

    return TTSResponse(
        text=clean_text,
        language=req.language,
        audio_base64=audio_b64,
        cached=False
    )


@router.get("/stream", summary="Stream Raw WAV Audio for direct browser playback")
async def tts_stream(
    text: str = Query(..., description="Text to speak"),
    language: str = Query(default="ja", description="Language code"),
    speed: float = Query(default=1.0, description="Speech rate multiplier")
):
    """
    Streams raw 16-bit 16kHz WAV audio directly for HTML5 audio tags or Expo Audio playback.
    """
    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty")

    wav_bytes = synthesize_speech(
        text=clean_text,
        language=language,
        sample_rate=16000,
        speed_multiplier=speed
    )

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={
            "Content-Disposition": f'inline; filename="tts_{language}.wav"',
            "Cache-Control": "public, max-age=86400"
        }
    )
