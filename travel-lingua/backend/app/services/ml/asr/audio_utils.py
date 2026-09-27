import io
import wave
import logging
import numpy as np
from typing import Tuple, Union
from app.services.ml.model_manager import model_manager

logger = logging.getLogger("travel-lingua.ml.asr.audio_utils")


def validate_and_standardize_audio(audio_bytes: bytes, target_sample_rate: int = 16000) -> Tuple[np.ndarray, int]:
    """
    Standardizes raw input audio (WAV, MP3, WebM, OGG, AAC, or linear PCM)
    to 16 kHz, single-channel (mono), float32 linear PCM [-1.0, 1.0].
    Strictly compatible with Faster-Whisper, Wav2Vec 2.0, and Silero-VAD models.
    """
    if not audio_bytes or len(audio_bytes) == 0:
        return np.zeros(1600, dtype=np.float32), target_sample_rate

    # 1. Primary: High-fidelity multi-codec decoding via PyAV
    try:
        import av
        container = av.open(io.BytesIO(audio_bytes))
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="fltp", layout="mono", rate=target_sample_rate)
        frames = []
        for frame in container.decode(stream):
            for resampled_frame in resampler.resample(frame):
                frames.append(resampled_frame.to_ndarray())
        if frames:
            audio_data = np.concatenate(frames, axis=1).squeeze(0)
            return audio_data.astype(np.float32), target_sample_rate
    except Exception as av_err:
        logger.debug(f"PyAV decoding bypassed: {av_err}")

    # 2. Secondary: Standard WAV container parsing
    try:
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

            if channels > 1:
                audio_data = audio_data.reshape(-1, channels).mean(axis=1)

            max_val = float(np.iinfo(dtype).max if dtype != np.uint8 else 255)
            audio_data = audio_data / max_val

            if frame_rate != target_sample_rate and frame_rate > 0:
                indices = np.round(np.arange(0, len(audio_data), frame_rate / target_sample_rate)).astype(int)
                indices = indices[indices < len(audio_data)]
                audio_data = audio_data[indices]

            return audio_data, target_sample_rate
    except Exception:
        pass

    # 3. Tertiary: Raw 16-bit linear PCM fallback
    try:
        if len(audio_bytes) % 2 != 0:
            audio_bytes = audio_bytes[:len(audio_bytes) - 1]
        data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        return data, target_sample_rate
    except Exception:
        return np.zeros(1600, dtype=np.float32), target_sample_rate


def is_speech_active_energy(audio_array: Union[np.ndarray, bytes], energy_threshold: float = 0.005) -> bool:
    """
    Lightweight energy-based VAD filter.
    Calculates Root Mean Square (RMS) energy.
    """
    if isinstance(audio_array, bytes):
        audio_array, _ = validate_and_standardize_audio(audio_array)
    if audio_array is None or len(audio_array) == 0:
        return False
    rms = np.sqrt(np.mean(audio_array ** 2))
    return bool(rms > energy_threshold)


def is_speech_active(audio_array: Union[np.ndarray, bytes], threshold: float = 0.5) -> bool:
    """
    Voice Activity Detection pipeline:
    1. Uses official Silero-VAD deep neural network (ONNX Runtime) to filter background noise
       and prevent Whisper hallucinations during silent intervals.
    2. Runs cross-platform on Linux, macOS, Windows, and Docker without requiring PyTorch.
    3. Falls back cleanly to calibrated RMS energy check.
    """
    if isinstance(audio_array, bytes):
        audio_array, _ = validate_and_standardize_audio(audio_array)
    if audio_array is None or len(audio_array) == 0:
        return False

    vad_model = model_manager.get_silero_vad()
    if vad_model is not None:
        try:
            from faster_whisper.vad import get_speech_timestamps, VadOptions
            options = VadOptions(
                threshold=threshold,
                min_speech_duration_ms=100,
                min_silence_duration_ms=150
            )
            speech_timestamps = get_speech_timestamps(audio_array, vad_options=options)
            return len(speech_timestamps) > 0
        except Exception as e:
            logger.debug(f"Silero-VAD ONNX inference exception ({e}), falling back to RMS energy.")

    return is_speech_active_energy(audio_array)
