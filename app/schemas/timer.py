from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SessionCreate(BaseModel):
    session_type: str  # "Pomodoro" ya "Deep Work"

class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    session_type: str

    class Config:
        from_attributes = True