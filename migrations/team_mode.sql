-- Migration: Team Mode (Focus Rooms)
-- Create focus_rooms table
CREATE TABLE IF NOT EXISTS public.focus_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    topic TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT false,
    password_hash TEXT, -- simplified for now, or use a separate room_secrets table
    current_participants INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.focus_rooms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public rooms are viewable by everyone" 
ON public.focus_rooms FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create rooms" 
ON public.focus_rooms FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Creators can update their rooms" 
ON public.focus_rooms FOR UPDATE 
USING (auth.uid() = created_by);

-- Realtime
-- Make sure to enable Realtime for this table in Supabase Dashboard -> Database -> Replication
alter publication supabase_realtime add table public.focus_rooms;

-- We will handle participants via Realtime Presence (ephemeral), 
-- but if we need persistent history of who joined, we can add a room_history table later.
