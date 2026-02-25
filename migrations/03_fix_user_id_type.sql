-- Change user_id from UUID to TEXT to support 'demo-user-123'
-- We have to drop the constraints first if they exist, but for a fresh table:

alter table memories
  alter column user_id type text;

-- We also need to update the function signature
drop function if exists match_memories(vector, float, int, text);

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
  and memories.user_id = p_user_id
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
