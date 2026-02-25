import os
from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage

# 1. Tools import
from app.services.agents.tools import fetch_user_history, search_past_journals

# 2. State Definition with 'add_messages' reducer (CRITICAL)
# 'add_messages' ensures that new messages are appended to history correctly
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

# 3. Model Setup
tools = [fetch_user_history, search_past_journals]
llm = ChatOpenAI(
    model="gpt-4o-mini", 
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0
).bind_tools(tools)

# 4. System Prompt
COACH_SYSTEM_PROMPT = (
    "You are a 'Fastlane' AI Productivity Coach. Your goal is to help the user master their time. "
    "You have access to: \n"
    "1. Supabase (fetch_user_history): Recent session data.\n"
    "2. Vector DB (search_past_journals): Past feelings and patterns.\n"
    "Always analyze history before replying. If no history exists (empty list), "
    "welcome the user to their very first session and explain your role."
)

# 5. Node Functions
def assistant(state: AgentState):
    """
    Handles the LLM call. We ensure the System Message is always at the start.
    """
    input_messages = state["messages"]
    
    # Sequence ensure karne ke liye: [SystemMessage] + all existing messages
    # OpenAI requires: System -> Human -> AI (tool_calls) -> Tool -> AI (response)
    full_messages = [SystemMessage(content=COACH_SYSTEM_PROMPT)] + input_messages
    
    response = llm.invoke(full_messages)
    
    # Hum sirf new response return karenge, 'add_messages' use append kar dega
    return {"messages": [response]}

# 6. Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("agent", assistant)
workflow.add_node("action", ToolNode(tools))

workflow.set_entry_point("agent")

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "action"
    return END

workflow.add_conditional_edges("agent", should_continue, {"action": "action", END: END})
workflow.add_edge("action", "agent")

coach_agent = workflow.compile()