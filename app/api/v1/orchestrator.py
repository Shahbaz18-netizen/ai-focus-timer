from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.services.agents.master_graph import master_brain
from app.core.supabase_client import supabase
from app.services.rag_service import rag_service
from app.dependencies.auth import get_current_user
import json
import re
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict
from fastapi.responses import StreamingResponse

print("--> LOADING ORCHESTRATOR MODULE <--")

router = APIRouter()

# --- REQUEST SCHEMAS (Modified to remove user_id) ---
class MorningPlanRequest(BaseModel):
    # user_id: str  <-- Handled by Auth Token
    target_minutes: int
    tasks: str
    target_end_time: Optional[str] = None

class StrategyRequest(BaseModel):
    intent: str
    duration_mins: int

class TaskUpdate(BaseModel):
    is_completed: bool

class FeedbackRequest(BaseModel):
    session_id: int
    focus_rating: int
    mini_journal: str

class ReportingTimeUpdate(BaseModel):
    reporting_time: str

class TaskCreate(BaseModel):
    title: str

class ReportRequest(BaseModel):
    journal_text: str = ""

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = [] 
    phase: str 

# --- UTILITY: AI RESPONSE PARSER ---
def parse_agent_response(raw_content: str):
    """
    Extracts JSON data and friendly text from the AI's response.
    """
    json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
    plan_data = {"schedule": [], "advice": "Let's get started!"}
    display_text = raw_content
    
    if json_match:
        try:
            plan_data = json.loads(json_match.group())
            display_text = plan_data.get("advice") or plan_data.get("encouragement") or "Plan generated! Ready to focus?"
        except Exception:
            display_text = raw_content.replace("```json", "").replace("```", "").strip()
            
    return plan_data, display_text

# --- ENDPOINTS ---

@router.get("/ping")
async def ping():
    import os
    return {
        "status": "pong", 
        "module": "orchestrator", 
        "auth_mode": os.environ.get("AURA_AUTH_MODE"),
        "AURA_AUTH_MODE_repr": repr(os.environ.get("AURA_AUTH_MODE"))
    }

@router.post("/plan/morning")
async def generate_morning_plan(request: MorningPlanRequest, user_id: str = Depends(get_current_user)):
    """
    PHASE 1: Triggers the Morning Planner Agent.
    """
    try:
        input_msg = f"Target: {request.target_minutes} mins. Tasks: {request.tasks}"
        
        result = master_brain.invoke({
            "messages": [HumanMessage(content=input_msg)],
            "user_id": user_id,
            "phase": "morning"
        }, config={"configurable": {"thread_id": f"morning_{user_id}"}})
        
        raw_content = result["messages"][-1].content
        plan_data, coach_message = parse_agent_response(raw_content)
        
        try:
            db_entry = {
                "user_id": user_id,
                "focus_target_minutes": request.target_minutes,
                "tasks": {
                    "raw": request.tasks,
                    "target_end_time": request.target_end_time
                },
                "suggested_schedule": plan_data
            }
            supabase.table("daily_plans").insert(db_entry).execute()
            
            task_list = [t.strip() for t in request.tasks.split(',') if t.strip()]
            if task_list:
                task_entries = [
                    {
                        "user_id": user_id,
                        "title": t,
                        "estimated_minutes": 25,
                        "is_completed": False
                    } for t in task_list
                ]
                supabase.table("tasks").insert(task_entries).execute()
        except Exception as db_e:
            print(f"Database insertion failed (non-critical): {db_e}")
        
        return {
            "plan": plan_data, 
            "coach_message": coach_message
        }
    except Exception as e:
        print(f"Orchestrator Error (Morning): {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/plan/reporting-time")
