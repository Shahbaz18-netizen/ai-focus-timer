import requests
import json

url = "http://localhost:8000/api/v1/orchestrator/plan/reporting-time"
payload = {
    "user_id": "demo-user-123",
    "reporting_time": "18:00"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.patch(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
