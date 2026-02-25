ai-focus-timer/
├── app/
│   ├── api/                # API Routes (Endpoints)
│   │   ├── v1/
│   │   │   ├── timer.py    # Timer related routes
│   │   │   ├── journal.py  # Journaling routes
│   │   │   └── coach.py    # AI Chat/Insights routes
│   ├── core/               # Configuration & Security
│   │   ├── config.py       # Pydantic Settings (ENV variables)
│   │   └── database.py     # SQLAlchemy/Postgres setup
│   ├── models/             # Database Schemas (SQLAlchemy)
│   ├── schemas/            # Data Validation (Pydantic models)
│   ├── services/           # Business Logic (The "Brain")
│   │   ├── ai_service.py   # LangChain/LangGraph logic
│   │   └── vector_db.py    # ChromaDB operations
│   └── main.py             # Entry point of the FastAPI app
├── streamlit_app/          # Frontend files
│   └── app.py
├── data/                   # Local Vector DB storage (ignored by git)
├── .env                    # API Keys and Secrets
├── .gitignore
├── README.md
└── requirements.txt




🧠 How We Used LangGraph in AI Focus Timer

In a normal LLM app, the flow is: User Input -> LLM -> Output.
In our app, LangGraph creates a State Machine that allows the AI to "think" and "act" in loops.

1. The "State" (Memory of the Agent)

Humne AgentState define kiya. Ye ek notebook ki tarah hai jo Agent apne saath carry karta hai. Isme saari purani messages save rehti hain taaki Agent ko yaad rahe ki usne pehle kya bola aur tools se kya data mila.

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], "The messages in conversation"]


2. The Nodes (The Workstations)

Humne do main nodes banaye:

agent node: Ye hamara "Brain" hai. Ye decide karta hai ki user ko seedha jawab dena hai ya pehle koi Tool (Supabase/Vector DB) use karke data mangwana hai.

action node (ToolNode): Ye "Hands" hain. Agar Brain ne bola "Mujhe Supabase se data chahiye," toh ye node jaakar database se data lekar wapas aata hai.

3. The Logic Flow (The "Cycle")

Ye hai asli architecture jo tumhe job-ready banati hai:

Entry: User ne pucha: "How was my performance last week?"

Assistant Node: LLM ne query dekhi. Use laga, "Mujhe data chahiye." Usne ek tool_call generate kiya for fetch_user_history.

Conditional Edge (should_continue): LangGraph ne check kiya: "Kya LLM ne tool maanga hai?"

Yes: Route karo action node par.

Action Node: fetch_user_history function chala, Supabase se 7 din ka data aaya.

The Loop: Data lekar control wapas assistant node par gaya.

Assistant Node (Reflect): Ab LLM ke paas User ka sawal + Supabase ka data dono hain. Wo analyze karta hai aur final reply deta hai.

Exit: LangGraph ne dekha ab koi tool call nahi hai, toh flow END par gaya.

4. Why this is "Agentic"?

Isse Agentic Workflow isliye kehte hain kyunki:

Autonomy: Humne AI ko nahi bola ki Supabase check karo. AI ne khud decide kiya ki user ke sawal ka jawab dene ke liye use tool ki zaroorat hai.

Error Correction: Agar tool ne galat data diya, AI wapas tool call kar sakta hai (Looping).

5. Visual Representation

graph TD
    Start((START)) --> Agent[Agent Node: Thinking]
    Agent --> Decision{Needs Tool?}
    Decision -- Yes --> Action[Action Node: Executing Tool]
    Action --> Agent
    Decision -- No --> End((END: Final Reply))
