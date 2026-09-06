from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_websocket_voice_stream():
    with client.websocket_connect("/ws/voice-stream") as websocket:
        websocket.send_json({"event": "start"})
        data = websocket.receive_json()
        assert data["status"] == "listening"

        websocket.send_json({"event": "audio_chunk", "chunk": "data"})
        data = websocket.receive_json()
        assert data["status"] == "interim"

        websocket.send_json({"event": "stop"})
        data = websocket.receive_json()
        assert data["status"] == "final"
        assert "translation" in data
