
"use client";

import { useState } from "react";
import { useAppStore } from "@/hooks/useStore";
import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";
import { DraggableWidgetWrapper } from "./DraggableWidgetWrapper";
import { CheckSquare, Plus, Square, Trash2, X } from "lucide-react";
import { orchestratorService } from "@/services/api"; // Assuming we can import this
import { Task } from "@/types";

export const TaskWidget = ({ userId }: { userId: string }) => {
    const { activeWidgets, toggleWidget } = useWidgetStore();
    const { dailyTasks, setTasks, activeTask, setActiveTask } = useAppStore();
    const isOpen = activeWidgets.includes("tasks");

    // Local state for new task input
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    if (!isOpen) return null;

    const handleToggle = async (taskId: number | undefined, currentStatus: boolean) => {
        if (!taskId) return;

        // 1. Optimistic Update
        const updatedTasks = dailyTasks.map(t =>
            t.id === taskId ? { ...t, is_completed: !currentStatus } : t
        );
        setTasks(updatedTasks);

        // 2. API Call
        try {
            await orchestratorService.updateTask(taskId, !currentStatus);
        } catch (error) {
            console.error("Failed to toggle task", error);
            // Revert? For now assume it works or next fetch fixes it.
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const tempData: Task = {
            id: Date.now(), // Temp ID
            title: newTaskTitle,
            is_completed: false,
            estimated_minutes: 25,
            // created_at: new Date().toISOString(), // Removed, not in type
            // user_id: userId // Removed, not in type
        };

        // Optimistic Add
        setTasks([...dailyTasks, tempData]);
        setNewTaskTitle("");
        setIsAdding(false);

        try {
            await orchestratorService.createTask(userId, newTaskTitle);
            const freshTasks = await orchestratorService.getTasks(userId);
            setTasks(freshTasks);
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    return (
        <DraggableWidgetWrapper
            id="tasks"
            title="Focus Tasks"
            icon={<CheckSquare className="w-3 h-3" />}
            onClose={() => toggleWidget("tasks")}
            defaultPosition={{ x: 60, y: 100 }}
            width="w-80"
        >
            <div className="flex flex-col h-96">
                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                    {dailyTasks.length === 0 && (
                        <div className="text-center text-white/30 text-xs py-8">
                            No tasks for today.
                        </div>
                    )}

                    {dailyTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${task.is_completed
                                ? 'bg-white/5 border-transparent opacity-60'
                                : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            <button
                                onClick={() => handleToggle(task.id, task.is_completed)}
                                className={`transition-all duration-300 ${task.is_completed ? 'text-accent scale-110' : 'text-white/40 hover:text-white hover:scale-110'}`}
                            >
                                {task.is_completed
                                    ? <div className="w-5 h-5 bg-accent rounded flex items-center justify-center text-black"><CheckSquare className="w-3.5 h-3.5 stroke-[3]" /></div>
                                    : <div className="w-5 h-5 border-2 border-white/30 rounded group-hover:border-white/60" />
                                }
                            </button>

                            <span className={`text-sm flex-1 truncate transition-colors font-medium ${task.is_completed ? 'line-through text-white/40' : 'text-white/90'}`}>
                                {task.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Add Task Input */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    {isAdding ? (
                        <form onSubmit={handleAddTask} className="flex flex-col gap-3 animate-in slide-in-from-bottom-2">
                            <input
                                autoFocus
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-black/40 text-white text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-accent/50 focus:bg-black/60 focus:outline-none placeholder:text-white/20 transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') setIsAdding(false);
                                }}
                            />
                            <div className="flex justify-end gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-3 py-1.5 text-white/50 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-accent text-black rounded-lg font-bold hover:bg-accent/90 shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)] transition-all"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-accent hover:bg-white/5 transition-all p-3 rounded-xl border border-dashed border-white/10 hover:border-accent/30"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Task</span>
                        </button>
                    )}
                </div>
            </div>
        </DraggableWidgetWrapper>
    );
};
