from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_translate_endpoint():
    payload = {"text": "Arigatou gozaimasu", "source_lang": "ja", "target_lang": "en"}
    response = client.post("/api/v1/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert "pronunciation" in data


def test_practice_pronunciation_endpoint():
    payload = {
        "target_text": "Kore wa nan desu ka?",
        "language": "ja",
        "audio": "base64-mock-audio-data-string"
    }
    response = client.post("/api/v1/practice/score-pronunciation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_text"] == "Kore wa nan desu ka?"
    assert "overall_score" in data
    assert "words" in data


def test_roleplay_chat_endpoint():
    payload = {
        "scenario_id": "restaurant",
        "message": "Can I see the menu?",
        "conversation_history": []
    }
    response = client.post("/api/v1/roleplay/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "suggested_next_phrases" in data


def test_ocr_extract_endpoint():
    # Send mock image binary
    files = {"file": ("menu_photo.jpg", b"fake-image-binary-data", "image/jpeg")}
    response = client.post("/api/v1/ocr/extract", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_text" in data
    assert "confidence" in data
