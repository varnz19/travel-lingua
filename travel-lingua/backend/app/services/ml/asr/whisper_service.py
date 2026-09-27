import io
import os
import logging
import numpy as np
from typing import Optional, Dict, Any, Union
from app.services.ml.model_manager import model_manager
from app.services.ml.asr.audio_utils import validate_and_standardize_audio, is_speech_active

logger = logging.getLogger("travel-lingua.ml.asr")


class WhisperASRService:
    def __init__(self, model_size: str = "tiny"):
        self.model_size = model_size

    def transcribe_audio(
        self,
        audio_input: Union[bytes, str, np.ndarray],
        language: Optional[str] = "ja"
    ) -> str:
        """
        Transcribes incoming audio bytes, file path, or numpy array using Faster-Whisper (CTranslate2 INT8).
        Uses Silero-VAD to filter non-speech and reduce Whisper hallucinations.
        """
        result = self.transcribe(audio_input, language=language)
        return result.get("text", "")

    def transcribe(
        self,
        audio_input: Union[bytes, str, np.ndarray],
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Full transcription method returning recognized text, detected language, and VAD status.
        """
        if audio_input is None:
            return {"text": "", "language": language or "en", "vad_active": False}

        # 1. Process audio input into standardize array or file
        audio_for_transcription = None
        audio_array = None

        if isinstance(audio_input, str) and os.path.exists(audio_input):
            # File path on disk
            audio_for_transcription = audio_input
            vad_active = True
        elif isinstance(audio_input, np.ndarray):
            audio_array = audio_input
            vad_active = is_speech_active(audio_array)
            audio_for_transcription = audio_array
        elif isinstance(audio_input, bytes):
            if len(audio_input) == 0:
                return {"text": "", "language": language or "en", "vad_active": False}
            audio_array, _ = validate_and_standardize_audio(audio_input, target_sample_rate=16000)
            vad_active = is_speech_active(audio_array)
            audio_for_transcription = audio_array
        else:
            return {"text": "", "language": language or "en", "vad_active": False}

        # 2. Silero Voice Activity Detection check
        if not vad_active:
            logger.debug("Silero-VAD: Non-speech or silence detected. Skipping transcription.")
            return {"text": "", "language": language or "en", "vad_active": False}

        # 3. Faster-Whisper Neural Inference via CTranslate2
        whisper_model = model_manager.get_whisper(model_size=self.model_size, compute_type="int8")
        if whisper_model:
            try:
                lang_param = None if (language in (None, "auto", "unknown", "")) else language
                segments, info = whisper_model.transcribe(
                    audio_for_transcription,
                    language=lang_param,
                    beam_size=3,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=400)
                )
                transcribed_text = " ".join([segment.text.strip() for segment in segments]).strip()
                detected_lang = info.language if info else (language or "en")
                return {
                    "text": transcribed_text,
                    "language": detected_lang,
                    "vad_active": True
                }
            except Exception as e:
                logger.error(f"Faster-Whisper live inference error: {e}")
                return {"text": "", "language": language or "en", "vad_active": True, "error": str(e)}

        return {"text": "", "language": language or "en", "vad_active": False}


whisper_service = WhisperASRService()


def transcribe_audio_chunk(audio_bytes: bytes, language: str = "ja") -> str:
    """Stable API interface for speech-to-text transcription."""
    return whisper_service.transcribe_audio(audio_bytes, language=language)


def transcribe_audio(audio_bytes: bytes, language: str = "ja") -> str:
    """Alternative import alias for speech-to-text."""
    return whisper_service.transcribe_audio(audio_bytes, language=language)

