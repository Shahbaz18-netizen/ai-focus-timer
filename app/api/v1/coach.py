from fastapi import APIRouter, HTTPException, Depends
from langchain_core.messages import HumanMessage
from app.services.agents.coach_agent import coach_agent
from app.schemas.coach import ChatRequest, ChatResponse
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_with_coach(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    Handles the chat interaction with the AI Coach.
    
    NOTE: If you get a 422 error, check 'app/schemas/coach.py'.
    The 'user_id' field MUST be 'str', not 'int', to accept UUIDs.
    """
    try:
        # 1. Prepare the state for LangGraph
        # We pass the message history as the initial state
        initial_state = {
            "messages": [HumanMessage(content=request.message)]
        }
        
        # 2. Invoke the Agent
        # Note: If your tools (like fetch_user_history) need the user_id,
        # you should pass it in the config or as part of the state.
        # For now, we invoke the brain to process the human message.
        result = coach_agent.invoke(
            initial_state,
            config={"configurable": {"user_id": request.user_id}}
        )
        
        # 3. Extract the final response from the AI
        if not result or "messages" not in result:
            raise ValueError("Agent failed to produce a response.")
            
        final_message = result["messages"][-1].content
        
        return ChatResponse(response=final_message)
    
    except Exception as e:
        # Logging the error to the console for easier debugging
        print(f"--- COACH AGENT ERROR ---")
        print(f"Type: {type(e).__name__}")
        print(f"Detail: {str(e)}")
        print(f"-------------------------")
        raise HTTPException(status_code=500, detail=f"Coach Error: {str(e)}")