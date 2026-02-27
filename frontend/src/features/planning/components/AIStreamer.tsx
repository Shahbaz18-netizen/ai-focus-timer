"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Zap, Shield, Eye, Sparkles, Brain } from "lucide-react";
import { Card } from "@/components/ui/Card";

export type AgentType = "Sentinel" | "Guardian" | "Oracle" | "General" | "Mnemosyne";

interface AIStreamerProps {
    content: string;
    isStreaming: boolean;
    agentType?: AgentType;
}

const AGENT_CONFIG = {
    Sentinel: {
        icon: <Sparkles className="w-5 h-5 text-accent" />,
        label: "Aura Morning Sentinel",
        color: "border-accent/40",
        bg: "bg-accent/5",
    },
    Guardian: {
        icon: <Shield className="w-5 h-5 text-blue-400" />,
        label: "Aura Tactical Guardian",
        color: "border-blue-500/40",
        bg: "bg-blue-500/5",
    },
    Oracle: {
        icon: <Eye className="w-5 h-5 text-purple-400" />,
        label: "Aura Intelligence Oracle",
        color: "border-purple-500/40",
        bg: "bg-purple-500/5",
    },
    Mnemosyne: {
        icon: <Brain className="w-5 h-5 text-teal-400" />,
        label: "Aura Memory Core",
        color: "border-teal-500/40",
        bg: "bg-teal-500/5",
    },
    General: {
        icon: <MessageSquare className="w-5 h-5 text-accent/60" />,
        label: "Aura Focus Coach",
        color: "border-accent/20",
        bg: "bg-panel",
    },
};

export const AIStreamer = ({ content, isStreaming, agentType = "General" }: AIStreamerProps) => {
    const config = AGENT_CONFIG[agentType];

    return (
        <Card className={`relative overflow-hidden border-2 ${config.color} ${config.bg} backdrop-blur-xl transition-all duration-500`}>
            {/* Animated Shine Effect for Streaming State */}
            <AnimatePresence>
                {isStreaming && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"
                    />
                )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Zap className="w-8 h-8 text-accent fill-current" />
            </div>

            <div className="flex gap-4 items-start relative z-10">
                <motion.div
                    animate={isStreaming ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`mt-1 rounded-xl p-3 bg-background/40 border border-border-subtle shadow-lg`}
                >
                    {config.icon}
                </motion.div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xs font-black uppercase tracking-[.3em] text-foreground/80">
                            {config.label}
                        </h3>
                        {isStreaming && (
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                            </span>
                        )}
                    </div>
                    <div className="text-foreground/90 leading-relaxed font-medium">
                        {content.split('\n').map((line, i) => (
                            <p key={i} className={line.startsWith('[') ? "text-accent font-bold mt-2" : ""}>
                                {line}
                            </p>
                        )) || "Awaiting frequency calibration..."}
                        {isStreaming && (
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="inline-block w-1.5 h-4 bg-accent ml-1 translate-y-0.5"
                            />
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
