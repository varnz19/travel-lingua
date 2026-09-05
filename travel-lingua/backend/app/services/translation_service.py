import json
import logging
from typing import Optional, Tuple
import redis
from app.core.config import settings
from app.schemas.translation import TranslationResponse

logger = logging.getLogger("travel-lingua.services.translation")

# Optional Redis connection with fallback resilience
redis_client: Optional[redis.Redis] = None
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=1)
except Exception as e:
    logger.warning(f"Redis initialization warning: {e}. Falling back to in-memory/no-cache mode.")


# Pre-baked Travel Phrase Dictionary for ultra-fast offline/mock responses
TRANSLATION_DICTIONARY = {
    ("こんにちは", "ja", "en"): ("Hello / Good afternoon", "kohn-nee-chee-wah"),
    ("ありがとうございます", "ja", "en"): ("Thank you very much", "ah-ree-gah-toh goh-zah-ee-mahs"),
    ("すみません", "ja", "en"): ("Excuse me / Pardon me", "soo-mee-mah-sehn"),
    ("水をください", "ja", "en"): ("Water, please", "mee-zoo oh koo-dah-sah-ee"),
    ("駅はどこですか", "ja", "en"): ("Where is the train station?", "eh-kee wa doh-koh des-ka"),
    ("トイレはどこですか", "ja", "en"): ("Where is the restroom?", "toy-reh wa doh-koh des-ka"),
    ("メニューをお願いします", "ja", "en"): ("Menu, please", "meh-nyoo oh oh-neh-gah-ee-shee-mahs"),
    ("お会計をお願いします", "ja", "en"): ("The bill / check, please", "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs"),
    ("助けてください", "ja", "en"): ("Please help me!", "tah-soo-keh-teh koo-dah-sah-ee"),
    ("これはいくらですか", "ja", "en"): ("How much is this?", "koh-reh wa ee-koo-rah des-ka"),
}


class TranslationService:
    @staticmethod
    def _get_cache_key(text: str, source: str, target: str) -> str:
        return f"trans:{source}:{target}:{text.strip().lower()}"

    async def get_cached_translation(self, text: str, source: str, target: str) -> Optional[TranslationResponse]:
        if not redis_client:
            return None
        try:
            cache_key = self._get_cache_key(text, source, target)
            cached_data = redis_client.get(cache_key)
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
            logger.debug(f"Redis lookup failed: {e}")
        return None

    async def set_cached_translation(self, text: str, source: str, target: str, translated_text: str, pronunciation: Optional[str]):
        if not redis_client:
            return
        try:
            cache_key = self._get_cache_key(text, source, target)
            payload = json.dumps({"translated_text": translated_text, "pronunciation": pronunciation})
            redis_client.setex(cache_key, 86400, payload)  # Cache for 24 hours
        except Exception as e:
            logger.debug(f"Redis write failed: {e}")

    async def translate_text(self, text: str, source_lang: str = "ja", target_lang: str = "en") -> TranslationResponse:
        # 1. Check Redis Cache
        cached_response = await self.get_cached_translation(text, source_lang, target_lang)
        if cached_response:
            return cached_response

        # 2. Check Local Dictionary / ML Inference Layer (Person 3 Integration hook)
        clean_text = text.strip()
        dict_match = TRANSLATION_DICTIONARY.get((clean_text, source_lang.lower(), target_lang.lower()))

        if dict_match:
            trans_text, pron = dict_match
        else:
            # Fallback dynamic translation mock
            if source_lang.lower() == "ja":
                trans_text = f"[Translated to English] {clean_text}"
                pron = f"Phonetics for: {clean_text}"
            else:
                trans_text = f"{clean_text} です (Desu)"
                pron = f"Phonetics for: {clean_text}"

        # 3. Save to Redis Cache
        await self.set_cached_translation(text, source_lang, target_lang, trans_text, pron)

        return TranslationResponse(
            text=text,
            source_lang=source_lang,
            target_lang=target_lang,
            translated_text=trans_text,
            pronunciation=pron,
            cached=False
        )


translation_service = TranslationService()
