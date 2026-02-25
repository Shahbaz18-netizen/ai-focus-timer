from pydantic import BaseModel
from typing import Optional

class JournalCreate(BaseModel):
    session_id: int
    content: str
    focus_score: int

class JournalResponse(JournalCreate):
    id: int
    ai_feedback: Optional[str] = None

    class Config:
        from_attributes = True