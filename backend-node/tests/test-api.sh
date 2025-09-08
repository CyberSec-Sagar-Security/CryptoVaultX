#!/bin/bash

# CryptoVaultX Backend API Test Scripts
# Run these commands to test the API endpoints

API_BASE="http://localhost:5000/api"

echo "🧪 Testing CryptoVaultX Backend API"
echo "=================================="

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -X GET "$API_BASE/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""

# Test 2: Register User
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sagar Kumar",
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }' \
  -w "\nSTATUS:%{http_code}" \
  -s)

echo "$REGISTER_RESPONSE" | sed 's/STATUS:.*//' | jq '.'
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | grep "STATUS:" | cut -d: -f2)
echo "Status: $REGISTER_STATUS"
echo ""

# Test 3: Login User
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }' \
  -w "\nSTATUS:%{http_code}" \
  -s)

echo "$LOGIN_RESPONSE" | sed 's/STATUS:.*//' | jq '.'
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep "STATUS:" | cut -d: -f2)
echo "Status: $LOGIN_STATUS"

# Extract JWT token for next request
TOKEN=$(echo "$LOGIN_RESPONSE" | sed 's/STATUS:.*//' | jq -r '.token')
echo ""

# Test 4: Get User Profile
if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "4. Testing Get User Profile..."
    curl -X GET "$API_BASE/auth/me" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -w "\nStatus: %{http_code}\n" \
      -s | jq '.'
else
    echo "4. Skipping profile test - no valid token received"
fi

echo ""

# Test 5: Test Invalid Login
echo "5. Testing Invalid Login..."
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""

# Test 6: Test Validation Error
echo "6. Testing Validation Error (short password)..."
curl -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "✅ API Testing Complete!"
