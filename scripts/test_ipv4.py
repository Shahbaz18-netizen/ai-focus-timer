import socket
import requests
import os
from dotenv import load_dotenv

# Force IPv4
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [r for r in responses if r[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

load_dotenv()

url = os.environ.get("SUPABASE_URL")
if not url:
    print("SUPABASE_URL not found")
    exit(1)

print(f"Testing IPv4 connectivity to {url}...")
try:
    resp = requests.get(url, timeout=10)
    print(f"Status Code: {resp.status_code}")
    print(f"IPv4 confirmed: Handshake succeeded.")
except Exception as e:
    print(f"IPv4 request failed: {type(e).__name__}: {e}")
