import { useEffect } from 'react';
import { useFocusRoom } from '../hooks/useFocusRoom';
import { PulseAvatar } from './PulseAvatar';
import { ReactionBar } from './ReactionBar';
import { RoomChat } from './RoomChat';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomViewProps {
    roomId: string;
    userId: string;
    username: string;
    onLeave: () => void;
    userStatus: 'focusing' | 'paused' | 'idle';
}

export const RoomView = ({ roomId, userId, username, onLeave, userStatus }: RoomViewProps) => {
    const { participants, messages, reactions, sendMessage, sendReaction, updateStatus } = useFocusRoom(roomId, userId, username);

    // Sync status from parent (Timer) to Room
    useEffect(() => {
        if (updateStatus) {
            updateStatus(userStatus);
        }
    }, [userStatus, updateStatus]);

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto gap-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onLeave} className="text-white/50 hover:text-white transition-colors">
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold">Focus Room</h2>
                    <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent">
                        {participants.length} Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Main Focus Area - Avatars */}
                <div className="md:col-span-2 relative bg-white/2 rounded-3xl border border-white/5 p-8 flex flex-wrap content-start gap-8 overflow-y-auto">
                    {participants.map((p) => (
                        <div key={p.user_id} className="relative">
                            <PulseAvatar participant={p} />
                            {/* Floating Reactions */}
                            <AnimatePresence>
                                {reactions
                                    .filter((r) => r.sender_id === p.user_id)
                                    .map((r) => (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 2 }}
                                            className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl pointer-events-none"
                                        >
                                            {r.emoji}
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    ))}

                    {/* Floating controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <ReactionBar onReact={sendReaction} />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-1 h-full">
                    <RoomChat messages={messages} onSendMessage={sendMessage} currentUserId={userId} />
                </div>
            </div>
        </div>
    );
};
