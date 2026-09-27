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
    from PIL import Image
    import io
    buf = io.BytesIO()
    Image.new("RGB", (60, 60), color="white").save(buf, format="JPEG")
    files = {"file": ("menu_photo.jpg", buf.getvalue(), "image/jpeg")}
    response = client.post("/api/v1/ocr/extract", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_text" in data
    assert "confidence" in data


def test_tts_synthesize_endpoint():
    payload = {"text": "Arigatou", "language": "ja", "speed": 1.0}
    response = client.post("/api/v1/tts/synthesize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 0
    assert data["format"] == "audio/wav"


def test_tts_stream_endpoint():
    response = client.get("/api/v1/tts/stream?text=Hello&language=en")
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
    assert len(response.content) > 44


def test_asr_vad_detect_endpoint():
    import base64
    import numpy as np
    import wave
    import io

    # Generate test silence WAV
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(np.zeros(16000, dtype=np.int16).tobytes())

    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    response = client.post("/api/v1/asr/detect-voice", json={"audio_base64": b64, "threshold": 0.5})
    assert response.status_code == 200
    data = response.json()
    assert "is_speech" in data


def test_asr_transcribe_endpoint():
    import base64
    from app.services.ml.tts.piper_service import synthesize_speech

    # Synthesize real speech WAV to test ASR transcription
    wav_bytes = synthesize_speech("Hello", language="en")
    b64 = base64.b64encode(wav_bytes).decode("utf-8")

    response = client.post("/api/v1/asr/transcribe", json={"audio_base64": b64, "language": "en"})
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert data["status"] == "success"

