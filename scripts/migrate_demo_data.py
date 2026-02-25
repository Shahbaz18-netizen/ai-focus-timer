import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.supabase_client import supabase

def migrate_demo_data(real_user_id: str):
    print(f"Migrating data from 'demo-user-123' to '{real_user_id}'...")
    
    # Needs a real user_id, let's fetch the most recent login from Supabase if none provided
    if not real_user_id:
        print("Fetching latest authentic user id...")
        # Get users from daily_plans to find a real UUID
        res = supabase.table("daily_plans").select("user_id").neq("user_id", "demo-user-123").order("created_at", desc=True).limit(1).execute()
        if res.data:
            real_user_id = res.data[0]["user_id"]
        else:
            print("Could not find a real user_id to migrate to.")
            return

    print(f"Target User ID: {real_user_id}")
    
    # 1. Migrate tasks
    print("Migrating tasks...")
    try:
        supabase.table("tasks").update({"user_id": real_user_id}).eq("user_id", "demo-user-123").execute()
        print("Tasks migrated successfully.")
    except Exception as e:
        print(f"Error migrating tasks: {e}")
        
    # 2. Migrate daily_plans
    print("Migrating daily_plans...")
    try:
        supabase.table("daily_plans").update({"user_id": real_user_id}).eq("user_id", "demo-user-123").execute()
        print("Daily plans migrated.")
    except Exception as e:
        print(f"Error migrating daily plans: {e}")

    print("Migration complete!")

if __name__ == "__main__":
    import sys
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    migrate_demo_data(target_id)
