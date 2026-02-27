
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Activity, Zap, TrendingUp, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { orchestratorService } from "@/services/api";

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const AnalyticsModal = ({ isOpen, onClose, userId }: AnalyticsModalProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchData = async () => {
                try {
                    const stats = await orchestratorService.getDashboardStats(userId);
                    setData(stats);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, userId]);

    const ChartBar = ({ date, output, score, maxOutput }: { date: string, output: number, score: number, maxOutput: number }) => {
        const heightPercent = Math.min(100, Math.max(5, (output / maxOutput) * 100));
        const scoreColor = score >= 8 ? "bg-green-400" : score >= 5 ? "bg-yellow-400" : "bg-red-400";

        return (
            <div className="flex flex-col items-center gap-2 group">
                <div className="relative w-12 h-48 bg-panel rounded-t-lg flex items-end justify-center overflow-hidden">
                    {/* Output Bar */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="w-full bg-accent/20 border-t border-accent/50 relative"
                    >
                        {/* Focus Score Indicator (Overlay) */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${scoreColor} shadow-[0_0_10px_currentColor]`} />
                    </motion.div>

                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-background/90 border border-border-subtle p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-accent" /> {Math.round(output)}m
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-foreground" /> Score: {score.toFixed(1)}/10
                        </div>
                    </div>
                </div>
                <span className="text-[10px] text-foreground/30 font-mono rotate-45 origin-left translate-y-2">
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-background/90 border border-border-subtle backdrop-blur-xl rounded-3xl p-8 text-foreground">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent/10 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Focus Analytics</h2>
                            <p className="text-textDim text-sm">Output Volume vs. Mental Clarity</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-panel-hover rounded-full transition-colors">
                        <X className="w-5 h-5 text-foreground/50" />
                    </button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-foreground/20">
                        <Activity className="w-8 h-8 animate-pulse" />
                    </div>
                ) : data && data.charts?.focus_vs_output?.dates && Array.isArray(data.charts.focus_vs_output.dates) && data.charts.focus_vs_output.dates.length > 0 ? (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-panel rounded-2xl p-4 border border-white/5">
                                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Total Focus</p>
                                <p className="text-2xl font-bold text-foreground">{data.summary?.total_hours || 0} <span className="text-sm font-normal text-foreground/40">hrs</span></p>
                            </div>
                            <div className="bg-panel rounded-2xl p-4 border border-white/5">
                                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Avg Session</p>
                                <p className="text-2xl font-bold text-foreground">{data.summary?.avg_session_mins || 0} <span className="text-sm font-normal text-foreground/40">mins</span></p>
                            </div>
                            <div className="bg-panel rounded-2xl p-4 border border-white/5">
                                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Sessions</p>
                                <p className="text-2xl font-bold text-foreground">{data.summary?.total_entries || 0}</p>
                            </div>
                        </div>

                        {/* Main Chart */}
                        <div className="bg-panel rounded-3xl p-8 border border-white/5">
                            <div className="flex justify-between items-end h-64 w-full gap-2 overflow-x-auto pb-8 custom-scrollbar">
                                {data.charts.focus_vs_output.dates.map((date: string, i: number) => (
                                    <ChartBar
                                        key={date}
                                        date={date}
                                        output={data.charts.focus_vs_output.output_mins?.[i] || 0}
                                        score={data.charts.focus_vs_output.focus_scores?.[i] || 0}
                                        maxOutput={Math.max(...(data.charts.focus_vs_output.output_mins || [0]), 120)}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 text-xs text-foreground/30 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-accent/20 border-t border-accent/50"></div>
                                    <span>Output Duration</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-1 bg-green-400"></div>
                                    <span>High Focus</span>
                                    <div className="w-3 h-1 bg-yellow-400 ml-2"></div>
                                    <span>Med</span>
                                    <div className="w-3 h-1 bg-red-400 ml-2"></div>
                                    <span>Low</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border-subtle rounded-3xl">
                        <Calendar className="w-10 h-10 text-foreground/10 mb-4" />
                        <p className="text-foreground/40 font-medium">No Data Available</p>
                        <p className="text-xs text-foreground/20 mt-1">Complete a few sessions to see your trends.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
