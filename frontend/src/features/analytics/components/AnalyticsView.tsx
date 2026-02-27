import { useState, useEffect } from "react";
import { BarChart, Activity, Sparkles, Loader2, Lock, FileText } from "lucide-react";
import { orchestratorService } from "@/services/api";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsProps {
    userId: string;
    actualMinutes: number;
    targetMinutes: number;
    reportingTime: string | null;
}

export const AnalyticsView = ({ userId, actualMinutes, targetMinutes, reportingTime }: AnalyticsProps) => {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isJournaling, setIsJournaling] = useState(false);
    const [journalText, setJournalText] = useState("");
    const [reportHistory, setReportHistory] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [stats, setStats] = useState<any>(null);


    const percentage = Math.min(100, Math.round((actualMinutes / (targetMinutes || 1)) * 100));

    // Unlock logic based on Reporting Time
    // Unlock logic based on Reporting Time OR Target Achievement
    const isUnlocked = (() => {
        // 1. If report already exists, unlock.
        if (report) return true;

        // 2. If Target is Met (100%), unlock immediately!
        if (targetMinutes > 0 && actualMinutes >= targetMinutes) return true;

        // 3. Fallback to Reporting Time
        if (!reportingTime) return false;

        const now = new Date();
        const [h, m] = reportingTime.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);

        return now >= target;
    })();

    useEffect(() => {
        // Always fetch history and stats, regardless of lock status
        orchestratorService.getReportHistory(userId).then(setReportHistory).catch(console.error);
        orchestratorService.getDashboardStats(userId).then(setStats).catch(console.error);
    }, [userId]);

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            try {
                const history = await orchestratorService.getReportHistory(userId, date);
                setReportHistory(history);
            } catch (e) { console.error(e); }
        } else {
            orchestratorService.getReportHistory(userId).then(setReportHistory).catch(console.error);
        }
    };


    const handleGenerate = async () => {
        setLoading(true);
        try {
            const data = await orchestratorService.generateDailyReport(userId, journalText);
            setReport(data.report);
            setIsJournaling(false); // Close modal/view
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="p-4 bg-accent/10 rounded-2xl shrink-0">
                        <BarChart className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-foreground">Performance Analytics</h2>
                        <p className="text-sm sm:text-base text-textDim mt-1">Daily Progress: {actualMinutes}m / {targetMinutes}m</p>
                    </div>
                </div>

                {/* Progress Circle or Bar */}
                <div className="flex items-center gap-4 bg-panel px-6 py-3 rounded-2xl border border-border-subtle w-full sm:w-auto justify-center">
                    <div className="text-center sm:text-right">
                        <div className="text-3xl sm:text-2xl font-bold text-accent">{percentage}%</div>
                        <div className="text-[10px] sm:text-xs text-textDim uppercase tracking-wider font-bold mt-1 sm:mt-0">To Target</div>
                    </div>
                </div>
            </header>

            {/* Main Action Area */}
            <div className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 mx-auto">
                {!isUnlocked ? (
                    <div className="p-10 text-center backdrop-blur-2xl bg-background/40 shadow-xl border border-border-subtle rounded-[22px]">
                        <Lock className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Report Locked</h3>
                        <p className="text-textDim max-w-md mx-auto">
                            The Oracle is waiting for the scheduled time.
                            <br />
                            <span className="text-accent font-bold">Unlocks at {new Date(new Date().setHours(...(reportingTime?.split(':')?.map(Number) as [number, number]) || [17, 0])).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                    </div>
                ) : !report ? (
                    <div className="p-10 backdrop-blur-2xl bg-background/40 shadow-xl border border-border-subtle rounded-[22px]">
                        {!isJournaling ? (
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">Target Time Reached!</h3>
                                <p className="text-textDim mb-6">You've hit your goal. Time to reflect and see what the AI thinks.</p>
                                <button
                                    onClick={() => setIsJournaling(true)}
                                    className="bg-accent text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-all"
                                >
                                    Begin End-of-Day Ritual
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-5 h-5 text-accent" />
                                    <h3 className="text-lg font-bold text-foreground">Daily Journal</h3>
                                </div>
                                <textarea
                                    className="w-full bg-background/50 border border-border-subtle rounded-xl p-4 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 min-h-[150px]"
                                    placeholder="How did you feel today? What distracted you? What are you proud of?"
                                    value={journalText}
                                    onChange={(e) => setJournalText(e.target.value)}
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || journalText.length < 10}
                                        className="flex items-center gap-2 bg-accent hover:opacity-90 text-black px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {loading ? "Consulting the Oracle..." : "Generate AI Report"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="p-8 backdrop-blur-2xl bg-background/40 shadow-xl border border-border-subtle rounded-[22px]">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-subtle">
                            <Activity className="w-6 h-6 text-accent" />
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">Oracle's Verdict</h3>
                        </div>
                        <div className="prose prose-invert max-w-none text-foreground/90">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {/* History Control */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-bold text-foreground px-2">
                    {selectedDate ? `Report for ${selectedDate}` : "Recent Reports"}
                </h3>
                <input
                    type="date"
                    className="w-full sm:w-auto bg-background/50 border border-border-subtle rounded-lg px-4 py-2 text-foreground"
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                />
            </div>

            {reportHistory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reportHistory.slice(0, 7).map((h, i) => (
                        <div key={i} className="bg-background/40 backdrop-blur-2xl p-4 sm:p-6 rounded-2xl border border-border-subtle hover:border-accent/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => setReport(h.summary)}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-mono text-accent text-xs sm:text-sm">{new Date(h.date || h.timestamp).toLocaleDateString()}</span>
                                <span className="text-[10px] sm:text-xs text-textDim bg-panel-hover px-2 py-1 rounded-full">View &rarr;</span>
                            </div>
                            <p className="text-foreground/60 text-xs sm:text-sm line-clamp-3">{h.summary}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-textDim italic bg-panel rounded-2xl border border-white/5 text-sm">
                    No reports found for this period.
                </div>
            )}

            {/* Analytics 2.0: Pulse & Stats */}
            {stats && stats.summary && (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-background/40 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border border-border-subtle shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 relative z-10">{stats.summary.total_entries}</div>
                            <div className="text-[10px] sm:text-xs text-textDim uppercase tracking-wider relative z-10 text-center">Total Sessions</div>
                        </div>
                        <div className="bg-background/40 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border border-border-subtle shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 relative z-10">{parseFloat(stats.summary.total_hours).toFixed(1)}</div>
                            <div className="text-[10px] sm:text-xs text-textDim uppercase tracking-wider relative z-10 text-center">Total Hours</div>
                        </div>
                        <div className="bg-panel rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border border-white/5 sm:col-span-2 md:col-span-1 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 relative z-10">{Math.round(stats.summary.avg_session_mins)}</div>
                            <div className="text-[10px] sm:text-xs text-textDim uppercase tracking-wider relative z-10 text-center">Avg Session (m)</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
