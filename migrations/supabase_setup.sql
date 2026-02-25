-- SQL Setup Script for AI Focus Timer --
-- Run this in your Supabase SQL Editor --

-- 1. Create Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_type TEXT,
    task_intent TEXT,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    duration_minutes FLOAT,
    focus_score INTEGER
);

-- 2. Create Journals Table
CREATE TABLE IF NOT EXISTS public.journals (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES public.sessions(id),
    user_id TEXT,
    content TEXT,
    focus_score INTEGER,
    ai_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Daily Plans Table
CREATE TABLE IF NOT EXISTS public.daily_plans (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    focus_target_minutes INTEGER,
    tasks JSONB,
    suggested_schedule JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Optional but recommended)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

-- Create basic access policy (Allow all for development - BE CAREFUL IN PROD)
CREATE POLICY "Allow All" ON public.sessions FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.journals FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.daily_plans FOR ALL USING (true);
