"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetTime: string | null;
}

export const CheckInModal = ({ isOpen, onClose, targetTime }: CheckInModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="max-w-md w-full border-accent shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)] relative">
                            <button onClick={onClose} className="absolute top-4 right-4 text-textDim hover:text-white">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <span className="text-3xl">👋</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Accountability Check</h2>
                                <p className="text-textDim mb-8">
                                    It's <span className="text-accent font-mono">{targetTime}</span>. You promised to complete your priority list.
                                    <br /><br />
                                    Did you crush it?
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={onClose} variant="outline">Not Yet</Button>
                                    <Button onClick={onClose}>Yes, Mission Complete</Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
