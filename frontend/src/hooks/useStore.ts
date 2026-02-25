"use client";

import { create } from 'zustand';
import { Task, SessionRecord } from '@/types';

import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
    appPhase: 'Planning' | 'FocusPage' | 'Grounding' | 'Timer' | 'Reflection' | 'Dashboard';
    dailyTasks: Task[];
    history: SessionRecord[];
    activeTask: Task | null;
    plannedToday: boolean;
    targetFocusMinutes: number;
    reportingTime: string | null;
    actualMins: number;
    currentSessionId: number | null;
    // Fix #10: persisted so notification doesn't re-fire after a page refresh
    hasNotifiedTarget: boolean;

    setPhase: (phase: AppState['appPhase']) => void;
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTaskStatus: (taskId: number, isCompleted: boolean) => void;
    setPlannedToday: (val: boolean) => void;
    setActiveTask: (task: Task | null) => void;
    setTargetFocusMinutes: (mins: number) => void;
    setReportingTime: (time: string | null) => void;
    setActualMins: (mins: number) => void;
    addHistory: (record: SessionRecord) => void;
    setCurrentSessionId: (id: number | null) => void;
    setHasNotifiedTarget: (val: boolean) => void;

    // Timer Persistence
    timerState: {
        mode: 'pomodoro' | 'shortBreak' | 'longBreak';
        secondsRemaining: number;
        isActive: boolean;
        isStarted: boolean;
        duration: number;
        endTime: number | null;
    };
    setTimerState: (state: Partial<AppState['timerState']>) => void;

    // Custom Pomodoro State
    pomodoroSettings: {
        focusLength: number;
        shortBreakLength: number;
        longBreakLength: number;
        sessionsBeforeLongBreak: number;
        autoStartBreak: boolean;
        autoStartFocus: boolean;
    };
    currentPomodoroSession: number;
    setPomodoroSettings: (settings: Partial<AppState['pomodoroSettings']>) => void;
    setCurrentPomodoroSession: (session: number) => void;
    resetPomodoro: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            appPhase: 'Planning',
            dailyTasks: [],
            history: [],
            activeTask: null,
            plannedToday: false,
            targetFocusMinutes: 0,
            reportingTime: null,
            actualMins: 0,
            currentSessionId: null,
            hasNotifiedTarget: false, // Fix #10

            setPhase: (phase) => set({ appPhase: phase }),
            setTasks: (tasks) => set({ dailyTasks: tasks }),
            addTask: (task) => set((state) => ({ dailyTasks: [...state.dailyTasks, task] })),
            updateTaskStatus: (taskId, isCompleted) => set((state) => ({
                dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t)
            })),
            setPlannedToday: (val) => set({ plannedToday: val }),
            setActiveTask: (task) => set({ activeTask: task }),
            setTargetFocusMinutes: (mins) => set({ targetFocusMinutes: mins }),
            setReportingTime: (time) => set({ reportingTime: time }),
            setActualMins: (mins) => set({ actualMins: mins }),
            addHistory: (record) => set((state) => ({ history: [...state.history, record] })),
            setCurrentSessionId: (id) => set({ currentSessionId: id }),
            setHasNotifiedTarget: (val) => set({ hasNotifiedTarget: val }),

            timerState: {
                mode: 'pomodoro',
                secondsRemaining: 1500, // 25 mins
                isActive: false,
                isStarted: false,
                duration: 25,
                endTime: null,
            },
            setTimerState: (newState) => set((state) => ({
                timerState: { ...state.timerState, ...newState }
            })),

            pomodoroSettings: {
                focusLength: 25,
                shortBreakLength: 5,
                longBreakLength: 15,
                sessionsBeforeLongBreak: 4,
                autoStartBreak: false,
                autoStartFocus: false,
            },
            currentPomodoroSession: 1,
            setPomodoroSettings: (settings) => set((state) => ({
                pomodoroSettings: { ...state.pomodoroSettings, ...settings }
            })),
            setCurrentPomodoroSession: (session) => set({ currentPomodoroSession: session }),
            resetPomodoro: () => set({ currentPomodoroSession: 1 }),
        }),
        {
            name: 'aura-pomodoro-storage',
            storage: createJSONStorage(() => localStorage),
            // Fix #10 & #20: persist hasNotifiedTarget and daily progress so reload doesn't reset stats
            partialize: (state) => ({
                pomodoroSettings: state.pomodoroSettings,
                hasNotifiedTarget: state.hasNotifiedTarget,
                actualMins: state.actualMins,
                plannedToday: state.plannedToday,
                timerState: state.timerState,
            }),
        }
    )
);
