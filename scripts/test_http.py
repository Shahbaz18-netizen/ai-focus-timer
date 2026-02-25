import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
if not url:
    print("SUPABASE_URL not found")
    exit(1)

print(f"Testing connectivity to {url}...")
try:
    # Test reaching the URL
    resp = requests.get(url, timeout=10)
    print(f"Status Code: {resp.status_code}")
    print(f"Headers: {resp.headers}")
    
    # Test reaching the auth endpoint specifically
    auth_url = f"{url}/auth/v1/user"
    print(f"Testing connectivity to {auth_url}...")
    resp = requests.get(auth_url, timeout=10)
    print(f"Status Code: {resp.status_code}")
    # Note: /auth/v1/user usually returns 401/403 without a token, which is a GOOD sign (it means we reached it)
except Exception as e:
    print(f"Request failed: {type(e).__name__}: {e}")
