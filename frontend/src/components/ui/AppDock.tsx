import { motion } from "framer-motion";
import { Target, Users, Brain, BarChart2 } from "lucide-react";

interface AppDockProps {
    currentTab: 'focus' | 'team' | 'brain' | 'analytics';
    onTabChange: (tab: 'focus' | 'team' | 'brain' | 'analytics') => void;
}

export function AppDock({ currentTab, onTabChange }: AppDockProps) {
    const tabs = [
        { id: 'focus', label: 'Focus', icon: Target },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'brain', label: 'Brain', icon: Brain },
        { id: 'analytics', label: 'Stats', icon: BarChart2 },
    ] as const;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-500">
            {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="dock-indicator"
                                className="absolute inset-0 bg-white/15 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className={`w-5 h-5 relative z-10 mb-1.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                        <span className="text-[10px] font-medium tracking-wide relative z-10">
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
