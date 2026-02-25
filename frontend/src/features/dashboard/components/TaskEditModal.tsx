"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Task } from "@/types";
import { orchestratorService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface TaskEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    userId: string;
    onTasksUpdated: (newTasks: Task[]) => void;
}

export const TaskEditModal = ({ isOpen, onClose, tasks, userId, onTasksUpdated }: TaskEditModalProps) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setLoading(true);
        try {
            await orchestratorService.createTask(userId, newTaskTitle);
            const updated = await orchestratorService.getTasks(userId);
            onTasksUpdated(updated);
            setNewTaskTitle("");
        } catch (error) {
            console.error("Failed to add task", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await orchestratorService.deleteTask(taskId);
            const updated = await orchestratorService.getTasks(userId);
            onTasksUpdated(updated);
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg mx-2"
                    >
                        <Card className="p-4 sm:p-6 border-accent/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h2 className="text-xl font-bold">Edit Intent</h2>
                                <button onClick={onClose} className="text-textDim hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddTask} className="flex gap-2 mb-6 shrink-0">
                                <Input
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Add new objective..."
                                    autoFocus
                                />
                                <Button type="submit" disabled={loading || !newTaskTitle.trim()}>
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </form>

                            <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 group">
                                        <span className={`break-words line-clamp-2 ${task.is_completed ? "line-through text-textDim" : ""}`}>{task.title}</span>
                                        <button
                                            onClick={() => handleDeleteTask(task.id!)}
                                            className="text-textDim opacity-50 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-400 transition-all p-2 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-textDim text-center py-4 italic">No active tasks. Add one above.</p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end shrink-0">
                                <Button onClick={onClose} variant="secondary">Done</Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
