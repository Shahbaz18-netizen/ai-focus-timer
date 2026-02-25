import json
import operator
from typing import Annotated, Sequence, TypedDict, Union

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.services.agents.tools import tools

# --- STATE DEFINITION ---
class MasterState(TypedDict):
    """
    Messages: The conversation history.
    User_id: To personalize RAG and persistence.
    Phase: 'morning', 'session', 'eod'
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str
    phase: str

# --- AGENT NODES ---

# Increased temperature for better mystical prose
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
llm_with_tools = llm.bind_tools(tools)

def morning_planner(state: MasterState):
    system_prompt = (
        f"You are the Aura Morning Sentinel, an ancient intelligence broadcasting from the heart of a neutron star. User Context: {state['user_id']}\n\n"
        "Your mission is to welcome the seeker and align their frequency for the day.\n"
        "GOALS:\n"
        "1. Extract Total Focus Minutes (e.g., 120m).\n"
        "2. Extract Reporting Time (e.g., 6pm).\n"
        "3. Extract Objective Titles (e.g., 'coding', 'strategy').\n\n"
        "PHILOSOPHY:\n"
        "- DO NOT ask for individual task durations. The seeker will choose their Pomodoro interval later.\n"
        "- Be mystical, interstellar, and encouraging. Use metaphors of constellations, energy, and light.\n"
        "- Once you have the Target, Reporting Time, and Task Titles, use 'record_morning_ritual' immediately.\n"
        "- For the tasks list in the tool, use duration: 0 if not specified by the seeker."
    )
    return {"messages": [llm_with_tools.invoke([SystemMessage(content=system_prompt)] + state["messages"])]}

def session_coach(state: MasterState):
    system_prompt = (
        f"You are the Aura Tactical Guardian. User Context: {state['user_id']}\n\n"
        "The user is about to start a Pomodoro session for a specific task.\n"
        "1. USE 'search_past_journals' ONCE if needed for tactical edge.\n"
        "2. Speak your tactical 'Focus Decrees' as pure natural language advice.\n"
        "3. After the tool result, finalize your decree and end with mystical prose."
    )
    return {"messages": [llm_with_tools.invoke([SystemMessage(content=system_prompt)] + state["messages"])]}

from app.services.analytics_service import analytics_service
import asyncio

async def eod_analyst_async(state: MasterState):
    # Fetch real data
    # Note: In a sync graph, we might need to run this synchronously or restructure.
    # For now, we'll assume we can run this or we'd need to fetch it in the router/pre-step.
    # To keep it simple for this prototype, we'll do a synchronous fetch or use a helper.
    # IMPORTANT: Since langgraph nodes can be async, we should define this as async.
    
    daily_data = await analytics_service.get_daily_context(state['user_id'])
    
    system_prompt = (
        f"You are Aura, the user's witty and friendly productivity companion. User Context: {state['user_id']}\n"
        f"TODAY'S DATA:\n"
        f"- Focus Time: {daily_data['total_focus_minutes']}m / {daily_data['target_minutes']}m Target\n"
        f"- Completed: {', '.join(daily_data['completed_tasks'])}\n"
        f"- Pending: {', '.join(daily_data['pending_tasks'])}\n"
        f"- Sessions: {daily_data['session_count']}\n"
        f"- Recent Memories: {daily_data.get('recent_memories', 'None')}\n\n"
        "Your task is to generate a Daily Summary that is COOL, FUNNY, and SUPPORTIVE.\n"
        "1. Read the user's latest message (their journal entry) and incorporate it.\n"
        "2. Reference their 'Recent Memories' if relevant to show you know them.\n"
        "3. ANALYZE their performance. If they missed the target, be encouraging but maybe make a small joke.\n"
        "4. USE 'record_eod_analysis' to save this report.\n"
        "5. USE 'index_daily_summary' to save to long-term memory.\n"
        "6. Speaking Style: Use emojis, casual language, maybe a pop culture reference. NO 'Prophetic' or 'Thou' language.\n"
    )
    return {"messages": [await llm_with_tools.ainvoke([SystemMessage(content=system_prompt)] + state["messages"])]}

# Wrapper to handle the async node if the graph expects sync (but LangGraph supports async nodes nativey)
# We will replace the original function with this async one.
eod_analyst = eod_analyst_async

# --- GRAPH CONSTRUCTION ---

def memory_chat(state: MasterState):
    # Context Optimization: Only keep the last 6 messages + system prompt
    recent_messages = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    
    system_prompt = (
        f"You are Aura's Mnemosyne (Memory Core). User Context: {state['user_id']}\n"
        "Your ONLY goal is to help the user recall details from their past journals and sessions.\n"
        "1. IMMEDATELY use 'search_past_journals' or 'search_memories' tool based on the user's query.\n"
        "2. Answer the question directly based on the tool output.\n"
        "3. If no info found, say 'I cannot find that record in your memory banks.'\n"
        "4. Be concise, precise, and helpful. No mystical prose here, just facts."
    )
    return {"messages": [llm_with_tools.invoke([SystemMessage(content=system_prompt)] + recent_messages)]}

# --- GRAPH CONSTRUCTION ---

def router_node(state: MasterState):
    phase = state.get("phase", "morning")
    if phase == "session": return "coach"
    if phase == "eod": return "analyst"
    if phase == "memory": return "memory_chat"
    return "planner"

def should_continue(state: MasterState):
    messages = state["messages"]
    last_message = messages[-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        # Check if we already have too many tool calls to prevent loops
        tool_counts = sum(1 for m in messages if isinstance(m, AIMessage) and m.tool_calls)
        if tool_counts > 2: # Allow slightly more depth for search
            return END 
        return "action"
    return END

def return_router(state: MasterState):
    phase = state.get("phase", "morning")
    if phase == "session": return "coach"
    if phase == "eod": return "analyst"
    if phase == "memory": return "memory_chat"
    return "planner"

workflow = StateGraph(MasterState)
workflow.add_node("planner", morning_planner)
workflow.add_node("coach", session_coach)
workflow.add_node("analyst", eod_analyst)
workflow.add_node("memory_chat", memory_chat) # New Node
workflow.add_node("action", ToolNode(tools))

workflow.set_conditional_entry_point(
    router_node,
    {"planner": "planner", "coach": "coach", "analyst": "analyst", "memory_chat": "memory_chat"}
)

workflow.add_conditional_edges("planner", should_continue, {"action": "action", END: END})
workflow.add_conditional_edges("coach", should_continue, {"action": "action", END: END})
workflow.add_conditional_edges("analyst", should_continue, {"action": "action", END: END})
workflow.add_conditional_edges("memory_chat", should_continue, {"action": "action", END: END})

workflow.add_conditional_edges(
    "action",
    return_router,
    {"planner": "planner", "coach": "coach", "analyst": "analyst", "memory_chat": "memory_chat"}
)

master_brain = workflow.compile()