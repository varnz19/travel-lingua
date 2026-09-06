from typing import Dict

# ISO 639-1 to FLORES-200 language code mappings for NLLB-200
FLORES_200_CODES: Dict[str, str] = {
    "ja": "jpn_Jpan",
    "en": "eng_Latn",
    "ko": "kor_Hang",
    "zh": "zho_Hans",
    "es": "spa_Latn",
    "fr": "fra_Latn",
    "de": "deu_Latn",
    "it": "ita_Latn",
    "th": "tha_Thai",
    "vi": "vie_Latn"
}

# MarianMT Helsinki-NLP models for primary language pairs
MARIAN_MT_MODELS: Dict[tuple, str] = {
    ("en", "ja"): "Helsinki-NLP/opus-mt-en-jap",
    ("ja", "en"): "Helsinki-NLP/opus-mt-jap-en"
}


def get_flores_code(lang_code: str) -> str:
    """Returns FLORES-200 code for NLLB-200."""
    return FLORES_200_CODES.get(lang_code.lower(), "eng_Latn")


def get_marian_model_id(source_lang: str, target_lang: str) -> str:
    """Returns MarianMT model ID if standard pair exists."""
    return MARIAN_MT_MODELS.get((source_lang.lower(), target_lang.lower()), "")
