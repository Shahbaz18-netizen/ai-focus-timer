from langchain_core.tools import tool
from app.core.supabase_client import supabase
from app.services.vector_db import vector_db  # Bug fix #6: was missing, caused NameError
from datetime import datetime
import re
from typing import Union, List

@tool
def fetch_user_history(user_id: str):
    """Fetches the last 10 focus sessions for a specific user from Supabase."""
    try:
        response = supabase.table("sessions") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("start_time", desc=True) \
            .limit(10) \
            .execute()
        return response.data
    except Exception as e:
        return f"Error fetching history: {str(e)}"

from app.services.rag_service import rag_service

@tool
async def search_past_journals(user_id: str, query: str):
    """
    Searches the user's long-term memory for similar past situations.
    Useful for finding patterns, past solutions, or recurring obstacles.
    """
    try:
        results = await rag_service.search_memory(user_id, query)
        return results
    except Exception as e:
        return f"Error searching memory: {str(e)}"

@tool
def record_morning_ritual(user_id: str, tasks: Union[list, str], target_focus_mins: int, reporting_time: str):
    """
    Saves the user's daily intentions. 
    tasks: Either a list of task objects like {"title": "X", "duration": 0} OR a comma-separated string of titles.
    target_focus_mins: Total goal for focus today (e.g. 240)
    reporting_time: When the user wants the EOD analysis (e.g. "18:00" or "6pm")
    """
    try:
        # 1. Normalize tasks
        processed_tasks = []
        if isinstance(tasks, str):
            processed_tasks = [{"title": t.strip(), "duration": 0} for t in tasks.split(",") if t.strip()]
        else:
            processed_tasks = tasks

        # 2. Normalize reporting_time to ISO timestamp
        # Assume it's for today's date
        now = datetime.now()
        iso_reporting_time = reporting_time
        
        # Simple HH:mm parser
        time_match = re.match(r'(\d{1,2}):(\d{1,2})', reporting_time)
        if time_match:
            hh, mm = map(int, time_match.groups())
            target_dt = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
            iso_reporting_time = target_dt.isoformat()
        elif "pm" in reporting_time.lower() or "am" in reporting_time.lower():
            # Basic fallback for am/pm if we want to be fancy, but keeping it simple for now
            pass

        # 3. Create Daily Plan entry
        plan_entry = {
            "user_id": user_id,
            "focus_target_minutes": target_focus_mins,
            "reporting_time": iso_reporting_time,
            "tasks": {"raw": "Interactive Ritual"}
        }
        plan_res = supabase.table("daily_plans").insert(plan_entry).execute()
        
        # 4. Bulk insert tasks
        if processed_tasks:
            task_entries = [
                {
                    "user_id": user_id,
                    "title": t.get("title", "Untitled Task"),
                    "estimated_minutes": t.get("duration", 25),
                    "is_completed": False
                } for t in processed_tasks
            ]
            supabase.table("tasks").insert(task_entries).execute()
        
        return f"Morning ritual recorded for {user_id}. {len(processed_tasks)} tasks synced."
    except Exception as e:
        print(f"ERROR in record_morning_ritual: {e}")
        return f"Error recording ritual: {str(e)}"

@tool
def update_task_status(task_id: int, is_completed: bool):
    """Updates whether a task is completed or not."""
    try:
        supabase.table("tasks").update({"is_completed": is_completed, "completed_at": datetime.now().isoformat() if is_completed else None}).eq("id", task_id).execute()
        return "Task updated."
    except Exception as e:
        return f"Error updating task: {str(e)}"

@tool
def rollover_tasks(user_id: str):
    """
    Finds all incomplete tasks for the day and prepares them for the next ritual.
    Marks them as rolled_over: True.
    """
    try:
        supabase.table("tasks").update({"is_rolled_over": True}).eq("user_id", user_id).eq("is_completed", False).execute()
        return "Incomplete tasks have been preserved for the next dawn."
    except Exception as e:
        return f"Error during roll-over: {str(e)}"

@tool
def index_daily_summary(user_id: str, summary: str, completed_tasks: list, pending_tasks: list):
    """
    Indexes the Oracle's daily summary into the Vector DB.
    Includes metadata about which tasks were completed and which were rolled over.
    """
    try:
        metadata = {
            "type": "daily_summary",
            "user_id": user_id,
            "completed_count": len(completed_tasks),
            "pending_count": len(pending_tasks),
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        content = f"Daily Summary: {summary}\nCompleted: {', '.join(completed_tasks)}\nPending: {', '.join(pending_tasks)}"
        vector_db.add_journal_entry(user_id, content, metadata)
        return "Oracle's summary has been etched into the eternal archives."
    except Exception as e:
        return f"failed to index summary: {str(e)}"

@tool
def record_eod_analysis(user_id: str, summary: str, patterns: list, improvement: str, metrics: dict):
    """Persists the end-of-day intelligence report to the database."""
    try:
        # Find the latest plan (today's plan)
        # We assume there is one since the user is doing EOD
        latest = supabase.table("daily_plans") \
            .select("id, suggested_schedule") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
            
        if not latest.data:
            return "No daily plan found to attach report to."
            
        plan = latest.data[0]
        schedule = plan.get('suggested_schedule') or {}
        
        # Handle stringified JSONB fallback
        if isinstance(schedule, str):
            import json
            try:
                schedule = json.loads(schedule)
            except:
                schedule = {}
                
        # Update schedule with report data
        schedule['eod_report'] = {
            "summary": summary,
            "patterns": patterns,
            "improvement": improvement,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
        supabase.table("daily_plans").update({
            "suggested_schedule": schedule
        }).eq("id", plan['id']).execute()
        
        return "EOD analysis successfully recorded in Daily Plan."
    except Exception as e:
        return f"Error recording EOD analysis: {str(e)}"

tools = [fetch_user_history, search_past_journals, record_morning_ritual, update_task_status, rollover_tasks, index_daily_summary, record_eod_analysis]