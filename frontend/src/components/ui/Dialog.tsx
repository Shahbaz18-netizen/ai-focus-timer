
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    {/* Content Wrapper to trap focus/clicks could go here, but keeping simple */}
                    {children}
                </div>
            )}
        </AnimatePresence>
    );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "relative z-50 w-full overflow-hidden rounded-lg bg-background p-6 shadow-lg sm:rounded-xl",
                className
            )}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
        >
            {children}
        </motion.div>
    );
};
