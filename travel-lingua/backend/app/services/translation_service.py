import json
import logging
from typing import Optional
from app.core.redis_client import redis_service
from app.schemas.translation import TranslationResponse
from app.services.ml.translation.engine import translate_text as ml_translate

logger = logging.getLogger("travel-lingua.services.translation")


class TranslationService:
    @staticmethod
    def _get_cache_key(text: str, source: str, target: str) -> str:
        return f"trans:{source.lower()}:{target.lower()}:{text.strip().lower()}"

    async def get_cached_translation(self, text: str, source: str, target: str) -> Optional[TranslationResponse]:
        try:
            cache_key = self._get_cache_key(text, source, target)
            cached_data = redis_service.get_cache(cache_key)
            if cached_data:
                data = json.loads(cached_data)
                return TranslationResponse(
                    text=text,
                    source_lang=source,
                    target_lang=target,
                    translated_text=data["translated_text"],
                    pronunciation=data.get("pronunciation"),
                    cached=True
                )
        except Exception as e:
            logger.debug(f"Redis cache lookup failed: {e}")
        return None

    async def set_cached_translation(
        self,
        text: str,
        source: str,
        target: str,
        translated_text: str,
        pronunciation: Optional[str]
    ):
        try:
            cache_key = self._get_cache_key(text, source, target)
            payload = json.dumps({
                "translated_text": translated_text,
                "pronunciation": pronunciation
            })
            redis_service.set_cache(cache_key, payload, ttl_seconds=86400)  # 24 hours TTL
        except Exception as e:
            logger.debug(f"Redis cache write failed: {e}")

    async def translate_text(
        self,
        text: str,
        source_lang: str = "ja",
        target_lang: str = "en"
    ) -> TranslationResponse:
        clean_text = text.strip()

        # 1. Check Redis / In-Memory Cache
        cached_response = await self.get_cached_translation(clean_text, source_lang, target_lang)
        if cached_response:
            return cached_response

        # 2. Execute Person 3 ML Translation Engine Pipeline (MarianMT / NLLB-200 / Kana Romaji)
        ml_result = ml_translate(clean_text, source_lang=source_lang, target_lang=target_lang)
        trans_text = ml_result.get("translated_text", "")
        pronunciation = ml_result.get("romanized", "")
        detected_lang = ml_result.get("detected_lang", source_lang)

        # 3. Store into Redis Cache
        await self.set_cached_translation(clean_text, source_lang, target_lang, trans_text, pronunciation)

        return TranslationResponse(
            text=clean_text,
            source_lang=detected_lang,
            target_lang=target_lang,
            translated_text=trans_text,
            pronunciation=pronunciation,
            cached=False
        )


translation_service = TranslationService()
