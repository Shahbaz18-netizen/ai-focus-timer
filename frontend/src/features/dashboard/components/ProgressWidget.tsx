import { useState } from "react";
import { Target, TrendingUp, Clock, Edit2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ProgressWidgetProps {
    targetMinutes: number;
    actualMinutes: number;
    reportingTime: string | null;
    onUpdateReportingTime?: (time: string) => void;
}

const formatReportingTime = (isoStr: string | null) => {
    if (!isoStr) return "N/A";
    if (/^\d{1,2}:\d{2}$/.test(isoStr)) {
        const [hours, minutes] = isoStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return isoStr;
};

export const ProgressWidget = ({ targetMinutes, actualMinutes, reportingTime, onUpdateReportingTime }: ProgressWidgetProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTime, setTempTime] = useState(reportingTime || "17:00");

    const handleSave = () => {
        if (onUpdateReportingTime) {
            onUpdateReportingTime(tempTime);
        }
        setIsEditing(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="flex flex-col items-center justify-center py-8 border-accent/20">
                <Target className="text-accent w-8 h-8 mb-2" />
                <h3 className="text-xs uppercase tracking-widest text-textDim">Daily Target</h3>
                <p className="text-3xl font-bold">{(targetMinutes / 60).toFixed(1)}h</p>
            </Card>
            <Card className="flex flex-col items-center justify-center py-8 border-accent/20">
                <TrendingUp className="text-accent w-8 h-8 mb-2" />
                <h3 className="text-xs uppercase tracking-widest text-textDim">Focused Today</h3>
                <p className="text-3xl font-bold">{(actualMinutes / 60).toFixed(1)}h</p>
            </Card>
            <Card className="relative flex flex-col items-center justify-center py-8 border-accent/20 group">
                <Clock className="text-accent w-8 h-8 mb-2" />
                <h3 className="text-xs uppercase tracking-widest text-textDim">Report At</h3>

                {!isEditing ? (
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">{formatReportingTime(reportingTime)}</p>
                        {onUpdateReportingTime && (
                            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-panel-hover rounded">
                                <Edit2 className="w-4 h-4 text-textDim" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="time"
                            value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                            className="bg-background/50 border border-border-subtle rounded px-2 py-1 text-lg text-foreground focus:outline-none focus:border-accent"
                        />
                        <button onClick={handleSave} className="p-1 hover:bg-green-500/20 rounded text-green-400">
                            <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};
