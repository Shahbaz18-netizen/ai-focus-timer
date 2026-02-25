from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import timer, journal, analytics, coach, orchestrator
from app.core.middleware import log_requests

# 🌟 Welcome to the Aura Focus OS Backend! 🌟
# This is the main file that starts our server. It acts like a giant brain 
# connecting all our little mini-brains (routers) together!

app = FastAPI(
    title="Aura Focus OS",
    description="Multi-Agent Productivity System",
    version="1.0.0"
)

# ==========================================
# 🛡️ SECURITY & RULES (MIDDLEWARE)
# ==========================================

# 1. CORS Rules: This tells our server who is allowed to talk to it.
# We say ["*"] which means ANY frontend can talk to us right now.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ai-focus-timer-492bftlxq-shahbazjr2-9308s-projects.vercel.app",
        "https://ai-focus-timer.vercel.app"
    ],  # Security rule: who can access our API
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allow any headers
)

# 2. Logging: Let's attach our custom logger so we can see what's happening
app.middleware("http")(log_requests)


# ==========================================
# 🚦 ROUTES (OUR MINI-BRAINS)
# ==========================================

# Root Health Check: To see if the server is awake
@app.get("/")
def read_root():
    return {"status": "online", "system": "Aura OS"}

# Here we plug in all our different features!
# Think of these like different rooms in a house.
app.include_router(orchestrator.router, prefix="/api/v1/brain", tags=["Orchestrator"])
app.include_router(timer.router, prefix="/api/v1/timer", tags=["Timer"])
app.include_router(journal.router, prefix="/api/v1/journal", tags=["Journal"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(coach.router, prefix="/api/v1/coach", tags=["AI Coach"])


# ==========================================
# 🚀 STARTUP ACTIONS
# ==========================================

# When the server starts, write down a list of all our routes to a file
@app.on_event("startup")
async def startup_event():
    with open("routes.log", "w") as f:
        f.write("--> STARTUP: Printing Registered Routes:\n")
        for route in app.routes:
            if hasattr(route, "path"):
                f.write(f"Route: {route.path} [{route.methods}]\n")
        f.write("<-- END ROUTES\n")

# This is how we run the server if we run this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)