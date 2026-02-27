"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Play, CheckCircle2, Clock, Plus, GripVertical, Rocket, PartyPopper, Coffee, Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { orchestratorService } from "@/services/api";

interface KanbanBoardProps {
    tasks: Task[];
    activeTask: Task | null;
    onSelectTask: (task: Task) => void;
    onToggleTask: (taskId: number, status: boolean) => void;
    onEditIntent: () => void;
    onDeleteTask?: (taskId: number) => void;
    userId: string;
    onTaskCreated?: () => void;
    onSetActiveOnly: (task: Task) => void;
}

export const KanbanBoard = ({
    tasks,
    activeTask,
    onSelectTask,
    onToggleTask,
    userId,
    onTaskCreated,
    onSetActiveOnly
}: KanbanBoardProps) => {

    const [columns, setColumns] = useState<{ [key: string]: Task[] }>({
        todo: [],
        in_progress: [],
        done: []
    });

    // Quick Add State
    const [quickAddTask, setQuickAddTask] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const currentActive = tasks.find(t => t.id === activeTask?.id) || activeTask;
        const done = tasks.filter(t => t.is_completed);
        const doing = (currentActive && !currentActive.is_completed) ? [currentActive] : [];
        const todo = tasks.filter(t => !t.is_completed && t.id !== currentActive?.id);

        setColumns({ todo, in_progress: doing, done });
    }, [tasks, activeTask]);

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddTask.trim()) return;

        setIsAdding(true);
        try {
            await orchestratorService.createTask(userId, quickAddTask);
            setQuickAddTask("");
            if (onTaskCreated) onTaskCreated();
        } catch (error) {
            console.error("Failed to create task", error);
        } finally {
            setIsAdding(false);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const task = tasks.find(t => t.id?.toString() === draggableId);
        if (!task) return;

        const destId = destination.droppableId;
        const sourceId = source.droppableId;

        // Optimistic Update
        const newColumns = { ...columns };
        const sourceList = Array.from(newColumns[sourceId]);
        const destList = Array.from(newColumns[destId]);

        sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, task);

        newColumns[sourceId] = sourceList;
        newColumns[destId] = destList;
        setColumns(newColumns);

        if (destId === 'in_progress') {
            if (activeTask?.id !== task.id) {
                onSetActiveOnly(task);
            }
        } else if (destId === 'done') {
            if (!task.is_completed) {
                onToggleTask(task.id!, true);
                triggerConfetti();
            }
        } else if (destId === 'todo') {
            if (task.is_completed) onToggleTask(task.id!, false);
        }
    };

    const ProgressBar = ({ current, total }: { current: number, total: number }) => {
        const percent = Math.min(100, Math.max(0, (current / (total || 1)) * 100));
        return (
            <div className="h-1 bg-panel-hover rounded-full overflow-hidden mt-3">
                <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${percent}%` }}
                />
            </div>
        );
    };

    const EmptyState = ({ type }: { type: string }) => {
        if (type === 'todo') return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <Rocket className="w-8 h-8 mb-3 text-foreground/20" />
                <p className="text-sm font-medium text-foreground/40">No tasks pending</p>
                <p className="text-xs text-foreground/20 mt-1">Add one below to get started</p>
            </div>
        );
        if (type === 'in_progress') return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <Coffee className="w-8 h-8 mb-3 text-foreground/20" />
                <p className="text-sm font-medium text-foreground/40">Ready to focus?</p>
                <p className="text-xs text-foreground/20 mt-1">Drag a task here to lock in</p>
            </div>
        );
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <PartyPopper className="w-8 h-8 mb-3 text-foreground/20" />
                <p className="text-sm font-medium text-foreground/40">No wins yet</p>
                <p className="text-xs text-foreground/20 mt-1">Crush a task to see it here</p>
            </div>
        );
    };

    const Column = ({ title, id, items, type }: { title: string, id: string, items: Task[], type: string }) => (
        <Droppable droppableId={id}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 min-w-[320px] flex flex-col gap-4"
                >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm tracking-widest text-foreground/60 uppercase">{title}</h3>
                            <span className="bg-panel-hover text-foreground/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {items.length}
                            </span>
                        </div>
                        {type === 'in_progress' && <Flame className="w-4 h-4 text-orange-400 animate-pulse" />}
                    </div>

                    <div className="flex-1 space-y-3 min-h-[200px]">
                        <AnimatePresence mode="popLayout">
                            {items.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id?.toString() || ''} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ ...provided.draggableProps.style }}
                                            className={`group relative z-30`}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <Card className={`
                                                    relative overflow-hidden border transition-all duration-300
                                                    ${snapshot.isDragging ? 'shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-105 rotate-2 border-accent' : 'hover:-translate-y-1 hover:shadow-xl'}
                                                    ${type === 'done' ? 'bg-white/[0.02] border-white/5 opacity-60' : 'border-border-subtle'}
                                                `}>
                                                    {/* Gradient Glow on Hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                                    <div className="p-4 relative z-10">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <GripVertical className="w-4 h-4 text-foreground/10 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                                                <div>
                                                                    <h4 className={`font-medium text-sm leading-snug ${type === 'done' ? 'line-through text-foreground/40' : 'text-foreground/90'}`}>
                                                                        {task.title}
                                                                    </h4>

                                                                    {type !== 'done' && (
                                                                        <div className="flex items-center gap-3 mt-2">
                                                                            <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 bg-panel px-2 py-1 rounded-md">
                                                                                <Clock className="w-3 h-3" />
                                                                                <span>{task.estimated_minutes}m est.</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 text-[10px] text-accent/80 bg-accent/5 px-2 py-1 rounded-md border border-accent/10">
                                                                                <Target className="w-3 h-3" />
                                                                                <span>{task.actual_minutes || 0}m act.</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {type === 'todo' && (
                                                                <button
                                                                    onClick={() => onSelectTask(task)}
                                                                    className="opacity-0 group-hover:opacity-100 p-2 bg-accent text-black rounded-lg shadow-lg hover:bg-accent/90 transition-all transform hover:scale-110 active:scale-95"
                                                                    title="Enter Focus Mode"
                                                                >
                                                                    <Play className="w-3 h-3 fill-current" />
                                                                </button>
                                                            )}
                                                            {type === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500/50" />}
                                                        </div>

                                                        {type !== 'todo' && (
                                                            <ProgressBar current={task.actual_minutes || 0} total={task.estimated_minutes || 25} />
                                                        )}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </AnimatePresence>
                        {provided.placeholder}

                        {items.length === 0 && <EmptyState type={type} />}
                    </div>

                    {/* Quick Add (Only in Todo) */}
                    {type === 'todo' && (
                        <motion.form
                            layout
                            onSubmit={handleQuickAdd}
                            className="relative group mt-2"
                        >
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Plus className="w-4 h-4 text-foreground/30" />
                            </div>
                            <input
                                type="text"
                                value={quickAddTask}
                                onChange={(e) => setQuickAddTask(e.target.value)}
                                placeholder="Capture a new task..."
                                className="w-full bg-panel hover:bg-panel-hover focus:bg-panel-hover border border-white/5 hover:border-border-subtle focus:border-accent/50 rounded-xl py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none transition-all shadow-sm"
                                disabled={isAdding}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <kbd className="hidden sm:inline-block px-2 py-0.5 bg-background/40 border border-border-subtle rounded text-[10px] text-foreground/50 font-sans">
                                    ↵
                                </kbd>
                            </div>
                        </motion.form>
                    )}
                </div>
            )}
        </Droppable>
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Wrapper added for horizontal scrolling on mobile */}
            <div className="w-full overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20">
                {/* 
                  Instead of grid-cols-1 md:grid-cols-3, we use flex to ensure 
                  columns stay side-by-side but scroll horizontally on small screens.
                */}
                <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-6 h-full min-h-[400px] w-max md:w-full px-1">
                    <div className="w-[85vw] sm:w-[320px] md:w-auto snap-center"><Column title="Backlog" id="todo" items={columns.todo} type="todo" /></div>
                    <div className="w-[85vw] sm:w-[320px] md:w-auto snap-center"><Column title="In Flow" id="in_progress" items={columns.in_progress} type="in_progress" /></div>
                    <div className="w-[85vw] sm:w-[320px] md:w-auto snap-center"><Column title="Completed" id="done" items={columns.done} type="done" /></div>
                </div>
            </div>
        </DragDropContext>
    );
};
