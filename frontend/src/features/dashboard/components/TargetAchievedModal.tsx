"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Trophy, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TargetAchievedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewAnalytics: () => void;
    targetMinutes: number;
}

export const TargetAchievedModal = ({ isOpen, onClose, onViewAnalytics, targetMinutes }: TargetAchievedModalProps) => {
    useEffect(() => {
        if (isOpen) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                        className="bg-zinc-900 border-2 border-accent/50 rounded-3xl p-8 max-w-md w-full text-center relative shadow-[0_0_100px_rgba(var(--accent-rgb),0.3)]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-foreground transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-accent/10">
                            <Trophy className="w-12 h-12 text-accent" />
                        </div>

                        <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                            Target Time Reached!
                        </h2>
                        <p className="text-zinc-400 mb-8 text-lg">
                            You've hit your <span className="text-accent font-bold">{targetMinutes}m</span> goal for the day.
                            <br />
                            Excellent work, Operator.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={onViewAnalytics}
                                className="w-full h-12 text-lg font-bold bg-accent text-black hover:bg-accent/90"
                            >
                                <ArrowRight className="w-5 h-5 mr-2" />
                                View Performance Report
                            </Button>

                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full h-12 text-lg border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                            >
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                Keep Focusing
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
