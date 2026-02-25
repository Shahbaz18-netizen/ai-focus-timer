import requests
import json

BASE_URL = "http://localhost:8000/api/v1/brain"
USER_ID = "demo-user-123"

def test_dashboard_stats():
    print(f"Testing GET {BASE_URL}/dashboard/stats...")
    headers = {"Authorization": "Bearer dev-mock-token"}
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        response.raise_for_status()
        data = response.json()
        
        print("\n✅ API Response Received:")
        print(json.dumps(data, indent=2))
        
        # Validation
        required_keys = ["total_focus_hours", "hourly_pulse", "current_streak", "focus_quality_score"]
        missing = [k for k in required_keys if k not in data]
        
        if missing:
            print(f"\n❌ Missing keys: {missing}")
        else:
            print(f"\n✅ All required keys present.")
            
        if len(data["hourly_pulse"]) != 24:
             print(f"❌ Hourly pulse has {len(data['hourly_pulse'])} items, expected 24.")
        else:
             print(f"✅ Hourly pulse format correct (24h).")

    except Exception as e:
        print(f"\n❌ Request Failed: {e}")

if __name__ == "__main__":
    test_dashboard_stats()
