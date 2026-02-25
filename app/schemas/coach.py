from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    user_id: str  # Isse 'int' se 'str' hona zaroori hai

class ChatResponse(BaseModel):
    response: str