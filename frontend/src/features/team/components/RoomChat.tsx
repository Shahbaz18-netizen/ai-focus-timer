import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomChatProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    currentUserId: string;
}

export const RoomChat = ({ messages, onSendMessage, currentUserId }: RoomChatProps) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}
                        >
                            <span className="text-[10px] text-white/30 ml-1 mb-1">{msg.username}</span>
                            <div
                                className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] break-words ${msg.user_id === currentUserId
                                        ? 'bg-accent/20 text-accent border border-accent/20 rounded-br-none'
                                        : 'bg-white/10 text-white border border-white/10 rounded-bl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-white/2 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 rounded-full bg-accent text-black disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};
