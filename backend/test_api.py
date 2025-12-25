from fastapi.testclient import TestClient
from server import app
import os

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "Migration Backend"}

# Mocking the actual migration to avoid LLM calls during basic test
from unittest.mock import patch

@patch('server.migrate')
def test_migrate_url(mock_migrate):
    mock_migrate.return_value = {"workspace": "dummy", "report": "done"}
    response = client.post("/migrate/url", json={"source_url": "http://github.com/test/repo.git"})
    assert response.status_code == 200
    assert response.json() == {"workspace": "dummy", "report": "done"}
