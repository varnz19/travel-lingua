import base64
from typing import List
from app.schemas.practice import PronunciationResponse, WordScore
from app.services.ml.pronunciation.gop_calculator import evaluate_pronunciation


class PronunciationService:
    async def assess_pronunciation(self, target_text: str, language: str, audio_data: str) -> PronunciationResponse:
        """
        Pronunciation assessment pipeline integration layer.
        Connects audio bytes to Person 3's ML acoustic model (Wav2Vec + GOP).
        Returns detailed word-level accuracy scores and mispronounced phonemes.
        """
        try:
            audio_bytes = base64.b64decode(audio_data) if audio_data else b""
        except Exception:
            audio_bytes = audio_data.encode("utf-8") if audio_data else b""

        # Person 3 ML inference invocation
        ml_result = evaluate_pronunciation(audio_bytes, target_text)

        return PronunciationResponse(
            target_text=target_text,
            language=language,
            overall_score=ml_result["overall_score"],
            accuracy_rating=ml_result["accuracy_rating"],
            words=[WordScore(word=w["word"], score=w["score"]) for w in ml_result["words"]],
            mispronounced_phonemes=ml_result["mispronounced_phonemes"]
        )


pronunciation_service = PronunciationService()
