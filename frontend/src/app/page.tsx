"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { InteractiveTimer } from "@/features/focus/components/InteractiveTimer";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { AuraBreather } from "@/features/focus/components/AuraBreather";
import { MorningForm } from "@/features/planning/components/MorningForm";
import { SessionReflection } from "@/features/focus/components/SessionReflection";
import { CheckInModal } from "@/features/accountability/components/CheckInModal";
import { TaskEditModal } from "@/features/dashboard/components/TaskEditModal";
import { useAccountability } from "@/features/accountability/hooks/useAccountability";
import { BrainView } from "@/features/dashboard/components/BrainView";
import { AnalyticsView } from "@/features/analytics/components/AnalyticsView";
import { TargetAchievedModal } from "@/features/dashboard/components/TargetAchievedModal";
import { AuraLoader } from "@/components/ui/AuraLoader";
import { UserProfile } from "@/components/ui/UserProfile";

import { useAppStore } from "@/hooks/useStore";
import { orchestratorService } from "@/services/api";
import { Task } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { AppDock } from "@/components/ui/AppDock";

import { LandingPage } from "@/components/marketing/LandingPage";

import { TeamFeature } from "@/features/team/components/TeamFeature";
import { AmbientPlayer } from "@/features/immersion/components/AmbientPlayer";
import { ImmersiveBackground } from "@/features/immersion/components/ImmersiveBackground";
import { useSceneStore } from "@/features/immersion/hooks/useSceneStore";
import { JournalWidget } from "@/features/widgets/components/JournalWidget";
import { MediaWidget } from "@/features/widgets/components/MediaWidget";
import { SceneSelectorWidget } from "@/features/widgets/components/SceneSelectorWidget";
import { SoundWidget } from "@/features/widgets/components/SoundWidget";
import { TaskWidget } from "@/features/widgets/components/TaskWidget";
import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { useMediaStore } from "@/features/widgets/stores/useMediaStore";

const DigitalClock = () => null;

