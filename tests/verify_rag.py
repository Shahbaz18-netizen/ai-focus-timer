import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.rag_service import rag_service

async def test_rag_flow():
    user_id = "test-user-rag"
    
    print("--- 1. Ingesting a Test Memory ---")
    content = "I always feel sleepy after lunch at 2 PM and lose focus on coding tasks."
    metadata = {"type": "journal", "energy_level": "low"}
    
    res = await rag_service.add_memory(user_id, content, metadata)
    print(f"Ingestion Result: {res}")
    
    print("\n--- 2. Searching for Context ---")
    query = "I am about to start coding at 2 PM."
    results = await rag_service.search_memory(user_id, query)
    
    print(f"Query: '{query}'")
    print(f"Retrieved Context:\n{results}")

if __name__ == "__main__":
    asyncio.run(test_rag_flow())
