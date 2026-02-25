from fastapi import APIRouter, Depends
from typing import List, Dict, Any

from app.core.supabase_client import supabase
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/daily-stats")
def get_daily_stats(user_id: str = Depends(get_current_user)):
    """
    Get a summary of the user's focus sessions for the day.
    This includes the time they spent and their journal reflections.
    """
    
    # 1. Fetch Sessions: Find all work sessions for this user
    sessions_res = supabase.table("sessions").select("*").eq("user_id", user_id).execute()
    sessions = sessions_res.data or []
    
    # 2. Fetch Journals: Get the reflections linked to those sessions
    journals_res = supabase.table("journals").select("*").execute()
    # Create a quick lookup dictionary: { session_id: journal_data }
    journals = {j['session_id']: j for j in (journals_res.data or [])}
    
    # 3. Merge Data: Combine sessions and journals for the frontend to show
    stats = []
    for s in sessions:
        journal = journals.get(s['id'], {})
        stats.append({
            "date": s['start_time'][:10], # Just the YYYY-MM-DD part
            "minutes": s.get('duration_minutes', 25), # If missing, guess it was 25 mins
            "intent": s.get('task_intent', 'Deep Work'),
            "content": journal.get('content', 'No reflection yet'),
            "score": journal.get('focus_score', 0)
        })
        
    return stats
