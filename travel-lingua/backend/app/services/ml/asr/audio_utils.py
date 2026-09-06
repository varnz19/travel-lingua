import io
import wave
import numpy as np
from typing import Tuple


def validate_and_standardize_audio(audio_bytes: bytes, target_sample_rate: int = 16000) -> Tuple[np.ndarray, int]:
    """
    Standardizes raw input audio to 16 kHz, single-channel (mono), float32 linear PCM.
    Compatible with Faster-Whisper and Wav2Vec 2.0 acoustic models.
    """
    try:
        # Attempt to read as standard WAV
        with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
            channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            frame_rate = wf.getframerate()
            frames = wf.readframes(wf.getnframes())

            # Convert to numpy array based on bit depth
            if sample_width == 2:
                dtype = np.int16
            elif sample_width == 4:
                dtype = np.int32
            else:
                dtype = np.uint8

            audio_data = np.frombuffer(frames, dtype=dtype).astype(np.float32)

            # Convert stereo/multi-channel to mono
            if channels > 1:
                audio_data = audio_data.reshape(-1, channels).mean(axis=1)

            # Normalize to [-1.0, 1.0]
            max_val = float(np.iinfo(dtype).max if dtype != np.uint8 else 255)
            audio_data = audio_data / max_val

            # Basic resampling to 16kHz if needed
            if frame_rate != target_sample_rate and frame_rate > 0:
                indices = np.round(np.arange(0, len(audio_data), frame_rate / target_sample_rate)).astype(int)
                indices = indices[indices < len(audio_data)]
                audio_data = audio_data[indices]

            return audio_data, target_sample_rate

    except Exception:
        # Fallback: Align to 16-bit boundary and convert to float32
        if len(audio_bytes) % 2 != 0:
            audio_bytes = audio_bytes[:len(audio_bytes) - (len(audio_bytes) % 2)]
        if len(audio_bytes) == 0:
            return np.zeros(1600, dtype=np.float32), target_sample_rate
        data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        return data, target_sample_rate


def is_speech_active(audio_array: np.ndarray, energy_threshold: float = 0.01) -> bool:
    """
    Lightweight Voice Activity Detection (VAD) energy filter.
    Filters ambient silence to prevent Whisper hallucinations.
    """
    if len(audio_array) == 0:
        return False
    energy = np.mean(audio_array ** 2)
    return energy > energy_threshold
