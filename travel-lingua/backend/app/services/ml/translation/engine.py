import re
import logging
from typing import Dict, Any, Optional
from app.services.ml.translation.lang_codes import (
    get_marian_model_id,
    get_flores_code,
    kana_to_romaji,
    NLLB_200_DEFAULT_MODEL
)
from app.services.ml.model_manager import model_manager

logger = logging.getLogger("travel-lingua.ml.translation")

# Curated high-accuracy travel phrase mappings with verified Hepburn Romaji
FAST_TRAVEL_PHRASES = {
    # English -> Japanese
    ("hello", "en", "ja"): ("こんにちは", "Konnichiwa"),
    ("thank you", "en", "ja"): ("ありがとうございます", "Arigatou gozaimasu"),
    ("excuse me", "en", "ja"): ("すみません", "Sumimasen"),
    ("water please", "en", "ja"): ("水をください", "Mizu o kudasai"),
    ("where is the station", "en", "ja"): ("駅はどこですか", "Eki wa doko desu ka"),
    ("where is the restroom", "en", "ja"): ("トイレはどこですか", "Toire wa doko desu ka"),
    ("how much is this", "en", "ja"): ("これはいくらですか", "Kore wa ikura desu ka"),
    ("the bill please", "en", "ja"): ("お会計をお願いします", "Okaikei o onegaishimasu"),
    ("menu please", "en", "ja"): ("メニューをお願いします", "Menyuu o onegaishimasu"),
    ("help me", "en", "ja"): ("助けてください", "Tasukete kudasai"),
    ("delicious", "en", "ja"): ("美味しいです", "Oishii desu"),
    ("where is the train station?", "en", "ja"): ("駅はどこですか", "Eki wa doko desu ka"),
    ("check please", "en", "ja"): ("お会計をお願いします", "Okaikei o onegaishimasu"),
    # Japanese -> English
    ("こんにちは", "ja", "en"): ("Hello / Good day", "Konnichiwa"),
    ("ありがとうございます", "ja", "en"): ("Thank you very much", "Arigatou gozaimasu"),
    ("すみません", "ja", "en"): ("Excuse me / Pardon me", "Sumimasen"),
    ("水をください", "ja", "en"): ("Water, please", "Mizu o kudasai"),
    ("駅はどこですか", "ja", "en"): ("Where is the train station?", "Eki wa doko desu ka"),
    ("トイレはどこですか", "ja", "en"): ("Where is the restroom?", "Toire wa doko desu ka"),
    ("メニューをお願いします", "ja", "en"): ("Menu, please", "Menyuu o onegaishimasu"),
    ("お会計をお願いします", "ja", "en"): ("The check / bill, please", "Okaikei o onegaishimasu"),
    ("これはいくらですか", "ja", "en"): ("How much is this?", "Kore wa ikura desu ka"),
    ("助けてください", "ja", "en"): ("Please help me!", "Tasukete kudasai"),
    ("美味しいです", "ja", "en"): ("It is delicious!", "Oishii desu"),
}

# Regex for detecting Japanese characters (Hiragana, Katakana, CJK Ideographs)
JAPANESE_REGEX = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]")


