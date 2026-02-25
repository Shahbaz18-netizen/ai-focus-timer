import os
from langchain_openai import OpenAIEmbeddings
from app.core.supabase_client import supabase

# Initialize OpenAI Embeddings (uses text-embedding-3-small by default or specific model)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

class RAGService:
    """ Service to handle long-term memory ingestion and retrieval. """

    @staticmethod
    async def add_memory(user_id: str, content: str, metadata: dict = {}):
        """
        Embeds the content and saves it to the 'memories' table.
        """
        try:
            # 1. Generate Embedding
            vector = await embeddings.aembed_query(content)
            
            # 2. Insert into Supabase
            data = {
                "user_id": user_id,
                "content": content,
                "embedding": vector,
                "metadata": metadata
            }
            
            res = supabase.table("memories").insert(data).execute()
            return res.data
        except Exception as e:
            print(f"RAG Ingestion Error: {e}")
            # Non-blocking error - we don't want to crash the main app if memory fails
            return None

    @staticmethod
    async def search_memory(user_id: str, query: str, limit: int = 5):
        """
        Semantic search for relevant past memories.
        """
        try:
            # 1. Embed the query
            query_vector = await embeddings.aembed_query(query)
            
            # 2. Call the RPC function we created in SQL
            res = supabase.rpc("match_memories", {
                "query_embedding": query_vector,
                "match_threshold": 0.5, # Adjust based on needed strictness
                "match_count": limit,
                "p_user_id": user_id
            }).execute()
            
            # 3. Format results as a context string
            if res.data:
                return "\n".join([f"- {m['content']}" for m in res.data])
            return "No relevant past memories found."
            
        except Exception as e:
            print(f"RAG Retrieval Error: {e}")
            return "Memory retrieval temporarily unavailable."

    @staticmethod
    async def get_memories(user_id: str, limit: int = 50):
        """Fetches recent memories for visualization."""
        try:
            res = supabase.table("memories").select("id, content, metadata, created_at") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()
            return res.data
        except Exception as e:
            print(f"Error fetching memories: {e}")
            return []

    @staticmethod
    async def delete_memory(memory_id: int):
        """Allows user to forget a specific memory."""
        try:
            supabase.table("memories").delete().eq("id", memory_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting memory: {e}")
            return False

rag_service = RAGService()
