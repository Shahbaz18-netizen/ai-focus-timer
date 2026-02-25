-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create the memories table
create table memories (
  id bigint primary key generated always as identity,
  user_id uuid not null,                -- references auth.users not needed if using simple string IDs for prototype
  content text not null,                -- The actual text (e.g., "Struggled with Python async logic")
  embedding vector(1536),               -- OpenAI 'text-embedding-3-small' vector dimension
  metadata jsonb,                       -- Extra data: { "type": "session_log", "task": "coding", "rating": 3 }
  created_at timestamptz default now()
);

-- 3. Create indices for faster querying (IVFFlat is good for speed)
create index on memories using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. Create the similarity search function
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id text
)
returns table (
  id bigint,
  content text,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity,
    memories.metadata
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  and memories.user_id::text = p_user_id
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
