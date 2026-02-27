import { useState, useEffect } from "react";
import { orchestratorService } from "@/services/api";
import { Brain, Trash2, Calendar, Activity, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AIStreamer } from "@/features/planning/components/AIStreamer";

interface Memory {
    id: number;
    content: string;
    metadata: any;
    created_at: string;
}

interface BrainViewProps {
    userId: string;
}

export const BrainView = ({ userId }: BrainViewProps) => {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'memories' | 'chat'>('memories');

    // Chat State
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const data = await orchestratorService.getMemories(userId);
                setMemories(data);
            } catch (err) {
                console.error("Failed to fetch memories", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMemories();
    }, [userId]);

    const handleDelete = async (id: number) => {
        // Optimistic update
        setMemories(prev => prev.filter(m => m.id !== id));
        try {
            await orchestratorService.deleteMemory(id);
        } catch (err) {
            console.error("Failed to delete memory", err);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setResponse("");
        setIsStreaming(true);

        const currentQuery = query; // Capture for closure
        // setQuery(""); // Optional: Clear or keep

        try {
            await orchestratorService.streamCoachResponse(
                userId,
                currentQuery,
                [], // No history for now, simple QA
                "memory",
                (data: any) => {
                    if (data.token) {
                        setResponse(prev => prev + data.token);
                    }
                    if (data.status === 'completed') {
                        setIsStreaming(false);
                    }
                }
            );
        } catch (e) {
            console.error(e);
            setIsStreaming(false);
            setResponse("Memory retrieval malfunction. Please try again.");
        }
    };

    if (loading) return <div className="text-center text-white/50 p-20">Accessing Long-Term Memory...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-accent/10 rounded-2xl shrink-0">
                        <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-3xl font-bold tracking-tighter text-white">Memory Core</h2>
                        <p className="text-sm sm:text-base text-textDim">Your AI Coach's long-term retrieval patterns.</p>
                    </div>
                </div>

                <div className="flex bg-white/5 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('memories')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'memories' ? 'bg-accent text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        Index
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-accent text-black' : 'text-white/50 hover:text-white'}`}
                    >
                        Chat
                    </button>
                </div>
            </header>

            {activeTab === 'chat' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-xl rounded-3xl p-6 min-h-[300px]">
                        {!response && !isStreaming ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                                <MessageSquare className="w-12 h-12 mb-4" />
                                <p>Ask me about your past sessions, wins, or blockers.</p>
                                <p className="text-sm mt-2">Example: "How did I fix the Redis bug?"</p>
                            </div>
                        ) : (
                            <AIStreamer content={response} isStreaming={isStreaming} agentType="Mnemosyne" />
                        )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Query long-term memory..."
                            className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 text-white placeholder-white/40 focus:border-accent h-12 text-lg transition-colors"
                        />
                        <Button type="submit" disabled={isStreaming} className="h-12 w-12 p-0 rounded-xl bg-accent text-black hover:bg-accent/90 transition-colors">
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </motion.div>
            )}

            {activeTab === 'memories' && (
                <div className="space-y-6">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!query.trim()) return;
                            try {
                                await orchestratorService.addMemory(userId, query);
                                setQuery("");
                                // Refresh
                                const data = await orchestratorService.getMemories(userId);
                                setMemories(data);
                            } catch (e) { console.error(e); }
                        }}
                        className="flex flex-col sm:flex-row gap-2"
                    >
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Teach me something new..."
                            className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 text-white placeholder-white/40 focus:border-accent h-12 text-sm sm:text-lg transition-colors"
                        />
                        <Button type="submit" className="h-12 px-6 w-full sm:w-auto rounded-xl bg-accent text-black hover:bg-accent/90 font-bold transition-colors">
                            Teach Aura
                        </Button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {memories.map((memory, i) => (
                                <motion.div
                                    key={memory.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-accent/30 rounded-3xl p-6 relative group transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 text-xs font-mono text-accent/70 uppercase tracking-wider">
                                            {memory.metadata?.type === 'session_log' ? (
                                                <><Activity className="w-3 h-3" /> Session Log</>
                                            ) : (
                                                <><Calendar className="w-3 h-3" /> Journal Entry</>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(memory.id)}
                                            className="p-2 bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-500/20 transition-all"
                                            title="Forget this memory"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-white/80 leading-relaxed font-light">
                                        "{memory.content}"
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/30">
                                        <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                                        {memory.metadata?.duration && (
                                            <span>{memory.metadata.duration} mins</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {memories.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                <Brain className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-textDim">No memories yet. Complete a focus session to form one.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

