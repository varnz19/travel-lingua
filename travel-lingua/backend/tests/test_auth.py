from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_me_missing_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "error" in response.json()


def test_auth_me_valid_demo_token():
    headers = {"Authorization": "Bearer demo-token-sarah-jenkins"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "email" in data
