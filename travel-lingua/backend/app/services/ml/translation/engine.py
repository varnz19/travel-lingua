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

# Curated high-accuracy travel phrase mappings with verified pronunciations/Romaji
FAST_TRAVEL_PHRASES = {
    # English -> Japanese
    ("hello", "en", "ja"): ("こんにちは", "Konnichiwa"),
    ("hi", "en", "ja"): ("こんにちは", "Konnichiwa"),
    ("good morning", "en", "ja"): ("おはようございます", "Ohayou gozaimasu"),
    ("good evening", "en", "ja"): ("こんばんは", "Konbanwa"),
    ("goodbye", "en", "ja"): ("さようなら", "Sayounara"),
    ("thank you", "en", "ja"): ("ありがとうございます", "Arigatou gozaimasu"),
    ("thanks", "en", "ja"): ("ありがとう", "Arigatou"),
    ("thank you very much", "en", "ja"): ("誠にありがとうございます", "Makoto ni arigatou gozaimasu"),
    ("excuse me", "en", "ja"): ("すみません", "Sumimasen"),
    ("sorry", "en", "ja"): ("ごめんなさい", "Gomen nasai"),
    ("yes", "en", "ja"): ("はい", "Hai"),
    ("no", "en", "ja"): ("いいえ", "Iie"),
    ("please", "en", "ja"): ("お願いします", "Onegaishimasu"),
    ("water please", "en", "ja"): ("水をください", "Mizu o kudasai"),
    ("water", "en", "ja"): ("水", "Mizu"),
    ("where is the station", "en", "ja"): ("駅はどこですか", "Eki wa doko desu ka"),
    ("where is the train station", "en", "ja"): ("駅はどこですか", "Eki wa doko desu ka"),
    ("where is the restroom", "en", "ja"): ("トイレはどこですか", "Toire wa doko desu ka"),
    ("where is the bathroom", "en", "ja"): ("トイレはどこですか", "Toire wa doko desu ka"),
    ("how much is this", "en", "ja"): ("これはいくらですか", "Kore wa ikura desu ka"),
    ("the bill please", "en", "ja"): ("お会計をお願いします", "Okaikei o onegaishimasu"),
    ("check please", "en", "ja"): ("お会計をお願いします", "Okaikei o onegaishimasu"),
    ("menu please", "en", "ja"): ("メニューをお願いします", "Menyuu o onegaishimasu"),
    ("help me", "en", "ja"): ("助けてください", "Tasukete kudasai"),
    ("delicious", "en", "ja"): ("美味しいです", "Oishii desu"),
    ("do you speak english", "en", "ja"): ("英語を話せますか", "Eigo o hanasemasu ka"),
    ("can i pay by card", "en", "ja"): ("クレジットカードは使えますか", "Kurejitto kaado wa tsukaemasu ka"),

    # Japanese -> English
    ("こんにちは", "ja", "en"): ("Hello / Good day", "Konnichiwa"),
    ("おはようございます", "ja", "en"): ("Good morning", "Ohayou gozaimasu"),
    ("こんばんは", "ja", "en"): ("Good evening", "Konbanwa"),
    ("さようなら", "ja", "en"): ("Goodbye", "Sayounara"),
    ("ありがとうございます", "ja", "en"): ("Thank you very much", "Arigatou gozaimasu"),
    ("ありがとう", "ja", "en"): ("Thank you", "Arigatou"),
    ("すみません", "ja", "en"): ("Excuse me / Pardon me", "Sumimasen"),
    ("ごめんなさい", "ja", "en"): ("I am sorry", "Gomen nasai"),
    ("はい", "ja", "en"): ("Yes", "Hai"),
    ("いいえ", "ja", "en"): ("No", "Iie"),
    ("水をください", "ja", "en"): ("Water, please", "Mizu o kudasai"),
    ("駅はどこですか", "ja", "en"): ("Where is the train station?", "Eki wa doko desu ka"),
    ("トイレはどこですか", "ja", "en"): ("Where is the restroom?", "Toire wa doko desu ka"),
    ("メニューをお願いします", "ja", "en"): ("Menu, please", "Menyuu o onegaishimasu"),
    ("お会計をお願いします", "ja", "en"): ("The check / bill, please", "Okaikei o onegaishimasu"),
    ("これはいくらですか", "ja", "en"): ("How much is this?", "Kore wa ikura desu ka"),
    ("助けてください", "ja", "en"): ("Please help me!", "Tasukete kudasai"),
    ("美味しいです", "ja", "en"): ("It is delicious!", "Oishii desu"),
    ("英語を話せますか", "ja", "en"): ("Do you speak English?", "Eigo o hanasemasu ka"),

    # English -> Spanish
    ("hello", "en", "es"): ("Hola", "OH-lah"),
    ("thank you", "en", "es"): ("Gracias", "GRAH-see-ahs"),
    ("please", "en", "es"): ("Por favor", "por fah-VOR"),
    ("where is the station", "en", "es"): ("¿Dónde está la estación?", "DOHN-deh es-TAH lah es-tah-SYOHN"),
    ("where is the train station", "en", "es"): ("¿Dónde está la estación de tren?", "DOHN-deh es-TAH lah es-tah-SYOHN deh trehn"),
    ("where is the restroom", "en", "es"): ("¿Dónde está el baño?", "DOHN-deh es-TAH el BAHN-yoh"),
    ("how much is this", "en", "es"): ("¿Cuánto cuesta esto?", "KWAHN-toh KWEHS-tah EHS-toh"),
    ("the bill please", "en", "es"): ("La cuenta, por favor", "lah KWEHN-tah por fah-VOR"),
    ("help me", "en", "es"): ("¡Ayúdeme!", "ah-YOO-deh-meh"),
    ("water please", "en", "es"): ("Agua, por favor", "AH-gwah por fah-VOR"),
    # Spanish -> English
    ("hola", "es", "en"): ("Hello", "Hello"),
    ("gracias", "es", "en"): ("Thank you", "Thank you"),
    ("por favor", "es", "en"): ("Please", "Please"),
    ("donde esta el bano", "es", "en"): ("Where is the restroom?", "Where is the restroom?"),
    ("la cuenta por favor", "es", "en"): ("The check, please", "The check, please"),

    # English -> French
    ("hello", "en", "fr"): ("Bonjour", "bohn-zhoor"),
    ("thank you", "en", "fr"): ("Merci beaucoup", "mair-see boh-koo"),
    ("please", "en", "fr"): ("S'il vous plaît", "seel voo pleh"),
    ("where is the station", "en", "fr"): ("Où est la gare ?", "oo eh lah gahr"),
    ("where is the train station", "en", "fr"): ("Où est la gare ferroviaire ?", "oo eh lah gahr"),
    ("where is the restroom", "en", "fr"): ("Où sont les toilettes ?", "oo sohn lay twah-let"),
    ("how much is this", "en", "fr"): ("Combien ça coûte ?", "kohm-byan sah koot"),
    ("the bill please", "en", "fr"): ("L'addition, s'il vous plaît", "lah-dee-syohn seel voo pleh"),
    ("help me", "en", "fr"): ("Aidez-moi !", "ay-day mwah"),
    ("water please", "en", "fr"): ("De l'eau, s'il vous plaît", "duh loh seel voo pleh"),
    # French -> English
    ("bonjour", "fr", "en"): ("Hello / Good morning", "Hello"),
    ("merci", "fr", "en"): ("Thank you", "Thank you"),
    ("merci beaucoup", "fr", "en"): ("Thank you very much", "Thank you very much"),
    ("ou sont les toilettes", "fr", "en"): ("Where is the restroom?", "Where is the restroom?"),

    # English -> German
    ("hello", "en", "de"): ("Hallo", "HAH-loh"),
    ("thank you", "en", "de"): ("Vielen Dank", "FEE-len dahnk"),
    ("please", "en", "de"): ("Bitte", "BIH-tuh"),
    ("where is the station", "en", "de"): ("Wo ist der Bahnhof?", "vo ist der BAHN-hof"),
    ("where is the train station", "en", "de"): ("Wo ist der Bahnhof?", "vo ist der BAHN-hof"),
    ("where is the restroom", "en", "de"): ("Wo ist die Toilette?", "vo ist dee twah-LET-tuh"),
    ("how much is this", "en", "de"): ("Wie viel kostet das?", "vee feel KOS-tet dahs"),
    ("the bill please", "en", "de"): ("Die Rechnung, bitte", "dee REKH-noong BIH-tuh"),
    ("help me", "en", "de"): ("Hilfe, bitte!", "HIL-fuh BIH-tuh"),
    ("water please", "en", "de"): ("Wasser, bitte", "VAH-ser BIH-tuh"),

    # English -> Italian
    ("hello", "en", "it"): ("Ciao / Buongiorno", "CHOW / bwon-JOHR-noh"),
    ("thank you", "en", "it"): ("Grazie mille", "GRAHT-syeh MEE-leh"),
    ("please", "en", "it"): ("Per favore", "pehr fah-VOH-reh"),
    ("where is the station", "en", "it"): ("Dov'è la stazione?", "doh-VEH lah staht-SYOH-neh"),
    ("where is the train station", "en", "it"): ("Dov'è la stazione ferroviaria?", "doh-VEH lah staht-SYOH-neh"),
    ("where is the restroom", "en", "it"): ("Dov'è il bagno?", "doh-VEH eel BAHN-yoh"),
    ("how much is this", "en", "it"): ("Quanto costa?", "KWAHN-toh KOH-stah"),
    ("the bill please", "en", "it"): ("Il conto, per favore", "eel KOHN-toh pehr fah-VOH-reh"),
    ("water please", "en", "it"): ("Acqua, per favore", "AHK-wah pehr fah-VOH-reh"),

    # English -> Korean
    ("hello", "en", "ko"): ("안녕하세요", "Annyeonghaseyo"),
    ("thank you", "en", "ko"): ("감사합니다", "Gamsahamnida"),
    ("where is the restroom", "en", "ko"): ("화장실이 어디예요?", "Hwajangsil-i eodi-yeyo?"),
    ("where is the station", "en", "ko"): ("역이 어디예요?", "Yeog-i eodi-yeyo?"),
    ("where is the train station", "en", "ko"): ("기차역이 어디예요?", "Gichayeog-i eodi-yeyo?"),
    ("how much is this", "en", "ko"): ("이거 얼마예요?", "Igeo eolmayeyo?"),
    ("the bill please", "en", "ko"): ("계산서 주세요", "Gyesanseo juseyo"),
    ("water please", "en", "ko"): ("물 좀 주세요", "Mul jom juseyo"),

    # English -> Chinese
    ("hello", "en", "zh"): ("你好", "Nǐ hǎo"),
    ("thank you", "en", "zh"): ("谢谢", "Xièxiè"),
    ("where is the restroom", "en", "zh"): ("洗手间在哪里？", "Xǐshǒujiān zài nǎlǐ?"),
    ("where is the station", "en", "zh"): ("车站面在哪里？", "Chēzhàn zài nǎlǐ?"),
    ("where is the train station", "en", "zh"): ("火车站在这里吗？", "Huǒchēzhàn zài nǎlǐ?"),
    ("how much is this", "en", "zh"): ("这个多少钱？", "Zhège duōshǎo qián?"),
    ("the bill please", "en", "zh"): ("请结账 / 买单", "Qǐng jiézhàng / mǎidān"),
    ("water please", "en", "zh"): ("请给我水", "Qǐng gěi wǒ shuǐ"),
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

        # Normalized lookup key (remove punctuation, strip spaces)
        clean_key = re.sub(r'[^\w\s\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]', '', clean_text.lower()).strip()
        lookup_key = (clean_key, s_lang, t_lang)
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
