import requests
import json

url = "http://localhost:8000/api/v1/brain/plan/morning"
payload = {
    # "user_id": "demo-user-123",  # Mocking auth might be needed if script is run directly
    "target_minutes": 240,
    "tasks": "Debug the code, Write documentation, Coffee break",
    "target_end_time": "17:00"
}
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dev-mock-token'
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