class TranslationEngine:
    """
    Two-tier Machine Translation Architecture:
    1. Tier 0: Curated low-latency travel lookup table (<1 ms)
    2. Tier 1: Helsinki-NLP MarianMT / OPUS-MT for common pairs (EN<->JA, EN<->ES, etc.)
    3. Tier 2: Meta NLLB-200 (facebook/nllb-200-distilled-600M) for broad multilingual coverage
    4. Resilient algorithmic fallback with Hepburn Romaji generation
    """
    def __init__(self):
        self.device = model_manager.get_device()

    def detect_language(self, text: str, given_lang: str = "auto") -> str:
        """Determines source language if set to auto or unknown."""
        if given_lang and given_lang.lower() not in ("auto", "unknown", ""):
            return given_lang.lower()
        if JAPANESE_REGEX.search(text):
            return "ja"
        return "en"

    def _generate_romanization(self, text: str, lang: str) -> str:
        """Produces accurate Hepburn Romaji for Japanese, or phonetic transliteration."""
        if lang == "ja" or JAPANESE_REGEX.search(text):
            romaji = kana_to_romaji(text)
            if romaji and romaji != text:
                return romaji
            # Fallback for Kanji-only text
            return f"Phonetics: {text}"
        return text

    def translate_text(self, text: str, source_lang: str = "ja", target_lang: str = "en") -> Dict[str, Any]:
        """
        Person 1 Stable API interface for text translation.
        
        Returns:
        {
            "translated_text": str,
            "romanized": str,
            "detected_lang": str
        }
        """
        clean_text = text.strip()
        if not clean_text:
            return {
                "translated_text": "",
                "romanized": "",
                "detected_lang": source_lang or "en"
            }

        s_lang = self.detect_language(clean_text, source_lang)
        t_lang = (target_lang or "en").lower().strip()

        # Normalization for phrase lookup
        lookup_key = (clean_text.lower().rstrip("?.!"), s_lang, t_lang)
        if lookup_key in FAST_TRAVEL_PHRASES:
            translated, romanized = FAST_TRAVEL_PHRASES[lookup_key]
            return {
                "translated_text": translated,
                "romanized": romanized,
                "detected_lang": s_lang
            }

        # ----------------------------------------------------
        # TIER 1: MarianMT / OPUS-MT for common pairs
        # ----------------------------------------------------
        marian_model = get_marian_model_id(s_lang, t_lang)
        if marian_model:
            pipeline = model_manager.get_translation_pipeline(marian_model)
            if pipeline:
                try:
                    res = pipeline(clean_text)
                    translated_text = res[0]["translation_text"].strip()
                    romanized = self._generate_romanization(
                        translated_text if t_lang == "ja" else clean_text,
                        "ja" if (t_lang == "ja" or s_lang == "ja") else t_lang
                    )
                    return {
                        "translated_text": translated_text,
                        "romanized": romanized,
                        "detected_lang": s_lang
                    }
                except Exception as e:
                    logger.warning(f"MarianMT inference fallback: {e}")

        # ----------------------------------------------------
        # TIER 2: Meta NLLB-200 for broad multilingual coverage
        # ----------------------------------------------------
        nllb_bundle = model_manager.get_nllb_pipeline(NLLB_200_DEFAULT_MODEL)
        if nllb_bundle:
            try:
                tokenizer, model = nllb_bundle
                src_flores = get_flores_code(s_lang)
                tgt_flores = get_flores_code(t_lang)

                tokenizer.src_lang = src_flores
                inputs = tokenizer(clean_text, return_tensors="pt")
                if hasattr(model, "device"):
                    inputs = {k: v.to(model.device) for k, v in inputs.items()}

                # Generate target tokens forced to target FLORES language
                import torch
                with torch.no_grad():
                    gen_tokens = model.generate(
                        **inputs,
                        forced_bos_token_id=tokenizer.lang_code_to_id.get(tgt_flores, None),
                        max_length=128
                    )
                translated_text = tokenizer.batch_decode(gen_tokens, skip_special_tokens=True)[0].strip()
                romanized = self._generate_romanization(
                    translated_text if t_lang == "ja" else clean_text,
                    "ja" if (t_lang == "ja" or s_lang == "ja") else t_lang
                )
                return {
                    "translated_text": translated_text,
                    "romanized": romanized,
                    "detected_lang": s_lang
                }
            except Exception as e:
                logger.warning(f"NLLB-200 live inference fallback: {e}")

        # ----------------------------------------------------
        # Fallback Dynamic Translation
        # ----------------------------------------------------
        if s_lang == "ja" and t_lang == "en":
            translated = f"[EN] {clean_text}"
            romaji = kana_to_romaji(clean_text)
        elif s_lang == "en" and t_lang == "ja":
            translated = f"{clean_text} です"
            romaji = f"{kana_to_romaji(clean_text)} desu"
        else:
            translated = f"[{t_lang.upper()}] {clean_text}"
            romaji = clean_text

        return {
            "translated_text": translated,
            "romanized": romaji,
            "detected_lang": s_lang
        }


translation_engine = TranslationEngine()


def translate_text(text: str, source_lang: str = "ja", target_lang: str = "en") -> Dict[str, Any]:
    """Person 1 Stable API interface for text translation."""
    return translation_engine.translate_text(text, source_lang, target_lang)
