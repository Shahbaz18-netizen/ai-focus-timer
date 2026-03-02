"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfileProps {
    userId: string;
    email?: string;
}

export const UserProfile = ({ userId, email }: UserProfileProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // Force a hard refresh to clear all state and auth cookies
        window.location.href = '/login';
    };

    // Derived initials or name
    const displayName = email ? email.split('@')[0] : "Focus Agent";
    const initial = displayName[0].toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 pr-3 rounded-full bg-surface border border-white/5 hover:border-accent/30 transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {initial}
                </div>
                <div className="hidden md:flex flex-col items-start px-1">
                    <span className="text-xs text-textDim font-medium group-hover:text-foreground transition-colors max-w-[100px] truncate">
                        {displayName}
                    </span>
                    <span className="text-[10px] text-accent/70 flex items-center gap-1">
                        <Sparkles size={8} /> Level 1
                    </span>
                </div>
                <ChevronDown strokeWidth={2} size={14} className={`text-textDim transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 sm:right-0 -mr-4 sm:mr-0 top-full mt-2 w-56 bg-[#0F1115] border border-border-subtle rounded-2xl shadow-2xl backdrop-blur-xl z-[100] overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5">
                            <p className="text-sm font-medium text-foreground truncate">{email || "User"}</p>
                            <p className="text-xs text-textDim mt-1 truncate">ID: {userId.slice(0, 8)}...</p>
                        </div>

                        <div className="p-1">
                            {/* Placeholder for future links like Settings */}
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-textDim hover:text-foreground hover:bg-panel rounded-lg transition-colors text-left" onClick={() => { }}>
                                <User strokeWidth={2} size={16} /> Portfolio (Coming Soon)
                            </button>

                            <div className="h-px bg-panel my-1" />

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                            >
                                <LogOut strokeWidth={2} size={16} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