async def update_reporting_time(request: ReportingTimeUpdate, user_id: str = Depends(get_current_user)):
    """Updates the reporting time for the user's latest plan."""
    try:
        latest = supabase.table("daily_plans") \
            .select("id, suggested_schedule") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
            
        if not latest.data:
            raise HTTPException(status_code=404, detail="No active plan found to update.")
            
        plan = latest.data[0]
        plan_id = plan['id']
        
        schedule = plan.get('suggested_schedule') or {}
        if isinstance(schedule, str):
            try:
                schedule = json.loads(schedule)
            except:
                schedule = {}
        
        schedule['reporting_time'] = request.reporting_time
        
        res = supabase.table("daily_plans").update({
            "suggested_schedule": schedule
        }).eq("id", plan_id).execute()
        
        return res.data
    except Exception as e:
        print(f"Error updating reporting time: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import os

def is_mock_mode():
    return os.environ.get("AURA_AUTH_MODE") == "mock"

async def get_mock_latest_plan(user_id: str):
    return {
        "status": "success",
        "data": {
            "id": 1,
            "user_id": user_id,
            "focus_target_minutes": 240,
            "reporting_time": "17:00",
            "coach_message": "Good morning! I've set up your focus blocks. Let's make today count.",
            "tasks": json.dumps([
                {"id": 1, "title": "Priority Task A", "is_completed": False},
                {"id": 2, "title": "Deep Work Block", "is_completed": False}
            ]),
            "suggested_schedule": json.dumps({
                "blocks": [
                    {"time": "09:00", "activity": "Deep Work 1"},
                    {"time": "11:00", "activity": "Short Break"}
                ],
                "reporting_time": "17:00"
            }),
            "created_at": datetime.now().isoformat(),
            "focused_today": 45
        }
    }

@router.get("/plan/latest")
async def get_latest_plan(user_id: str = Depends(get_current_user)):
    """Fetches the most recent daily plan for the user."""
    if is_mock_mode():
        return await get_mock_latest_plan(user_id)
        
    try:
        # 1. Fetch Plan
        try:
            res = supabase.table("daily_plans") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()
            data_res = res.data
        except Exception as db_err:
            print(f"Database error (daily_plans): {db_err}")
            data_res = []
        
        if not data_res:
            return {"status": "no_plan", "data": None}
            
        plan = data_res[0]
        reporting_time = plan.get("reporting_time")
        
        # 2. Extract reporting_time
        try:
            if not reporting_time:
                schedule = plan.get("suggested_schedule")
                if schedule:
                    if isinstance(schedule, str):
                        try: schedule = json.loads(schedule)
                        except: pass
                    if isinstance(schedule, dict):
                        reporting_time = schedule.get("reporting_time")

            if not reporting_time and plan.get("tasks"):
                tasks_data = plan.get("tasks")
                if tasks_data:
                    if isinstance(tasks_data, str):
                        try: tasks_data = json.loads(tasks_data)
                        except: pass
                    if isinstance(tasks_data, dict):
                        reporting_time = tasks_data.get("target_end_time")
        except Exception as reporting_e:
            print(f"Non-critical: Error extracting reporting_time: {reporting_e}")

        # 3. Calculate focused_today
        focused_today = 0
        try:
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            sessions = supabase.table("sessions") \
                .select("duration_minutes") \
                .eq("user_id", user_id) \
                .gte("start_time", today_start) \
                .execute()
            focused_today = sum(s["duration_minutes"] for s in sessions.data or [])
        except Exception as session_err:
            print(f"Non-critical: Error calculating focused_today: {session_err}")

        return {
            "status": "success", 
            "data": {
                **plan,
                "reporting_time": reporting_time,
                "focused_today": focused_today
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"CRITICAL ERROR in get_latest_plan: {e}")
        # Return a safe fallback rather than a 500
        return {"status": "error", "message": str(e), "data": None}

@router.post("/session/strategy")
async def get_session_strategy(request: StrategyRequest, user_id: str = Depends(get_current_user)):
    """
    PHASE 2: Triggers the Session Coach Agent.
    """
    try:
        input_msg = f"Intent: {request.intent}. Planned Time: {request.duration_mins}m."
        
        result = master_brain.invoke({
            "messages": [HumanMessage(content=input_msg)],
            "user_id": user_id,
            "phase": "session"
        }, config={"configurable": {"thread_id": f"session_{user_id}"}})
        
        return {"strategy": result["messages"][-1].content}
    except Exception as e:
        print(f"Orchestrator Error (Session): {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks")
async def get_user_tasks(user_id: str = Depends(get_current_user)):
    """Fetches all tasks for the user."""
    if is_mock_mode():
        return [
            {"id": 1, "title": "Mock Task 1", "is_completed": False, "actual_minutes": 10, "status": "todo"},
            {"id": 2, "title": "Mock Task 2", "is_completed": True, "actual_minutes": 45, "status": "done"}
        ]
        
    try:
        tasks_res = supabase.table("tasks").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        tasks = tasks_res.data or []

        task_ids = [t['id'] for t in tasks]
        if task_ids:
            sessions_res = supabase.table("sessions").select("task_id, duration_minutes").in_("task_id", task_ids).execute()
            sessions = sessions_res.data or []
            
            duration_map = {}
            for s in sessions:
                tid = s.get('task_id')
                if tid:
                    duration_map[tid] = duration_map.get(tid, 0) + (s.get('duration_minutes') or 0)
            
            for t in tasks:
                t['actual_minutes'] = round(duration_map.get(t['id'], 0), 1)
                if t['is_completed']:
                    t['status'] = 'done'
                else:
                    t['status'] = 'todo'
        
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/tasks/{task_id}")
async def update_task(task_id: int, request: TaskUpdate, user_id: str = Depends(get_current_user)):
    """Updates task completion status. Enforces ownership."""
    if is_mock_mode():
        return {"id": task_id, "is_completed": request.is_completed}
        
    try:
        res = supabase.table("tasks").update({
            "is_completed": request.is_completed,
            "completed_at": datetime.now().isoformat() if request.is_completed else None
        }).eq("id", task_id).eq("user_id", user_id).execute() # Added .eq("user_id", user_id) for security
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks")
async def create_task(request: TaskCreate, user_id: str = Depends(get_current_user)):
    """Creates a single new task."""
    if is_mock_mode():
        return {"id": 100, "title": request.title, "is_completed": False}
        
    try:
        res = supabase.table("tasks").insert({
            "user_id": user_id,
            "title": request.title,
            "is_completed": False,
            "created_at": datetime.now().isoformat()
        }).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, user_id: str = Depends(get_current_user)):
    """Deletes a task."""
    try:
        res = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        return {"status": "success", "id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/log")
async def log_session(request: dict = Body(...), user_id: str = Depends(get_current_user)):
    """Creates a new session record when timer completes."""
    if is_mock_mode():
        return {"status": "success", "session_id": 999}
        
    try:
        res = supabase.table("sessions").insert({
            "user_id": user_id,
            "task_intent": request.get("task_intent"),
            # support legacy key or new key for task name
            # If not provided, maybe linked to task_id?
            # For now, keep as is but force user_id
            "duration_minutes": request.get("duration_minutes"),
            "start_time": request.get("start_time"),
            "end_time": datetime.now().isoformat(),
            "focus_score": 0 
        }).execute()
        
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create session")
            
        return {"status": "success", "session_id": res.data[0]["id"]}
    except Exception as e:
        print(f"Session Log Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/feedback")
async def submit_session_feedback(request: FeedbackRequest, user_id: str = Depends(get_current_user)):
    """Submits focus rating and mini-journal."""
    try:
        # Verify ownership of session?
        # session = supabase.table("sessions").select("user_id").eq("id", request.session_id).single()
        # if session.user_id != user_id: raise 403
        
        res = supabase.table("sessions").update({
            "focus_rating": request.focus_rating,
            "mini_journal": request.mini_journal
        }).eq("id", request.session_id).eq("user_id", user_id).execute()
        
        if request.mini_journal:
            await rag_service.add_memory(
                user_id=user_id,
                content=request.mini_journal,
                metadata={
                    "session_id": request.session_id,
                    "rating": request.focus_rating,
                    "type": "pomo_session"
                }
            )
            
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/memories")
async def get_memories(user_id: str = Depends(get_current_user)):
    """Fetches long-term memories for the user."""
    try:
        memories = await rag_service.get_memories(user_id)
        return memories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MemoryCreate(BaseModel):
    content: str

@router.post("/memories")
async def create_memory(request: MemoryCreate, user_id: str = Depends(get_current_user)):
    """Manually adds a long-term memory."""
    try:
        await rag_service.add_memory(
            user_id=user_id,
            content=request.content,
            metadata={"type": "manual_entry", "source": "user_dashboard"}
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: int, user_id: str = Depends(get_current_user)):
    """Deletes a specific memory."""
    try:
        # TODO: Verify memory ownership in RAG service using filter?
        # For now, RAG service might not check.
        # Ideally: await rag_service.delete_memory(memory_id, user_id)
        success = await rag_service.delete_memory(memory_id)
        return {"status": "success" if success else "failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report/daily")
async def generate_daily_report(request: ReportRequest, user_id: str = Depends(get_current_user)):
    """Triggers the EOD Analyst."""
    try:
        result = await master_brain.ainvoke({
            "messages": [HumanMessage(content=f"Generate my daily report. Here is my personal reflection: {request.journal_text}")],
            "user_id": user_id,
            "phase": "eod"
        }, config={"configurable": {"thread_id": f"eod_{user_id}_{datetime.now().strftime('%Y%m%d')}"}})
        
        last_message = result["messages"][-1]
        report_content = last_message.content
        
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            for tool_call in last_message.tool_calls:
                if tool_call.get("name") == "record_eod_analysis":
                    args = tool_call.get("args", {})
                    if "summary" in args:
                        report_content = args["summary"]
                        break
        
        # AUTO-INDEXING: Save the Daily Report to Long-Term Memory
        await rag_service.add_memory(
            user_id=user_id,
            content=f"Daily Report ({datetime.now().strftime('%Y-%m-%d')}): {report_content}",
            metadata={"type": "daily_summary", "date": datetime.now().isoformat()}
        )
        
        return {"report": report_content}
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/history")
async def get_report_history(user_id: str = Depends(get_current_user), date: Optional[str] = None):
    """Fetches past daily reports."""
    try:
        query = supabase.table("daily_plans") \
            .select("id, created_at, suggested_schedule") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True)
            
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d")
                next_day = target_date + timedelta(days=1)
                query = query.gte("created_at", target_date.isoformat()).lt("created_at", next_day.isoformat())
            except ValueError:
                pass 
        else:
            query = query.limit(30)
            
        res = query.execute()
            
        reports = []
        for plan in (res.data or []):
            schedule = plan.get("suggested_schedule")
            if isinstance(schedule, str):
                try: 
                    schedule = json.loads(schedule)
                except: 
                    continue
            
            if isinstance(schedule, dict) and schedule.get("eod_report"):
                report_data = schedule.get("eod_report")
                if not report_data.get("date"):
                    report_data["date"] = plan["created_at"]
                reports.append(report_data)
                
        return reports
    except Exception as e:
        print(f"Error fetching report history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def event_generator(user_id: str, message: str, history: list[dict], phase: str):
    """
    Generator that streams tokens from LangGraph.
    """
    from langchain_core.messages import AIMessage, HumanMessage
    
    formatted_history = []
    for msg in history:
        if msg["role"] == "user":
            formatted_history.append(HumanMessage(content=msg["content"]))
        else:
            formatted_history.append(AIMessage(content=msg["content"]))
            
    input_data = {
        "messages": formatted_history + [HumanMessage(content=message)],
        "user_id": user_id,
        "phase": phase
    }
    
    stream_id = f"ritual_{user_id}_{datetime.now().strftime('%Y%m%d')}"
    config = {"configurable": {"thread_id": stream_id}}

    json_detected = False

    async for event in master_brain.astream_events(input_data, config=config, version="v2"):
        if json_detected:
            continue

        kind = event["event"]
        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            if content and not event["data"]["chunk"].tool_call_chunks:
                if any(char in content for char in ['{', '[', '```', '"schedule"']):
                    json_detected = True
                    continue 
                yield f"data: {json.dumps({'token': content})}\n\n"
        
        elif kind == "on_chain_end" and event["name"] == "master_brain":
            yield f"data: {json.dumps({'status': 'completed'})}\n\n"

        elif kind == "on_tool_end" and event["name"] == "record_morning_ritual":
            yield f"data: {json.dumps({'ritual_saved': True})}\n\n"

@router.post("/stream")
async def stream_coach_response(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    SSE Endpoint for real-time AI coaching with memory.
    """
    return StreamingResponse(
        event_generator(user_id, request.message, request.history, request.phase),
        media_type="text/event-stream"
    )

@router.get("/dashboard/stats")
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    """
    AGGREGATION: Processes historical data for SaaS-style Plotly charts.
    """
    try:
        sessions_res = supabase.table("sessions").select("*").eq("user_id", user_id).execute()
        sessions = sessions_res.data or []
        
        total_mins = 0
        dow_dist = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}
        cat_dist = defaultdict(float)
        monthly_trend = defaultdict(float)
        focus_vs_output = {}
        
        for s in sessions:
            mins = s.get("duration_minutes", 0)
            total_mins += mins
            
            # Time analysis
            dt = datetime.fromisoformat(s["start_time"].replace('Z', '+00:00'))
            dow_dist[dt.strftime("%a")] += mins
            monthly_trend[dt.strftime("%b")] += (mins / 60)
            
            # Category analysis
            cat = s.get("session_type", "General")
            cat_dist[cat] += (mins / 60)

            # Focus vs Output (Daily)
            date_str = dt.strftime("%Y-%m-%d")
            if date_str not in focus_vs_output:
                focus_vs_output[date_str] = {"total_score": 0, "total_mins": 0, "count": 0}
            
            rating = s.get("focus_rating")
            if rating:
                focus_vs_output[date_str]["total_score"] += rating
                focus_vs_output[date_str]["count"] += 1
            
            focus_vs_output[date_str]["total_mins"] += mins

        # Fix #11: calculate actual weeks spanned instead of hardcoded / 4
        first_session = min(sessions, key=lambda s: s["start_time"]) if sessions else None
        last_session = max(sessions, key=lambda s: s["start_time"]) if sessions else None
        if first_session and last_session:
            first_dt = datetime.fromisoformat(first_session["start_time"].replace('Z', '+00:00'))
            last_dt = datetime.fromisoformat(last_session["start_time"].replace('Z', '+00:00'))
            actual_weeks = max(1, (last_dt - first_dt).days / 7)
        else:
            actual_weeks = 1

        # Prepare missing metrics for tests
        hourly_pulse = [0] * 24
        for s in sessions:
            dt = datetime.fromisoformat(s["start_time"].replace('Z', '+00:00'))
            hourly_pulse[dt.hour] += (s.get("duration_minutes", 0) / 60)
        
        # Streak calculation (pseudo-logic for now)
        unique_dates = sorted(list(set(focus_vs_output.keys())))
        current_streak = 0
        if unique_dates:
            # Simplistic streak check - just count consecutive days backwards from today/last session
            current_streak = len(unique_dates) # Placeholder, ideally checks distance between dates

        focus_quality_score = 0
        ratings = [s.get("focus_rating") for s in sessions if s.get("focus_rating")]
        if ratings:
            focus_quality_score = round(sum(ratings) / len(ratings), 1)

        total_focus_hours = round(total_mins / 60, 2)

        return {
            "total_focus_hours": total_focus_hours,
            "hourly_pulse": hourly_pulse,
            "current_streak": current_streak,
            "focus_quality_score": focus_quality_score,
            "summary": {
                "total_hours": total_focus_hours,
                "avg_session_mins": round(total_mins / len(sessions), 1) if sessions else 0,
                "total_entries": len(sessions),
                "avg_per_week_hrs": round((total_mins / 60) / actual_weeks, 2)
            },
            "charts": {
                "day_of_week": dow_dist,
                "categories": dict(cat_dist),
                "monthly_trends": dict(monthly_trend),
                "focus_vs_output": {
                    "dates": list(focus_vs_output.keys()),
                    "focus_scores": [d["total_score"] / d["count"] if d["count"] > 0 else 0 for d in focus_vs_output.values()],
                    "output_mins": [d["total_mins"] for d in focus_vs_output.values()]
                }
            }
        }
    except Exception as e:
        print(f"Dashboard Stats Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
