import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import supabase
from datetime import datetime
import json

async def test_get_latest_plan():
    user_id = os.environ.get("TEST_USER_ID", "cd7bede7-b6f7-4952-aac4-8bc68593a2eb") # Using a random real UUID if needed, or query for one
    print(f"Testing for user_id: {user_id}")
    
    try:
        res = supabase.table("daily_plans") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not res.data:
            print("No plan found.")
            return
            
        plan = res.data[0]
        print(f"Plan found: {plan['id']}")
        
        reporting_time = plan.get("reporting_time")
        
        if not reporting_time:
            schedule = plan.get("suggested_schedule")
            if schedule:
                if isinstance(schedule, str):
                    try:
                        schedule = json.loads(schedule)
                    except:
                        pass
                if isinstance(schedule, dict):
                    reporting_time = schedule.get("reporting_time")

        if not reporting_time and plan.get("tasks"):
            tasks_data = plan.get("tasks")
            if isinstance(tasks_data, str):
                 tasks_data = json.loads(tasks_data)
            reporting_time = tasks_data.get("target_end_time")

        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        sessions = supabase.table("sessions") \
            .select("duration_minutes") \
            .eq("user_id", user_id) \
            .gte("start_time", today_start) \
            .execute()
        
        focused_today = sum(s["duration_minutes"] for s in sessions.data or [])

        print({
            "status": "success", 
            "data": {
                **plan,
                "reporting_time": reporting_time,
                "focused_today": focused_today
            }
        })
    except Exception as e:
        print(f"ERROR fetching latest plan: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    
    # Let's get a real user from Supabase to test with
    try:
        users = supabase.table("daily_plans").select("user_id").limit(1).execute()
        if users.data:
            os.environ["TEST_USER_ID"] = users.data[0]["user_id"]
    except Exception as e:
        print("Could not fetch a real user id:", e)
        
    asyncio.run(test_get_latest_plan())
