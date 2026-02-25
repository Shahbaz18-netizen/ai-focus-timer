import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client, AsyncClient

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

print(f"URL: {url}")
print(f"KEY: {key[:10]}...")

async def diagnose():
    try:
        # Check if create_client returns sync or async by default
        supabase = create_client(url, key)
        print(f"Client type: {type(supabase)}")
        
        # Try a sync call
        try:
            print("Trying sync get_user...")
            res = supabase.auth.get_user("invalid-token")
            print(f"Sync call returned: {res}")
        except Exception as e:
            print(f"Sync call raised: {type(e).__name__}: {e}")

        # Try an async call
        try:
            print("Trying async get_user...")
            # If supabase is a sync client, this might fail or hang if misconfigured
            # Let's try to see if .auth is async
            if asyncio.iscoroutinefunction(supabase.auth.get_user):
                print("supabase.auth.get_user is a coroutine function!")
                res = await supabase.auth.get_user("invalid-token")
                print(f"Async call returned: {res}")
            else:
                print("supabase.auth.get_user is NOT a coroutine function.")
        except Exception as e:
            print(f"Async attempt raised: {type(e).__name__}: {e}")

    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")

if __name__ == "__main__":
    asyncio.run(diagnose())
