from app.core.supabase_client import supabase
from datetime import datetime, timedelta

class AnalyticsService:
    """
    Aggregates raw data (Tasks, Sessions, Plans) for the AI to analyze.
    """

    @staticmethod
    async def get_daily_context(user_id: str):
        """
        Fetches everything that happened today for the User.
        """
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        
        # 1. Fetch Completed Tasks
        tasks_res = supabase.table("tasks") \
            .select("title, is_completed") \
            .eq("user_id", user_id) \
            .gte("created_at", today_start) \
            .execute()
        
        tasks = tasks_res.data or []
        completed_tasks = [t['title'] for t in tasks if t['is_completed']]
        pending_tasks = [t['title'] for t in tasks if not t['is_completed']]

        # 2. Fetch Sessions (for total time & reflections)
        # Note: We need to join with memories or store reflections in sessions better. 
        # For now, we will just sum duration.
        sessions_res = supabase.table("sessions") \
            .select("duration_minutes, task_intent, start_time") \
            .eq("user_id", user_id) \
            .gte("start_time", today_start) \
            .execute()
            
        sessions = sessions_res.data or []
        total_focus_time = sum(s.get('duration_minutes') or 0 for s in sessions)
        
        # 3. Fetch Plan Targets
        plan_res = supabase.table("daily_plans") \
            .select("focus_target_minutes") \
            .eq("user_id", user_id) \
            .gte("created_at", today_start) \
            .limit(1) \
            .execute()
            
        target_minutes = plan_res.data[0]['focus_target_minutes'] if plan_res.data else 0

        # 4. Fetch Recent Memories (RAG)
        from app.services.rag_service import rag_service
        # Fetch last 5 memories to give context
        recent_memories = await rag_service.get_memories(user_id, limit=5)
        memory_context = "\n".join([f"- {m['content']}" for m in recent_memories])

        # Construct the context string for the LLM
        context = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "total_focus_minutes": total_focus_time,
            "target_minutes": target_minutes,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "session_count": len(sessions),
            "recent_memories": memory_context
        }
        
        return context

analytics_service = AnalyticsService()
