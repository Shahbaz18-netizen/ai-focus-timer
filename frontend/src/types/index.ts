export interface Task {
    id?: number;
    title: string;
    estimated_minutes: number;
    actual_minutes?: number; // Focused time from sessions
    status?: 'todo' | 'in_progress' | 'done'; // Kanban status
    is_completed: boolean; // Deprecated or kept for backward compat? Let's keep for now.
    completed_at?: string;
    is_rolled_over?: boolean;
}

export interface SessionRecord {
    id?: number;
    user_id: string;
    session_type?: string;
    task_id?: number;
    task_intent: string;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
    focus_rating?: number;
    mini_journal?: string;
}

export interface MorningPlanResponse {
    plan: {
        schedule: { task: string; time: string }[];
        advice: string;
    };
    coach_message: string;
}

export interface StrategyResponse {
    strategy: string;
}

export interface AnalyticsSummary {
    total_hours: number;
    avg_session_mins: number;
    total_entries: number;
    avg_per_week_hrs: number;
}

export interface AnalyticsCharts {
    day_of_week: Record<string, number>;
    categories: Record<string, number>;
    monthly_trends: Record<string, number>;
}

export interface DashboardStatsResponse {
    summary: AnalyticsSummary;
    charts: AnalyticsCharts;
}
