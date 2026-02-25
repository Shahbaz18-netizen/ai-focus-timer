"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowRight, Clock, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { orchestratorService } from "@/services/api";
import { AIStreamer } from "./AIStreamer";

interface MorningFormProps {
    onComplete: (success?: boolean) => void;
    userId: string;
}

export const MorningForm = ({ onComplete, userId }: MorningFormProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [tasks, setTasks] = useState<string[]>([]);
    const [currentTask, setCurrentTask] = useState("");
    const [focusHours, setFocusHours] = useState(4);
    const [targetTime, setTargetTime] = useState("17:00");

    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const addTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (currentTask.trim()) {
            setTasks([...tasks, currentTask.trim()]);
            setCurrentTask("");
        }
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const submitPlan = async () => {
        setLoading(true);
        try {
            // Just join the tasks
            const taskString = tasks.join(", ");

            const res = await orchestratorService.generateMorningPlan(
                userId,
                focusHours * 60,
                taskString,
                targetTime
            );

            setAiResponse(res.coach_message);
            setStep(4); // Summary Step

            // Wait a bit then notify parent
            // setTimeout(() => onComplete(res), 5000); 
            // Actually, let user click "Start Day"
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Card className="glass-card p-8 border-accent/20">
                            <h2 className="text-3xl font-bold mb-2">Morning Design</h2>
                            <p className="text-textDim mb-8">What are your absolute must-dos today?</p>

                            <div className="space-y-4 mb-8">
                                <ul className="space-y-2">
                                    {tasks.map((t, i) => (
                                        <li key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                            <span>{t}</span>
                                            <button onClick={() => removeTask(i)} className="text-textDim hover:text-red-400"><X className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                                <form onSubmit={addTask} className="flex gap-2">
                                    <Input
                                        value={currentTask}
                                        onChange={(e) => setCurrentTask(e.target.value)}
                                        placeholder="Add a task..."
                                        autoFocus
                                    />
                                    <Button type="submit" variant="secondary"><Plus className="w-5 h-5" /></Button>
                                </form>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setStep(2)} disabled={tasks.length === 0}>
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Card className="glass-card p-8 border-accent/20">
                            <h2 className="text-3xl font-bold mb-2">Priority & Focus</h2>
                            <p className="text-textDim mb-8">Define your north star.</p>

                            <div className="space-y-6 mb-8">


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-widest text-accent mb-2">Focus Budget</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={focusHours}
                                                onChange={(e) => setFocusHours(Number(e.target.value))}
                                                className="font-mono text-lg"
                                            />
                                            <span className="text-textDim">Hours</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold uppercase tracking-widest text-accent mb-2">Check-in Time</label>
                                        <Input
                                            type="time"
                                            value={targetTime}
                                            onChange={(e) => setTargetTime(e.target.value)}
                                            className="font-mono text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={submitPlan} disabled={tasks.length === 0}>
                                    {loading ? "Designing..." : "Initialize Day"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === 4 && aiResponse && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="space-y-6">
                            <AIStreamer content={aiResponse} isStreaming={false} agentType="Sentinel" />

                            <Card className="border-accent/30 bg-accent/5 p-6 text-center">
                                <Clock className="w-8 h-8 text-accent mx-auto mb-4" />
                                <h3 className="text-lg font-bold">Accountability Protocol Active</h3>
                                <p className="text-textDim mt-2">I will verify your progress at <span className="text-white font-mono">{targetTime}</span>.</p>
                            </Card>

                            <Button className="w-full py-6 text-lg" onClick={() => onComplete(true)}>
                                Enter Focus Room
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
