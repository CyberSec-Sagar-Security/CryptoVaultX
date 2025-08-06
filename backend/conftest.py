"""
Pytest configuration and fixtures for CryptoVaultX backend tests.
"""
import os
import sys
import pytest
from unittest.mock import MagicMock

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

@pytest.fixture
def mock_app():
    """Mock Flask application for testing."""
    mock_app = MagicMock()
    mock_app.config = {
        'TESTING': True,
        'DATABASE_URL': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key'
    }
    return mock_app

@pytest.fixture
def mock_db():
    """Mock database connection for testing."""
    return MagicMock()

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'securepassword123'
    }

@pytest.fixture
def sample_transaction_data():
    """Sample transaction data for testing."""
    return {
        'user_id': 1,
        'cryptocurrency': 'BTC',
        'amount': 0.5,
        'price': 45000.0,
        'transaction_type': 'buy'
    }

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    os.environ.update({
        'FLASK_ENV': 'testing',
        'DATABASE_URL': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key-for-jwt',
        'TESTING': 'true'
    })
