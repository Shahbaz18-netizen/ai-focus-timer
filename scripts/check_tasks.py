import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import supabase

def check_tasks():
    print("Checking all recent tasks down to a limit...")
    res = supabase.table("tasks").select("*").order("created_at", desc=True).limit(20).execute()
    for task in res.data:
        print(f"Task: {task['title']} | User: {task['user_id']} | ID: {task['id']}")

    print("\nChecking daily plans...")
    plans = supabase.table("daily_plans").select("id, user_id, created_at").order("created_at", desc=True).limit(5).execute()
    for p in plans.data:
        print(f"Plan ID: {p['id']} | User: {p['user_id']}")

if __name__ == "__main__":
    check_tasks()
