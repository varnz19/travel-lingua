import io
import wave
import pytest
from app.services.ml.translation.engine import translate_text
from app.services.ml.asr.whisper_service import transcribe_audio_chunk, transcribe_audio
from app.services.ml.pronunciation.gop_calculator import evaluate_pronunciation
from app.services.ml.roleplay.agent import generate_roleplay_reply
from app.services.ml.tts.piper_service import synthesize_speech
from app.services.ml.ocr.paddle_ocr_service import extract_image_text
from app.services.ml.embeddings.vectorizer import generate_phrase_vector


def test_translation_engine_phrases():
    # 1. Fast curated travel phrase
    res = translate_text("Where is the station", source_lang="en", target_lang="ja")
    assert "translated_text" in res
    assert "romanized" in res
    assert "detected_lang" in res
    assert res["detected_lang"] == "en"
    assert "駅" in res["translated_text"]
    assert "Eki" in res["romanized"]

    # 2. Japanese to English
    res_ja = translate_text("こんにちは", source_lang="ja", target_lang="en")
    assert "Hello" in res_ja["translated_text"]
    assert res_ja["detected_lang"] == "ja"

    # 3. Dynamic English -> Japanese with Hepburn Romaji
    res_dyn = translate_text("coffee please", source_lang="en", target_lang="ja")
    assert res_dyn["translated_text"] != ""
    assert res_dyn["romanized"] != ""


def test_asr_whisper_and_audio_pipeline():
    # Empty audio handling
    empty_res = transcribe_audio_chunk(b"", language="ja")
    assert empty_res == ""

    # Generate 0.5s of simulated 16kHz audio
    mock_audio = bytes(16000)
    res = transcribe_audio_chunk(mock_audio, language="ja")
    assert isinstance(res, str)

    # Test alias import interface
    res_alias = transcribe_audio(mock_audio, language="ja")
    assert isinstance(res_alias, str)


def test_pronunciation_gop_assessment():
    mock_audio = bytes(32000)
    result = evaluate_pronunciation(mock_audio, "Arigatou gozaimasu")

    assert "overall_score" in result
    assert 0.0 <= result["overall_score"] <= 100.0
    assert "accuracy_rating" in result
    assert result["accuracy_rating"] in ("Great", "Good", "Needs Practice")
    assert "words" in result
    assert len(result["words"]) == 2

    # Check word dictionary format
    for word_item in result["words"]:
        assert "word" in word_item
        assert "score" in word_item
        assert "mispronounced" in word_item
        assert isinstance(word_item["score"], float)

    assert "mispronounced_phonemes" in result
    assert isinstance(result["mispronounced_phonemes"], list)


def test_conversational_roleplay_agent():
    # 1. Beginner level
    res_beginner = generate_roleplay_reply(
        scenario_id="restaurant",
        message="Can I see the menu?",
        difficulty="beginner"
    )
    assert "reply" in res_beginner
    assert "feedback_grammar" in res_beginner
    assert "suggested_next_phrases" in res_beginner
    assert len(res_beginner["suggested_next_phrases"]) >= 2

    # 2. Intermediate level
    res_inter = generate_roleplay_reply(
        scenario_id="subway",
        message="Which train goes to Shinjuku?",
        difficulty="intermediate"
    )
    assert "reply" in res_inter
    assert "feedback_grammar" in res_inter
    assert len(res_inter["suggested_next_phrases"]) >= 2


def test_tts_piper_service():
    audio_bytes = synthesize_speech("Konnichiwa", language="ja", sample_rate=16000)
    assert len(audio_bytes) > 44  # WAV header is 44 bytes

    # Verify that it is a valid WAV audio file
    with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
        assert wf.getnchannels() == 1
        assert wf.getsampwidth() == 2
        assert wf.getframerate() == 16000
        assert wf.getnframes() > 0


def test_ocr_paddle_service():
    mock_image = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 200
    res = extract_image_text(mock_image, "menu_photo.jpg")

    assert "extracted_text" in res
    assert "confidence" in res
    assert "bounding_boxes" in res
    assert "orientation" in res
    assert res["orientation"] in ("vertical", "horizontal")
    assert res["file_name"] == "menu_photo.jpg"
    assert res["confidence"] > 0


def test_embeddings_vectorizer():
    phrase = "Where is the nearest subway station?"
    vec = generate_phrase_vector(phrase)

    assert isinstance(vec, list)
    assert len(vec) == 384
    assert all(isinstance(val, float) for val in vec)


def test_semantic_search_embeddings():
    from app.services.ml.embeddings.vectorizer import vectorizer
    corpus = [
        {"phrase": "Where is the restroom / toilet / washroom?", "id": "toilet"},
        {"phrase": "How much does this cost?", "id": "cost"},
        {"phrase": "The check / bill please", "id": "bill"},
    ]
    results = vectorizer.semantic_search("wash hands", corpus, top_k=2)
    assert len(results) > 0
    # Top match should be the restroom phrase
    assert results[0]["id"] == "toilet"
    assert results[0]["similarity_score"] > 0.2


def test_voice_activity_detection():
    from app.services.ml.asr.audio_utils import is_speech_active, validate_and_standardize_audio
    # Test silence (all zeros)
    silence = bytes(32000)
    assert is_speech_active(silence) is False

    # Test standardized audio output shape and type
    norm_audio, sr = validate_and_standardize_audio(silence)
    assert sr == 16000
    assert len(norm_audio) == 16000  # 16000 float samples


