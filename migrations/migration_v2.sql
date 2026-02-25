-- Migration script for Aura Focus OS v2 --

-- 1. Create a dedicated Tasks table for granular tracking
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 25,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    is_rolled_over BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update Daily Plans to include Reporting Time
ALTER TABLE public.daily_plans 
ADD COLUMN IF NOT EXISTS reporting_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_focus_minutes_achieved INTEGER DEFAULT 0;

-- 3. Update Sessions to link to specific tasks and store Pomodoro feedback
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS task_id INTEGER REFERENCES public.tasks(id),
ADD COLUMN IF NOT EXISTS focus_rating INTEGER, -- 1-5 scale
ADD COLUMN IF NOT EXISTS mini_journal TEXT;

-- Enable RLS for New Table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All" ON public.tasks FOR ALL USING (true);