export const formatReportingTime = (isoStr: string | null) => {
  if (!isoStr) return "N/A";
  if (/^\d{1,2}:\d{2}$/.test(isoStr)) {
    const [hours, minutes] = isoStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  try {
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoStr;
  }
};

// const USER_ID = "demo-user-123"; // REMOVED

export default function AuraFocusOS() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Team Mode State
  const [userStatus, setUserStatus] = useState<'focusing' | 'paused' | 'idle'>('idle');
  const { isZenMode } = useWidgetStore();

  useEffect(() => {
    const checkUser = async () => {
      // --- DEMO MODE BYPASS ---
      // const { data: { user }, error } = await supabase.auth.getUser();
      // if (error || !user) {
      //   setUserId(null);
      // } else {
      //   setUserId(user.id);
      //   setUserEmail(user.email);
      // }

      // Auto-login as demo user
      setUserId("demo-user-123");
      setUserEmail("guest@aura.os");

      setIsLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const {
    appPhase,
    dailyTasks,
    activeTask,
    plannedToday,
    targetFocusMinutes,
    reportingTime,
    actualMins,
    setPhase,
    setTasks,
    setActiveTask,
    setTargetFocusMinutes,
    setReportingTime,
    setActualMins,
    setPlannedToday,
    currentSessionId,
    setCurrentSessionId,
    pomodoroSettings,
    currentPomodoroSession,
    setCurrentPomodoroSession,
    resetPomodoro,
    timerState,
    setTimerState,
    // Fix #10: use persisted store flag instead of ephemeral local state
    hasNotifiedTarget,
    setHasNotifiedTarget,
  } = useAppStore();

  const { showCheckIn, setShowCheckIn, targetTime } = useAccountability(userId || "", plannedToday);
  const { switchToBreakStation, switchToFocusStation } = useMediaStore();
  const [showTaskEditor, setShowTaskEditor] = useState(false);

  const USER_ID = userId || "";

  const handleTimerComplete = useCallback(async (mins: number) => {
    const currentState = useAppStore.getState();
    const mode = currentState.timerState.mode;
    setUserStatus('idle');

    if (mode === 'pomodoro') {
      setActualMins(actualMins + mins);
      const isLongBreakNext = currentPomodoroSession % pomodoroSettings.sessionsBeforeLongBreak === 0;

      if (activeTask) {
        try {
          const res = await orchestratorService.logSession(
            USER_ID, activeTask.title, mins, new Date(Date.now() - mins * 60000).toISOString()
          );
          if (res.session_id) setCurrentSessionId(res.session_id);
        } catch (e) {
          console.error("Failed to log session:", e);
        }
      }

      const nextMode = isLongBreakNext ? 'longBreak' : 'shortBreak';
      const nextDuration = isLongBreakNext ? pomodoroSettings.longBreakLength : pomodoroSettings.shortBreakLength;

      setTimerState({
        mode: nextMode,
        duration: nextDuration,
        secondsRemaining: nextDuration * 60,
        isStarted: pomodoroSettings.autoStartBreak,
        isActive: pomodoroSettings.autoStartBreak,
        endTime: pomodoroSettings.autoStartBreak ? Date.now() + nextDuration * 60 * 1000 : null
      });

      if (isLongBreakNext) {
        setPhase("Reflection");
        switchToBreakStation();
      } else {
        // Stay on Timer page for the break
        setPhase("Timer");
        switchToBreakStation();
        setCurrentPomodoroSession(currentPomodoroSession + 1);
      }

    } else {
      // Finished a break (short or long)
      if (mode === 'longBreak') {
        setCurrentPomodoroSession(1);
      } else {
        setCurrentPomodoroSession(currentPomodoroSession + 1);
      }

      setTimerState({
        mode: 'pomodoro',
        duration: pomodoroSettings.focusLength,
        secondsRemaining: pomodoroSettings.focusLength * 60,
        isStarted: pomodoroSettings.autoStartFocus,
        isActive: pomodoroSettings.autoStartFocus,
        endTime: pomodoroSettings.autoStartFocus ? Date.now() + pomodoroSettings.focusLength * 60 * 1000 : null
      });
      // Always stay on Timer page to start the next focus session
      setPhase("Timer");
      switchToFocusStation();
    }
  }, [actualMins, setActualMins, setPhase, activeTask, setCurrentSessionId, currentPomodoroSession, pomodoroSettings, setTimerState]);

  const handleTimerCancel = useCallback(async (mins: number = 0) => {
    const currentState = useAppStore.getState();
    const mode = currentState.timerState.mode;
    setUserStatus('idle');

    if (mode === 'pomodoro') {
      if (mins > 0) {
        setActualMins(actualMins + mins);
        if (activeTask) {
          try {
            const res = await orchestratorService.logSession(
              USER_ID, activeTask.title, mins, new Date(Date.now() - mins * 60000).toISOString()
            );
            if (res.session_id) setCurrentSessionId(res.session_id);
          } catch (e) { console.error("Failed to log session:", e); }
        }
        setPhase("Reflection");
        switchToBreakStation();
      } else {
        setPhase("FocusPage");
      }
    } else {
      if (mode === 'longBreak') setCurrentPomodoroSession(1);
      setTimerState({
        mode: 'pomodoro',
        duration: pomodoroSettings.focusLength,
        secondsRemaining: pomodoroSettings.focusLength * 60,
        isStarted: false,
        isActive: false,
        endTime: null
      });
      setPhase("FocusPage");
      switchToFocusStation();
    }
  }, [actualMins, setActualMins, setPhase, activeTask, setCurrentSessionId, currentPomodoroSession, pomodoroSettings, setTimerState]);

  const handleSelectTask = (task: Task) => {
    setActiveTask(task);
    setTimerState({
      mode: 'pomodoro',
      duration: pomodoroSettings.focusLength,
      secondsRemaining: pomodoroSettings.focusLength * 60,
      isStarted: false,
      isActive: false,
      endTime: null
    });
    setPhase("Grounding");
  };

  const handleSetActiveOnly = (task: Task) => {
    setActiveTask(task);
    // Do NOT change phase to "Grounding"
  };

  const handleToggleTask = async (taskId: number, newStatus: boolean) => {
    // Prevent patching temporary optimistic tasks
    if (taskId < 0) {
      console.warn("Attempted to toggle a temporary task before it synced with the database.");
      return;
    }

    // Optimistic Update
    const updatedTasks = dailyTasks.map((t: Task) =>
      t.id === taskId ? { ...t, is_completed: newStatus } : t
    );
    setTasks(updatedTasks);

    // If completing the active task, clear it from active to prevent dual-column issues
    if (newStatus && activeTask?.id === taskId) {
      setActiveTask(null);
    }

    try {
      await orchestratorService.updateTask(taskId, newStatus);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Revert on error
      const tasks = await orchestratorService.getTasks(USER_ID);
      setTasks(tasks);
    }
  };

  const handlePlanComplete = async () => {
    // Fetch fresh data
    const [tasks, plan] = await Promise.all([
      orchestratorService.getTasks(USER_ID),
      orchestratorService.getLatestPlan(USER_ID)
    ]);

    setTasks(tasks);
    if (plan.status === "success" && plan.data) {
      setTargetFocusMinutes(plan.data.focus_target_minutes);
      setReportingTime(plan.data.reporting_time);
      setActualMins(plan.data.focused_today || 0);
    }

    setPlannedToday(true);
    setPhase("FocusPage");
  };

  // Initial Data Load
  useEffect(() => {
    // Check for existing plan
    const checkPlan = async () => {
      if (!USER_ID) return;
      try {
        const res = await orchestratorService.getLatestPlan(USER_ID);
        if (res.status === "success" && res.data) {
          const planDate = new Date(res.data.created_at);
          const today = new Date();

          // Compare just the dates (day, month, year)
          const isSameDay = planDate.getDate() === today.getDate() &&
            planDate.getMonth() === today.getMonth() &&
            planDate.getFullYear() === today.getFullYear();

          if (isSameDay) {
            console.log("Restoring plan:", res.data); // Debug
            setTargetFocusMinutes(res.data.focus_target_minutes);
            setReportingTime(res.data.reporting_time);
            setActualMins(res.data.focused_today || 0);
            setPlannedToday(true);
            setPhase("FocusPage");

            // Also fetch tasks since we are skipping planning
            const tasks = await orchestratorService.getTasks(USER_ID);
            setTasks(tasks);
          }
        }
      } catch (e) {
        console.error("Error checking plan:", e);
      }
    };

    checkPlan();
  }, [USER_ID]); // Run when USER_ID changes

  // Request Notification Permission on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Check for Target Completion & Notify
  useEffect(() => {
    // Only notify if we have a target and we just hit it (or passed it)
    // To avoid spamming on every second update, we could use a ref or just rely on the user likely checking it.
    // For now, let's keep it simple but maybe check if we are *just* passed it? 
    // Actually, simple is fine. If they are over, they are over. 
    // Better: use a ref to track if we already notified for this session/day.
    if (targetFocusMinutes > 0 && actualMins >= targetFocusMinutes) {
      if ('Notification' in window && Notification.permission === 'granted') {
        // Check if we already notified? For now, we trust the OS to handle/group them or the user to react.
        // A simple debounce or "notified" flag in store would be better, but let's just send it.
        // Actually, this will fire on every render/update if we don't guard it.
        // Let's use a local ref or state.
      }
    }
  }, [actualMins, targetFocusMinutes]);

  // Ref to track if we notified for this target
  // Fix #10: hasNotified now lives in Zustand (persisted), handled above via store
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    // Reset notification flag if target changes significantly (e.g. next day) - simplified for now
    if (plannedToday && targetFocusMinutes > 0 && actualMins >= targetFocusMinutes && !hasNotifiedTarget) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("🎯 Target Time Reached!", {
          body: `You've hit your ${targetFocusMinutes}m goal! Time to reflect.`,
          icon: "/globe.svg"
        });
      }
      // Fix #10: persist to store so this survives page refresh
      setHasNotifiedTarget(true);
      setShowTargetModal(true);
    }
  }, [actualMins, targetFocusMinutes, plannedToday, hasNotifiedTarget, setHasNotifiedTarget]);


  const [currentTab, setCurrentTab] = useState<'focus' | 'brain' | 'analytics' | 'team'>('focus');

  // ... (keep existing effects)

  const handleUpdateReportingTime = async (time: string) => {
    try {
      setReportingTime(time); // Optimistic
      await orchestratorService.updateReportingTime(USER_ID, time);
    } catch (e) {
      console.error("Failed to update reporting time", e);
    }
  };

  const { currentScene } = useSceneStore();

  // --- Dynamic Title & Theme logic ---
  const formatTimeForTitle = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!timerState.isActive || !timerState.isStarted) {
      document.title = "Aura OS - Focus Workspace";
      return;
    }

    const timeStr = formatTimeForTitle(timerState.secondsRemaining);
    const modeStr = timerState.mode === 'pomodoro' ? 'Focus' : timerState.mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = `(${timeStr}) ${modeStr} - Aura OS`;
  }, [timerState.secondsRemaining, timerState.isActive, timerState.isStarted, timerState.mode]);

  // Determine Accent Color Based on Mode
  const getAccentColor = () => {
    if (!timerState.isStarted) return 'var(--color-focus)'; // Default
    switch (timerState.mode) {
      case 'shortBreak': return 'var(--color-short-break)';
      case 'longBreak': return 'var(--color-long-break)';
      case 'pomodoro':
      default: return 'var(--color-focus)';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <AuraLoader />
      </div>
    );
  }

  if (!userId) {
    return <LandingPage />;
  }

  return (
    <div
      className={`max-w-5xl mx-auto py-4 px-4 sm:py-8 sm:px-6 min-h-[100dvh] flex flex-col relative z-0 zen-mode-transition transition-colors duration-1000 ${isZenMode ? 'zen-mode' : ''}`}
      style={{
        '--color-accent': getAccentColor(),
        backgroundColor: currentScene?.id ? 'transparent' : 'var(--color-background)'
      } as React.CSSProperties}
    >
      <ImmersiveBackground />
      <AmbientPlayer />
      <JournalWidget />
      <MediaWidget />
      <SceneSelectorWidget />
      <SoundWidget />
      <TaskWidget userId={USER_ID} />
      {!isZenMode && (
        <>
          {/* Floating Top Controls */}
          <div className="fixed top-6 right-6 z-40 flex items-center gap-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-xl animate-in fade-in slide-in-from-top-4">
            <UserProfile userId={USER_ID} email={userEmail} />
            <div className="w-px h-4 bg-white/20" />
            <DigitalClock />
          </div>

          {/* App Dock Navigation */}
          <AppDock currentTab={currentTab} onTabChange={setCurrentTab} />
        </>
      )}

      <AnimatePresence mode="wait">
        {/* Only show Morning Form if in Planning phase AND on focus tab (or overlay?) */}
        {appPhase === "Planning" && currentTab === 'focus' && (
          <motion.div key="planning" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex-1">
            <MorningForm userId={USER_ID} onComplete={handlePlanComplete} />
          </motion.div>
        )}

        {appPhase === "FocusPage" && currentTab === 'focus' && (
          <DashboardView
            tasks={dailyTasks}
            targetMinutes={targetFocusMinutes}
            actualMinutes={actualMins}
            reportingTime={reportingTime}
            activeTask={activeTask}
            onSelectTask={handleSelectTask}
            onToggleTask={handleToggleTask}
            onEditIntent={() => setShowTaskEditor(true)}
            userId={USER_ID}
            onTaskCreated={() => orchestratorService.getTasks(USER_ID).then(setTasks)}
            onSetActiveOnly={handleSetActiveOnly}
            onUpdateReportingTime={handleUpdateReportingTime}
          />
        )}

        {currentTab === 'brain' && (
          <motion.div key="brain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <BrainView userId={USER_ID} />
          </motion.div>
        )}

        {currentTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AnalyticsView userId={USER_ID} actualMinutes={actualMins} targetMinutes={targetFocusMinutes} reportingTime={reportingTime} />
          </motion.div>
        )}

        {currentTab === 'team' && (
          <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <TeamFeature userId={USER_ID} username={userEmail?.split('@')[0] || 'Member'} userStatus={userStatus} />
          </motion.div>
        )}

        {appPhase === "Grounding" && activeTask && (
          <motion.div key="grounding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuraBreather
              taskName={activeTask.title}
              initialSeconds={3}
              onComplete={() => setPhase("Timer")}
            />
          </motion.div>
        )}

        {appPhase === "Timer" && activeTask && (
          <motion.div key="timer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center">
            <InteractiveTimer
              key={activeTask.id}
              onComplete={handleTimerComplete}
              onCancel={handleTimerCancel}
              onStatusChange={setUserStatus}
            />
          </motion.div>
        )}

        {appPhase === "Reflection" && activeTask && currentSessionId && (
          <motion.div key="reflection" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SessionReflection
              sessionId={currentSessionId}
              taskId={activeTask.id!}
              taskTitle={activeTask.title}
              onComplete={() => setPhase("Timer")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TaskEditModal
        isOpen={showTaskEditor}
        onClose={() => setShowTaskEditor(false)}
        tasks={dailyTasks}
        userId={USER_ID}
        onTasksUpdated={setTasks}
      />

      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        targetTime={targetTime}
      />

      <TargetAchievedModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        targetMinutes={targetFocusMinutes}
        onViewAnalytics={() => {
          setShowTargetModal(false);
          setCurrentTab('analytics');
        }}
      />

      <CommandPalette
        onAddTasks={() => setShowTaskEditor(true)}
        onSwitchTab={(tab) => setCurrentTab(tab)}
        onStartFocus={() => {
          setCurrentTab('focus');
          setPhase('FocusPage');
          // Optionally prompt to select a task if none active?
          // For now just switch view.
        }}
      />
    </div>
  );
}

