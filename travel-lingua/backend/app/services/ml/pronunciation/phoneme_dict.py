from typing import Dict, List

# Japanese Kana to IPA / Romaji phoneme mappings
JAPANESE_PHONEME_MAP: Dict[str, List[str]] = {
    "あ": ["a"], "い": ["i"], "う": ["u͍"], "え": ["e"], "お": ["o"],
    "か": ["k", "a"], "き": ["kʲ", "i"], "く": ["k", "u͍"], "け": ["k", "e"], "こ": ["k", "o"],
    "さ": ["s", "a"], "し": ["ɕ", "i"], "す": ["s", "u͍"], "せ": ["s", "e"], "そ": ["s", "o"],
    "た": ["t", "a"], "ち": ["t͡ɕ", "i"], "つ": ["t͡s", "u͍"], "て": ["t", "e"], "と": ["t", "o"],
    "な": ["n", "a"], "に": ["ɲ", "i"], "ぬ": ["n", "u͍"], "ね": ["n", "e"], "の": ["n", "o"],
    "は": ["h", "a"], "ひ": ["ç", "i"], "ふ": ["ɸ", "u͍"], "へ": ["h", "e"], "ほ": ["h", "o"],
    "ま": ["m", "a"], "み": ["mʲ", "i"], "む": ["m", "u͍"], "め": ["m", "e"], "も": ["m", "o"],
    "や": ["j", "a"], "ゆ": ["j", "u͍"], "よ": ["j", "o"],
    "ら": ["ɾ", "a"], "り": ["ɾʲ", "i"], "る": ["ɾ", "u͍"], "れ": ["ɾ", "e"], "ろ": ["ɾ", "o"],
    "わ": ["w", "a"], "を": ["o"], "ん": ["ɴ"],
    "が": ["ɡ", "a"], "ぎ": ["ɡʲ", "i"], "ぐ": ["ɡ", "u͍"], "げ": ["ɡ", "e"], "ご": ["ɡ", "o"],
    "ざ": ["z", "a"], "じ": ["d͡ʑ", "i"], "ず": ["z", "u͍"], "ぜ": ["z", "e"], "ぞ": ["z", "o"],
    "だ": ["d", "a"], "で": ["d", "e"], "ど": ["d", "o"],
    "ば": ["b", "a"], "び": ["bʲ", "i"], "ぶ": ["b", "u͍"], "べ": ["b", "e"], "ぼ": ["b", "o"],
    "ぱ": ["p", "a"], "ぴ": ["pʲ", "i"], "ぷ": ["p", "u͍"], "ぺ": ["p", "e"], "ぽ": ["p", "o"],
}


def text_to_phonemes(text: str) -> List[str]:
    """Converts Japanese characters or English romanized letters to target phoneme tokens."""
    phonemes = []
    for char in text.strip():
        if char in JAPANESE_PHONEME_MAP:
            phonemes.extend(JAPANESE_PHONEME_MAP[char])
        elif char.isalnum():
            phonemes.append(char.lower())
    return phonemes if phonemes else ["a"]
