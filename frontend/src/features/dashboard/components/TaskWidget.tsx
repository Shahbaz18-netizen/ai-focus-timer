"use client";

import { Play, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button"; // Check path
import { Task } from "@/types";

interface TaskWidgetProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
    onToggleTask: (taskId: number, status: boolean) => void;
    onEditIntent: () => void;
}

export const TaskWidget = ({ tasks, onSelectTask, onToggleTask, onEditIntent }: TaskWidgetProps) => {
    return (
        <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Active Objectives</h2>
                <Button variant="outline" onClick={onEditIntent}>Edit Intent</Button>
            </div>
            <div className="space-y-4">
                {tasks.map((t) => (
                    <Card
                        key={t.id}
                        onClick={() => !t.is_completed && onSelectTask(t)}
                        className={`group relative overflow-hidden transition-all duration-300 ${t.is_completed ? 'opacity-50 grayscale cursor-default' : 'hover:border-accent/60 cursor-pointer hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]'}`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleTask(t.id!, t.is_completed); }}
                                    className={`p-1 rounded-md border transition-colors ${t.is_completed ? 'bg-accent/20 border-accent text-accent' : 'border-textDim/30 text-transparent hover:border-accent/50'}`}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <div>
                                    <h3 className={`text-xl font-semibold transition-colors ${t.is_completed ? 'line-through text-textDim' : 'group-hover:text-accent'}`}>{t.title}</h3>
                                    <p className="text-accent/60 text-[10px] font-mono uppercase tracking-[0.2em] mt-1 italic">Active Focus Objective</p>
                                </div>
                            </div>
                            {!t.is_completed && (
                                <div className="flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <span className="text-[10px] font-bold tracking-widest uppercase">Start</span>
                                    <Play className="w-4 h-4 fill-current" />
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
};
