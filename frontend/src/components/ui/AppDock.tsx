import { motion } from "framer-motion";
import { Target, Users, Brain, BarChart2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AppDockProps {
    currentTab: 'focus' | 'team' | 'brain' | 'analytics';
    onTabChange: (tab: 'focus' | 'team' | 'brain' | 'analytics') => void;
}

export function AppDock({ currentTab, onTabChange }: AppDockProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const tabs = [
        { id: 'focus', label: 'Focus', icon: Target },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'brain', label: 'Brain', icon: Brain },
        { id: 'analytics', label: 'Stats', icon: BarChart2 },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3 bg-background/80 backdrop-blur-2xl border-t border-border-subtle pb-safe">
            {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 ${isActive ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="dock-indicator"
                                className="absolute inset-0 bg-foreground/10 rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className={`w-5 h-5 relative z-10 mb-1 transition-transform duration-300 ${isActive ? 'scale-110 text-accent' : 'scale-100'}`} />
                        <span className="text-[10px] font-medium tracking-wide relative z-10">
                            {tab.label}
                        </span>
                    </button>
                );
            })}

            {/* Theme Switcher */}
            {mounted && (
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 text-foreground/50 hover:text-foreground"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
                    <span className="text-[10px] font-medium tracking-wide">
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </span>
                </button>
            )}
        </div>
    );
}
