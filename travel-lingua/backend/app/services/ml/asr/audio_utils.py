import io
import wave
import logging
import numpy as np
from typing import Tuple
from app.services.ml.model_manager import model_manager

logger = logging.getLogger("travel-lingua.ml.asr.audio_utils")


def validate_and_standardize_audio(audio_bytes: bytes, target_sample_rate: int = 16000) -> Tuple[np.ndarray, int]:
    """
    Standardizes raw input audio to 16 kHz, single-channel (mono), float32 linear PCM [-1.0, 1.0].
    Strictly compatible with Faster-Whisper, Wav2Vec 2.0, and Silero-VAD models.
    """
    try:
        # Attempt to parse as standard WAV container
        with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
            channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            frame_rate = wf.getframerate()
            frames = wf.readframes(wf.getnframes())

            if sample_width == 2:
                dtype = np.int16
            elif sample_width == 4:
                dtype = np.int32
            else:
                dtype = np.uint8

            audio_data = np.frombuffer(frames, dtype=dtype).astype(np.float32)

            # Convert multi-channel to single-channel mono
            if channels > 1:
                audio_data = audio_data.reshape(-1, channels).mean(axis=1)

            # Normalize to [-1.0, 1.0]
            max_val = float(np.iinfo(dtype).max if dtype != np.uint8 else 255)
            audio_data = audio_data / max_val

            # Resample to 16kHz if needed
            if frame_rate != target_sample_rate and frame_rate > 0:
                indices = np.round(np.arange(0, len(audio_data), frame_rate / target_sample_rate)).astype(int)
                indices = indices[indices < len(audio_data)]
                audio_data = audio_data[indices]

            return audio_data, target_sample_rate

    except Exception:
        # Fallback for raw linear PCM bytes (e.g. from WebSocket chunks)
        if len(audio_bytes) % 2 != 0:
            audio_bytes = audio_bytes[:len(audio_bytes) - (len(audio_bytes) % 2)]
        if len(audio_bytes) == 0:
            return np.zeros(1600, dtype=np.float32), target_sample_rate
        data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        return data, target_sample_rate


def is_speech_active_energy(audio_array: np.ndarray, energy_threshold: float = 0.005) -> bool:
    """
    Lightweight energy-based VAD filter.
    Calculates Root Mean Square (RMS) energy.
    """
    if len(audio_array) == 0:
        return False
    rms = np.sqrt(np.mean(audio_array ** 2))
    return bool(rms > energy_threshold)


def is_speech_active(audio_array: np.ndarray, threshold: float = 0.5) -> bool:
    """
    Voice Activity Detection pipeline:
    1. Uses Silero-VAD deep neural network when available to filter background noise
       and prevent Whisper hallucinations during silent intervals.
    2. Falls back cleanly to calibrated RMS energy check.
    """
    if len(audio_array) == 0:
        return False

    silero_bundle = model_manager.get_silero_vad()
    if silero_bundle is not None:
        try:
            import torch
            model, utils = silero_bundle
            get_speech_timestamps = utils[0]
            wav_tensor = torch.from_numpy(audio_array).float()
            speech_timestamps = get_speech_timestamps(
                wav_tensor,
                model,
                sampling_rate=16000,
                threshold=threshold
            )
            return len(speech_timestamps) > 0
        except Exception as e:
            logger.debug(f"Silero-VAD inference exception ({e}), falling back to RMS energy.")

    return is_speech_active_energy(audio_array)
