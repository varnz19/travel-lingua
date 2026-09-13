import logging
from typing import Optional, Any, Dict, Tuple

logger = logging.getLogger("travel-lingua.ml.model_manager")


class ModelManager:
    """
    Singleton & Lazy-Loading Manager for Deep Learning Models.
    Ensures weights are loaded into memory only once and shared across requests.
    Automatically detects Apple Silicon MPS, CUDA, or optimized CPU INT8.
    """
    _device: Optional[str] = None
    _instances: Dict[str, Any] = {}

    @classmethod
    def get_device(cls) -> str:
        """Determines best hardware acceleration backend."""
        if cls._device is None:
            try:
                import torch
                if torch.cuda.is_available():
                    cls._device = "cuda"
                elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                    cls._device = "mps"
                else:
                    cls._device = "cpu"
            except ImportError:
                cls._device = "cpu"
            logger.info(f"ModelManager: Selected hardware acceleration device: '{cls._device}'")
        return cls._device

    @classmethod
    def get_whisper(cls, model_size: str = "base", compute_type: str = "int8"):
        """Lazy load Faster-Whisper singleton instance."""
        cache_key = f"whisper_{model_size}_{compute_type}"
        if cache_key not in cls._instances:
            logger.info(f"Loading Faster-Whisper ({model_size}, {compute_type})...")
            try:
                from faster_whisper import WhisperModel
                # CTranslate2 on Apple Silicon / CPU handles int8 inference efficiently
                cls._instances[cache_key] = WhisperModel(model_size, device="cpu", compute_type=compute_type)
            except Exception as e:
                logger.warning(f"Could not load live Faster-Whisper: {e}. Falling back to simulation mode.")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]

    @classmethod
    def get_translation_pipeline(cls, model_name: str):
        """Lazy load MarianMT translation pipeline singleton."""
        cache_key = f"trans_{model_name}"
        if cache_key not in cls._instances:
            logger.info(f"Loading MarianMT translation model: {model_name}...")
            try:
                from transformers import pipeline
                device = 0 if cls.get_device() == "cuda" else -1
                cls._instances[cache_key] = pipeline("translation", model=model_name, device=device)
            except Exception as e:
                logger.warning(f"Could not load live translation model {model_name}: {e}")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]

    @classmethod
    def get_nllb_pipeline(cls, model_name: str = "facebook/nllb-200-distilled-600M"):
        """Lazy load Meta NLLB-200 translation pipeline singleton."""
        cache_key = f"nllb_{model_name}"
        if cache_key not in cls._instances:
            logger.info(f"Loading NLLB-200 translation model: {model_name}...")
            try:
                from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
                device = "cuda" if cls.get_device() == "cuda" else "cpu"
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
                model.eval()
                cls._instances[cache_key] = (tokenizer, model)
            except Exception as e:
                logger.warning(f"Could not load live NLLB-200 model {model_name}: {e}")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]

    @classmethod
    def get_silero_vad(cls):
        """Lazy load Silero-VAD model singleton for voice activity detection."""
        cache_key = "silero_vad"
        if cache_key not in cls._instances:
            logger.info("Loading Silero-VAD model...")
            try:
                import torch
                model, utils = torch.hub.load(
                    repo_or_dir="snakers4/silero-vad",
                    model="silero_vad",
                    force_reload=False,
                    onnx=False
                )
                cls._instances[cache_key] = (model, utils)
            except Exception as e:
                logger.warning(f"Could not load live Silero-VAD: {e}. Falling back to energy VAD.")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]

    @classmethod
    def get_wav2vec(cls, model_id: str = "facebook/wav2vec2-xlsr-53-espeak-cv-ft"):
        """Lazy load Wav2Vec 2.0 acoustic processor and CTC model singleton."""
        cache_key = f"wav2vec_{model_id}"
        if cache_key not in cls._instances:
            logger.info(f"Loading Wav2Vec 2.0 acoustic model: {model_id}...")
            try:
                from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
                processor = Wav2Vec2Processor.from_pretrained(model_id)
                model = Wav2Vec2ForCTC.from_pretrained(model_id)
                model.eval()
                cls._instances[cache_key] = (processor, model)
            except Exception as e:
                logger.warning(f"Could not load live Wav2Vec model {model_id}: {e}")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]

    @classmethod
    def get_embedding_model(cls, model_name: str = "all-MiniLM-L6-v2"):
        """Lazy load Sentence-Transformers embedding model singleton."""
        cache_key = f"embed_{model_name}"
        if cache_key not in cls._instances:
            logger.info(f"Loading Embedding model: {model_name}...")
            try:
                from sentence_transformers import SentenceTransformer
                cls._instances[cache_key] = SentenceTransformer(model_name)
            except Exception as e:
                logger.warning(f"Could not load live sentence-transformer: {e}")
                cls._instances[cache_key] = None
        return cls._instances[cache_key]


model_manager = ModelManager()
