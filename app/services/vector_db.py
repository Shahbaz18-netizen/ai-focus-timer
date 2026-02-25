import chromadb
from chromadb.utils import embedding_functions
import os

class VectorDBService:
    def __init__(self):
        # Local storage folder
        self.client = chromadb.PersistentClient(path="./data/vector_db")
        # OpenAI Embeddings use karenge text ko numbers (vectors) mein badalne ke liye
        self.embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY"),
            model_name="text-embedding-3-small"
        )
        self.collection = self.client.get_or_create_collection(
            name="user_journals",
            embedding_function=self.embedding_fn
        )

    def add_journal(self, journal_id: int, content: str, metadata: dict):
        self.collection.add(
            ids=[str(journal_id)],
            documents=[content],
            metadatas=[metadata]
        )

    def query_similar_journals(self, current_content: str, n_results: int = 3):
        results = self.collection.query(
            query_texts=[current_content],
            n_results=n_results
        )
        # Humein sirf documents (purani baatein) chahiye
        return results['documents'][0] if results['documents'] else []

vector_db = VectorDBService()