
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight, BookOpen, Moon, LogOut } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import confetti from "canvas-confetti";
import { Task } from "@/types";

interface ShutdownRitualModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    onComplete: () => void;
}

export const ShutdownRitualModal = ({ isOpen, onClose, tasks, onComplete }: ShutdownRitualModalProps) => {
    const [step, setStep] = useState(0);
    const completedTasks = tasks.filter(t => t.is_completed);
    const pendingTasks = tasks.filter(t => !t.is_completed);

    const steps = [
        {
            title: "Review Your Wins",
            description: "Acknowledge what you accomplished today.",
            icon: CheckCircle2,
            color: "text-green-400"
        },
        {
            title: "Clear Your Mind",
            description: "Review pending tasks. Are they still relevant?",
            icon: BookOpen,
            color: "text-blue-400"
        },
        {
            title: "Plan Tomorrow",
            description: "Deep Work starts with a plan. What are your top 3 priorities?",
            icon: ArrowRight,
            color: "text-purple-400"
        },
        {
            title: "Shutdown Complete",
            description: "Disconnect and recharge. See you tomorrow.",
            icon: Moon,
            color: "text-indigo-400"
        }
    ];

    useEffect(() => {
        if (isOpen) setStep(0);
    }, [isOpen]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
            if (step === steps.length - 2) {
                // Trigger confetti on final step
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#A020F0', '#00BFFF', '#FFD700']
                });

                // Play shutdown sound (optional)
                // const audio = new Audio('/sounds/shutdown.mp3');
                // audio.play();

                // Call onComplete after a delay or immediately
                setTimeout(onComplete, 2000);
            }
        } else {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-black/90 border border-white/10 backdrop-blur-xl rounded-3xl p-0 overflow-hidden text-white">
                <div className="relative h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                        <div className="flex items-center gap-2">
                            <LogOut className="w-5 h-5 text-accent" />
                            <span className="font-mono text-sm tracking-widest uppercase text-accent/80">Shutdown Protocol</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-white/50" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6 max-w-lg"
                            >
                                <div className={`w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6`}>
                                    {(() => {
                                        const Icon = steps[step].icon;
                                        return <Icon className={`w-10 h-10 ${steps[step].color}`} />;
                                    })()}
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight">{steps[step].title}</h2>
                                <p className="text-lg text-white/60 leading-relaxed">{steps[step].description}</p>

                                {/* Step specific content */}
                                {step === 0 && (
                                    <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/5">
                                        <p className="text-sm text-white/40 uppercase tracking-widest mb-4">Completed Today</p>
                                        {completedTasks.length > 0 ? (
                                            <ul className="space-y-3 text-left">
                                                {completedTasks.map(t => (
                                                    <li key={t.id} className="flex items-center gap-3 text-white/80">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                                                        <span className="line-through text-white/40">{t.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-white/40 italic">No tasks completed yet. That's okay, tomorrow is a new day.</p>
                                        )}
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/5">
                                        <p className="text-sm text-white/40 uppercase tracking-widest mb-4">Pending Tasks</p>
                                        <p className="text-sm text-white/60 mb-4">You have {pendingTasks.length} pending tasks. Leave them for tomorrow.</p>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="mt-8">
                                        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse">
                                            DONE.
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Controls */}
                    <div className="p-8 border-t border-white/5 flex justify-between items-center bg-black/50 z-20">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <Button onClick={handleNext} className="bg-white text-black hover:bg-white/90 px-8">
                            {step === steps.length - 1 ? "Close" : "Next Step"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
                </div>
            </DialogContent>
        </Dialog>
    );
};
