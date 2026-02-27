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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="w-full sm:w-auto"
                    >
                        <Card className="max-w-md w-full border-accent shadow-[0_-20px_50px_rgba(var(--accent-rgb),0.1)] rounded-t-3xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl relative pb-8 sm:pb-6">
                            <button onClick={onClose} className="absolute top-4 right-4 text-textDim hover:text-foreground">
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
