from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.supabase_client import supabase
from app.dependencies.auth import get_current_user

router = APIRouter()

# --- Request Models ---
class TimerStartRequest(BaseModel):
    session_type: str
    task_intent: str

class TimerStopRequest(BaseModel):
    duration_minutes: float


# --- Endpoints ---

@router.post("/start")
def start_session(request: TimerStartRequest, user_id: str = Depends(get_current_user)):
    """
    Start a new Pomodoro session.
    The user_id is automatically grabbed from their secure token.
    """
    data = {
        "user_id": user_id,
        "session_type": request.session_type,
        "task_intent": request.task_intent,
        "start_time": datetime.now(timezone.utc).isoformat()
    }

    # Save to database
    response = supabase.table("sessions").insert(data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to start session in database")

    return response.data[0]


@router.post("/stop/{session_id}")
def stop_session(session_id: int, request: TimerStopRequest, user_id: str = Depends(get_current_user)):
    """
    Stop an active Pomodoro session and record how long it lasted.
    """
    end_time = datetime.now(timezone.utc).isoformat()

    # Update database - Make sure we only update if the user OWNS the session
    response = supabase.table("sessions").update({
        "end_time": end_time,
        "duration_minutes": request.duration_minutes
    }).eq("id", session_id).eq("user_id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found or you don't own it!")

    return {"status": "success", "data": response.data[0]}
