import requests
import json

url = "http://localhost:8000/api/v1/brain/plan/morning"

payload = {
    "target_minutes": 120,
    "tasks": "Test task 1, Test task 2",
    "target_end_time": "18:00"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print("Sending request...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
