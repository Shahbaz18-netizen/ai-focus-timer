"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AuraBreatherProps {
    onComplete: () => void;
    taskName: string;
    initialSeconds?: number;
}

export const AuraBreather = ({ onComplete, taskName, initialSeconds = 15 }: AuraBreatherProps) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [instruction, setInstruction] = useState("Inhale...");

    useEffect(() => {
        if (seconds === 0) {
            onComplete();
        }
    }, [seconds, onComplete]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        const instructionTimer = setInterval(() => {
            setInstruction((prev) => (prev === "Inhale..." ? "Exhale..." : "Inhale..."));
        }, 4000);

        return () => {
            clearInterval(timer);
            clearInterval(instructionTimer);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-12"
            >
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-2">Grounding Session</h2>
                <h1 className="text-2xl font-bold tracking-tight">Preparing for: {taskName}</h1>
            </motion.div>

            <div className="relative flex items-center justify-center w-full max-w-lg aspect-square">
                {/* Immersive Pulse Background */}
                <motion.div
                    animate={{
                        scale: instruction === "Inhale..." ? [0.8, 1.2] : [1.2, 0.8],
                        opacity: instruction === "Inhale..." ? [0.1, 0.3] : [0.3, 0.1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear", // Using linear for smoother instruction-sync
                    }}
                    style={{
                        background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
                    }}
                    className="absolute inset-0 blur-[120px] pointer-events-none"
                />

                {/* Primary Breathing Circle */}
                <motion.div
                    animate={{
                        scale: instruction === "Inhale..." ? [1, 1.3] : [1.3, 1],
                        borderColor: instruction === "Inhale..." ? "rgba(var(--accent-rgb), 0.6)" : "rgba(var(--accent-rgb), 0.2)",
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-64 h-64 border-[3px] border-accent/40 rounded-full flex flex-col items-center justify-center relative z-10 bg-background/40 backdrop-blur-3xl shadow-[0_0_100px_rgba(var(--accent-rgb),0.1)]"
                >
                    <div className="text-4xl font-mono font-bold tracking-tighter">{seconds}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mt-1">Seconds</div>
                </motion.div>
            </div>

            <motion.p
                key={instruction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-12 text-2xl font-medium italic tracking-wide text-foreground/80"
            >
                {instruction}
            </motion.p>
        </div>
    );
};
