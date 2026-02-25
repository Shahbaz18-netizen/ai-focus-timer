
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Command,
    LayoutGrid,
    Brain,
    BarChart2,
    Plus,
    X,
    Music,
    Zap,
    Image as ImageIcon,
    Text,
    CheckSquare,
    Volume2,
    Youtube
} from "lucide-react";
import { SoundMixer } from "@/features/immersion/components/SoundMixer";
import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";

interface CommandPaletteProps {
    onAddTasks: () => void;
    onSwitchTab: (tab: 'focus' | 'brain' | 'analytics' | 'team') => void;
    onStartFocus: () => void;
}

export const CommandPalette = ({ onAddTasks, onSwitchTab, onStartFocus }: CommandPaletteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<'menu' | 'immersion' | 'widgets' | null>(null);

    const { activeWidgets, toggleWidget, isZenMode, toggleZenMode } = useWidgetStore();

    // Toggle logic
    const toggleMenu = () => {
        if (activePanel === 'menu') {
            setActivePanel(null);
            setIsOpen(false);
        } else {
            setActivePanel('menu');
            setIsOpen(true);
        }
    };

    return (
        <>
            <div className="fixed top-1/2 left-4 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
                {/* Main Dock - Vertical Sidebar */}
                <motion.div
                    layout
                    className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex flex-col items-center gap-3 shadow-2xl"
                >
                    <button
                        onClick={toggleMenu}
                        className={`p-3 rounded-full transition-all ${activePanel === 'menu' ? 'bg-accent text-black' : 'hover:bg-white/10 text-white'}`}
                        title="Menu"
                    >
                        {activePanel === 'menu' ? <X className="w-5 h-5" /> : <Command className="w-5 h-5" />}
                    </button>

                    <div className="w-8 h-[1px] bg-white/10" />

                    {/* Direct Widget Toggles */}
                    <SidebarToggle
                        isActive={activeWidgets.includes('media')}
                        onClick={() => toggleWidget('media')}
                        icon={Music}
                        label="Media Player"
                    />
                    <SidebarToggle
                        isActive={activeWidgets.includes('tasks')}
                        onClick={() => toggleWidget('tasks')}
                        icon={CheckSquare}
                        label="Tasks"
                    />
                    <SidebarToggle
                        isActive={activeWidgets.includes('journal')}
                        onClick={() => toggleWidget('journal')}
                        icon={Text}
                        label="Journal"
                    />
                    <SidebarToggle
                        isActive={activeWidgets.includes('sounds')}
                        onClick={() => toggleWidget('sounds')}
                        icon={Volume2}
                        label="Sounds"
                    />
                    <SidebarToggle
                        isActive={activeWidgets.includes('scenes')}
                        onClick={() => toggleWidget('scenes')}
                        icon={ImageIcon}
                        label="Scenes"
                    />

                    <div className="w-8 h-[1px] bg-white/10" />

                    <button
                        onClick={toggleZenMode}
                        className={`p-3 rounded-full transition-all ${isZenMode ? 'bg-accent text-black shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                        title="Zen Mode"
                    >
                        <Zap className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onAddTasks}
                        className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
                        title="Quick Add Task"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>

            {/* Panels - Appearing to the Right */}
            <AnimatePresence>
                {isOpen && activePanel === 'menu' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="fixed top-1/2 left-24 -translate-y-1/2 w-72 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 z-40 shadow-2xl"
                    >
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 px-2">Navigation</h3>
                        <div className="grid grid-cols-1 gap-1.5">
                            <MenuButton icon={LayoutGrid} label="Dashboard" shortcut="D" onClick={() => { onSwitchTab('focus'); setIsOpen(false); setActivePanel(null); }} />
                            <MenuButton icon={Brain} label="Brain" shortcut="B" onClick={() => { onSwitchTab('focus'); onSwitchTab('brain' as any); setIsOpen(false); setActivePanel(null); }} />
                            <MenuButton icon={BarChart2} label="Analytics" shortcut="A" onClick={() => { onSwitchTab('analytics'); setIsOpen(false); setActivePanel(null); }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


// Helper Components
const SidebarToggle = ({ isActive, onClick, icon: Icon, label }: { isActive: boolean, onClick: () => void, icon: any, label: string }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-full transition-all group relative ${isActive
            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
            : 'hover:bg-white/10 text-white/50 hover:text-white relative'}`}
    >
        <Icon className="w-5 h-5" />

        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-2 py-1 bg-black/90 border border-white/10 rounded-md text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
    </button>
);

const MenuButton = ({ icon: Icon, label, onClick, shortcut }: { icon: any, label: string, onClick: () => void, shortcut?: string }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-accent hover:text-black transition-all group w-full text-left"
    >
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-white/50 group-hover:text-black/70" />
            <span className="text-sm font-medium">{label}</span>
        </div>
        {shortcut && (
            <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100 bg-white/10 group-hover:bg-black/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{shortcut}</span>
        )}
    </button>
);
