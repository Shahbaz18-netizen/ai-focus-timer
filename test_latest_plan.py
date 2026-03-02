import requests
import json

URL = "http://localhost:8000/api/v1/brain/plan/latest"
# Mock auth token (since it's in mock mode, it shouldn't matter much but needs to be a Bearer token)
headers = {
    "Authorization": "Bearer some-fake-token"
}

try:
    response = requests.get(URL, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
