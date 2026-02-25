from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any

from app.core.supabase_client import supabase
from app.services.ai_service import AIService
from app.services.vector_db import VectorDBService
from app.dependencies.auth import get_current_user

router = APIRouter()
ai_service = AIService()
vdb_service = VectorDBService()

# --- Request Models ---
class JournalSubmitRequest(BaseModel):
    session_id: int
    content: str
    user_focus_score: int

# --- Endpoints ---

@router.post("/submit")
def submit_journal(request: JournalSubmitRequest, user_id: str = Depends(get_current_user)):
    """
    Saves a user's reflection after a focus session.
    It asks the AI to analyze how well the user focused!
    """
    
    # 1. Memory Search: Find similar past journal entries
    past_logs = vdb_service.query_similar_journals(request.content)
    
    # 2. AI Brain: Let the AI analyze the journal and give feedback
    analysis = ai_service.analyze_journal(request.content, past_logs)
    
    # 3. Save to Database: Keep a record of the journal and the AI's thoughts
    journal_data = {
        "session_id": request.session_id,
        "content": request.content,
        "focus_score": analysis.get('focus_score', request.user_focus_score),
        "ai_feedback": f"{analysis.get('feedback', '')} | Tip: {analysis.get('suggestion', '')}"
    }
    
    response = supabase.table("journals").insert(journal_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Uh oh! Failed to save journal to the database.")
    
    # 4. Save to Long-Term Memory (Vector DB)
    new_journal_id = response.data[0]['id']
    vdb_service.add_journal(new_journal_id, request.content, {"score": analysis.get('focus_score', 0)})
    
    return analysis
