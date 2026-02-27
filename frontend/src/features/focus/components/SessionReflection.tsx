"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { orchestratorService } from "@/services/api";
import { useWidgetStore } from "@/features/widgets/stores/useWidgetStore";

interface SessionReflectionProps {
    sessionId: number;
    taskId: number;
    taskTitle: string;
    onComplete: () => void;
}

export const SessionReflection = ({ sessionId, taskId, taskTitle, onComplete }: SessionReflectionProps) => {
    const [loading, setLoading] = useState(false);
    const [focusRating, setFocusRating] = useState(5);

    // Get journal content from store
    const { journalContent, setJournalContent } = useWidgetStore();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Submit session feedback with the journal content from the store
            if (sessionId) {
                await orchestratorService.submitFeedback(sessionId, focusRating, journalContent);
            }

            // 3. Clear the journal for the next session
            setJournalContent("");

            onComplete();
        } catch (err) {
            console.error("Reflection error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">🧠 Session Complete</h1>
                <p className="text-textDim italic">How was your focus on: <span className="text-foreground border-b border-accent/40">{taskTitle}</span>?</p>
            </header>

            <Card className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-6">Focus Rating</h3>
                <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setFocusRating(star)}
                            className={`flex-1 py-4 rounded-xl border transition-all ${focusRating >= star ? 'bg-accent/10 border-accent text-accent' : 'bg-glass border-glass-border text-textDim hover:bg-panel'}`}
                        >
                            <Star className={`w-6 h-6 mx-auto ${focusRating >= star ? 'fill-current' : ''}`} />
                        </button>
                    ))}
                </div>
            </Card>

            {/* Note: Journaling is handled via the Widget during the session. It will be auto-saved on submit. */}
            <div className="text-center text-xs text-foreground/30 font-mono">
                {journalContent ? "✓ Journal notes will be saved." : "No journal notes recorded."}
            </div>

            <Button className="w-full py-5 text-lg font-bold" onClick={handleSubmit} disabled={loading}>
                {loading ? "Synchronizing..." : "COMPLETE SESSION"}
            </Button>
        </div>
    );
};

