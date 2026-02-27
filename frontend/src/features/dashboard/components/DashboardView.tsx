"use client";

import { motion } from "framer-motion";
import { ProgressWidget } from "./ProgressWidget";
import { KanbanBoard } from "./KanbanBoard";
import { History, LogOut } from "lucide-react";
import { Task } from "@/types";
import { useState } from "react";
import { ShutdownRitualModal } from "./ShutdownRitualModal";
import { AnalyticsModal } from "./AnalyticsModal";

interface DashboardViewProps {
    tasks: Task[];
    targetMinutes: number;
    actualMinutes: number;
    reportingTime: string | null;
    activeTask?: Task | null;
    onSelectTask: (task: Task) => void;
    onToggleTask: (taskId: number, status: boolean) => void;
    onEditIntent: () => void;
    userId: string;
    onTaskCreated: () => void;
    onSetActiveOnly: (task: Task) => void;
    onUpdateReportingTime: (time: string) => void;
}

export const DashboardView = ({
    tasks,
    targetMinutes,
    actualMinutes,
    reportingTime,
    activeTask,
    onSelectTask,
    onToggleTask,
    onEditIntent,
    userId,
    onTaskCreated,
    onSetActiveOnly,
    onUpdateReportingTime
}: DashboardViewProps) => {

    // Formatting logic moved here or passed formatted. 
    // Let's handle formatting here for simplicity using the helper if we import it, 
    // or just inline it since it's simple enough or assume parent passes it?
    // Parent passes raw ISO string usually.

    const [isShutdownOpen, setIsShutdownOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

    const formattedReportingTime = (() => {
        if (!reportingTime) return "N/A";
        // Simple regex check 
        if (/^\d{1,2}:\d{2}$/.test(reportingTime)) {
            // It's already HH:MM, just format nicely
            const [h, m] = reportingTime.split(':');
            const d = new Date();
            d.setHours(Number(h), Number(m));
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        try {
            return new Date(reportingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return reportingTime; }
    })();



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-8">
            <ProgressWidget
                targetMinutes={targetMinutes}
                actualMinutes={actualMinutes}
                reportingTime={formattedReportingTime}
                onUpdateReportingTime={onUpdateReportingTime}
            />

            {/* Quick Start Hero Section */}
            <div className="relative group rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1" onClick={() => {
                if (activeTask) {
                    onSelectTask(activeTask);
                } else {
                    const nextTask = tasks.find(t => !t.is_completed);
                    if (nextTask) {
                        onSelectTask(nextTask);
                    } else {
                        onEditIntent(); // Open add task modal if no tasks
                    }
                }
            }}>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-background/40 backdrop-blur-2xl border border-border-subtle rounded-3xl group-hover:border-border-subtle transition-colors" />

                <div className="relative p-8 flex flex-col items-center justify-center gap-4 text-center z-10">
                    <div className="w-16 h-16 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] group-hover:scale-110 transition-transform duration-300">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-1" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            {activeTask ? "Resume Focus" : "Start Focus Session"}
                        </h2>
                        <p className="text-foreground/50 text-sm font-medium">
                            {activeTask
                                ? `Continue: ${activeTask.title}`
                                : tasks.find(t => !t.is_completed)
                                    ? `Next up: ${tasks.find(t => !t.is_completed)?.title}`
                                    : "Ready to flow? Add a task to begin."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden md:block">
                <KanbanBoard
                    tasks={tasks}
                    activeTask={activeTask || null}
                    onSelectTask={onSelectTask}
                    onToggleTask={onToggleTask}
                    onEditIntent={onEditIntent}
                    userId={userId}
                    onTaskCreated={onTaskCreated}
                    onSetActiveOnly={onSetActiveOnly}
                />
            </div>

            {/* Placeholder for Analytics Link */}
            <section className="bg-background/40 backdrop-blur-2xl rounded-3xl p-6 border border-border-subtle shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 transition-all hover:border-border-subtle hover:shadow-xl">
                <div className="flex items-center gap-4 cursor-pointer group w-full md:w-auto" onClick={() => setIsShutdownOpen(true)}>
                    <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors shrink-0">
                        <LogOut className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground/90 group-hover:text-foreground transition-colors">Shutdown Ritual</h2>
                        <p className="text-xs text-foreground/50 group-hover:text-foreground/70 transition-colors">End day & clear mind</p>
                    </div>
                </div>

                <div className="flex items-center justify-between cursor-pointer group w-full md:w-auto md:ml-8 border-t border-border-subtle md:border-none pt-4 md:pt-0" onClick={() => setIsAnalyticsOpen(true)}>
                    {/* Existing Analysis Link */}
                    <div className="flex items-center gap-3 text-foreground/60 shrink-0">
                        <History className="w-5 h-5 group-hover:text-accent transition-colors" />
                        <h2 className="text-lg font-bold group-hover:text-foreground transition-colors hidden sm:block">Session Archives</h2>
                        <h2 className="text-lg font-bold group-hover:text-foreground transition-colors sm:hidden">Archives</h2>
                    </div>
                    <span className="text-sm font-semibold text-foreground/40 group-hover:text-accent ml-6 shrink-0 transition-colors">View Analysis &rarr;</span>
                </div>
            </section>

            <ShutdownRitualModal
                isOpen={isShutdownOpen}
                onClose={() => setIsShutdownOpen(false)}
                tasks={tasks}
                onComplete={() => console.log("Day Ended")}
            />

            <AnalyticsModal
                isOpen={isAnalyticsOpen}
                onClose={() => setIsAnalyticsOpen(false)}
                userId={userId}
            />
        </motion.div>
    );
};
