import axios from 'axios';
import { API_BASE_URL } from '@/constants/theme';
import { createClient } from '@/lib/supabase/client';
import {
    MorningPlanResponse,
    StrategyResponse,
    DashboardStatsResponse
} from '@/types';

const supabase = createClient();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach Bearer token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor for better error logging
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        console.error("⛔ API 401 Unauthorized:", {
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data
        });
        // Optional: Trigger logout or redirect if needed
    } else if (error.response?.status === 404) {
        console.error(`API 404 Error at ${error.config?.url}`, error.response);
    }
    return Promise.reject(error);
});

export const orchestratorService = {
    async generateMorningPlan(userId: string, targetMinutes: number, tasks: string, targetEndTime: string): Promise<MorningPlanResponse> {
        // userId ignored, handled by token
        const res = await api.post(`${API_BASE_URL}/brain/plan/morning`, {
            target_minutes: targetMinutes,
            tasks,
            target_end_time: targetEndTime
        });
        return res.data;
    },

    getSessionStrategy: async (userId: string, intent: string, durationMins: number): Promise<StrategyResponse> => {
        const response = await api.post('/brain/session/strategy', {
            intent,
            duration_mins: durationMins,
        });
        return response.data;
    },

    async getDashboardStats(userId: string) {
        const response = await api.get(`/brain/dashboard/stats`);
        return response.data;
    },

    getEodReport: async (userId: string): Promise<{ report: string }> => {
        // Corrected to use history endpoint
        try {
            const response = await api.get(`/brain/reports/history`, { params: { limit: 1 } });
            const reports = response.data;
            if (Array.isArray(reports) && reports.length > 0) {
                return { report: reports[0].summary || JSON.stringify(reports[0]) };
            }
            return { report: "No report available." };
        } catch (e) {
            console.warn("Failed to fetch EOD report:", e);
            return { report: "Could not fetch report." };
        }
    },

    getTasks: async (userId: string) => {
        const response = await api.get(`/brain/tasks`);
        return response.data;
    },

    getLatestPlan: async (userId: string) => {
        const response = await api.get(`/brain/plan/latest`);
        return response.data;
    },

    updateTask: async (taskId: number, isCompleted: boolean) => {
        const response = await api.patch(`/brain/tasks/${taskId}`, { is_completed: isCompleted });
        return response.data;
    },

    createTask: async (userId: string, title: string) => {
        const response = await api.post(`/brain/tasks`, { title });
        return response.data;
    },

    deleteTask: async (taskId: number) => {
        const response = await api.delete(`/brain/tasks/${taskId}`);
        return response.data;
    },

    logSession: async (userId: string, taskIntent: string, durationMinutes: number, startTime: string) => {
        const response = await api.post('/brain/sessions/log', {
            task_intent: taskIntent,
            duration_minutes: durationMinutes,
            start_time: startTime
        });
        return response.data;
    },

    submitFeedback: async (sessionId: number, rating: number, miniJournal: string) => {
        const response = await api.post('/brain/sessions/feedback', {
            session_id: sessionId,
            focus_rating: rating,
            mini_journal: miniJournal
        });
        return response.data;
    },

    addMemory: async (userId: string, content: string) => {
        const response = await api.post(`/brain/memories`, { content });
        return response.data;
    },

    getMemories: async (userId: string) => {
        const response = await api.get(`/brain/memories`);
        return response.data;
    },

    deleteMemory: async (memoryId: number) => {
        const response = await api.delete(`/brain/memories/${memoryId}`);
        return response.data;
    },

    generateDailyReport: async (userId: string, journalText: string) => {
        const response = await api.post(`/brain/report/daily`, {
            journal_text: journalText
        });
        return response.data;
    },

    streamCoachResponse: async (userId: string, message: string, history: { role: string, content: string }[], phase: string, onEvent: (data: unknown) => void) => {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${API_BASE_URL}/brain/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
            },
            body: JSON.stringify({
                message: message,
                history: history,
                phase: phase
            })
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        onEvent(data);
                    } catch (e) {
                        console.error('Error parsing SSE:', e);
                    }
                }
            }
        }
    },

    getReportHistory: async (userId: string, date?: string) => {
        const response = await api.get(`/brain/reports/history`, { params: { date } });
        return response.data;
    },

    updateReportingTime: async (userId: string, time: string) => {
        const response = await api.patch(`/brain/plan/reporting-time`, {
            reporting_time: time
        });
        return response.data;
    }
};

export default api;
