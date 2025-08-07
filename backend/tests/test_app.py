"""
Test suite for CryptoVault backend API.
Tests basic functionality and database connections.
"""

import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, check_db_connection


class TestApp:
    """Test cases for Flask application."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        app.config["TESTING"] = True
        with app.test_client() as client:
            yield client

    def test_home_route(self, client):
        """Test home route returns correct response."""
        response = client.get("/")
        assert response.status_code == 200

        data = response.get_json()
        assert data["message"] == "CryptoVault Backend Running!"
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"
        assert "database" in data

    def test_health_route(self, client):
        """Test health check route."""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "healthy"
        assert "database" in data
        assert "timestamp" in data

    @patch("app.check_db_connection")
    def test_home_with_db_disconnected(self, mock_db_check, client):
        """Test home route when database is disconnected."""
        mock_db_check.return_value = False

        response = client.get("/")
        assert response.status_code == 200

        data = response.get_json()
        assert data["database"] == "disconnected"

    @patch("app.next")
    def test_api_stats_route(self, mock_next, client):
        """Test API stats route."""
        # Mock database session
        mock_db = MagicMock()
        mock_next.return_value = mock_db

        # Mock query results
        mock_db.query.return_value.count.return_value = 0
        mock_db.query.return_value.filter.return_value.count.return_value = 0

        response = client.get("/api/stats")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert "users" in data
        assert "files" in data
        assert "shares" in data
        assert "active_sessions" in data


class TestDatabaseConnection:
    """Test cases for database connectivity."""

    @patch("app.engine.connect")
    def test_check_db_connection_success(self, mock_connect):
        """Test successful database connection."""
        mock_connection = MagicMock()
        mock_result = MagicMock()
        mock_result.fetchone.return_value = (1,)
        mock_connection.execute.return_value = mock_result
        mock_connect.return_value.__enter__.return_value = mock_connection

        result = check_db_connection()
        assert result is True

    @patch("app.engine.connect")
    def test_check_db_connection_failure(self, mock_connect):
        """Test database connection failure."""
        mock_connect.side_effect = Exception("Connection failed")

        result = check_db_connection()
        assert result is False


class TestErrorHandling:
    """Test cases for error handling."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        app.config["TESTING"] = True
        with app.test_client() as client:
            yield client

    @patch("app.next")
    def test_api_stats_error_handling(self, mock_next, client):
        """Test API stats route error handling."""
        mock_next.side_effect = Exception("Database error")

        response = client.get("/api/stats")
        assert response.status_code == 500

        data = response.get_json()
        assert data["status"] == "error"
        assert "error" in data

    @patch("app.next")
    def test_api_users_error_handling(self, mock_next, client):
        """Test API users route error handling."""
        mock_next.side_effect = Exception("Database error")

        response = client.get("/api/users")
        assert response.status_code == 500

        data = response.get_json()
        assert data["status"] == "error"
        assert "error" in data


if __name__ == "__main__":
    pytest.main([__file__])
