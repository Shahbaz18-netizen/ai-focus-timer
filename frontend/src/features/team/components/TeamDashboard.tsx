import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FocusRoom } from '../types';
import { Users, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamDashboardProps {
    onJoinRoom: (roomId: string) => void;
    userId: string;
}

export const TeamDashboard = ({ onJoinRoom, userId }: TeamDashboardProps) => {
    const [rooms, setRooms] = useState<FocusRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomTopic, setNewRoomTopic] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const supabase = createClient();

    const fetchRooms = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('focus_rooms')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rooms:', error);
        } else {
            setRooms(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRooms();

        // Subscription for room updates could go here
    }, []);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        const { data, error } = await supabase
            .from('focus_rooms')
            .insert({
                name: newRoomName,
                topic: newRoomTopic,
                is_private: isPrivate,
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room');
        } else if (data) {
            setRooms([data, ...rooms]);
            setShowCreateModal(false);
            onJoinRoom(data.id);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Focus Together</h1>
                    <p className="text-foreground/50 mt-1">Join a room and stay accountable with others.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-full font-bold hover:bg-accent/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Room
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Public Rooms */}
                    {rooms.map((room) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onJoinRoom(room.id)}
                            className="group relative bg-background/40 backdrop-blur-2xl hover:bg-background/60 border border-border-subtle hover:border-accent/30 rounded-3xl p-6 transition-all duration-500 cursor-pointer overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative flex justify-between items-start mb-4">
                                <div className="p-3 bg-panel rounded-2xl">
                                    <Users className="w-6 h-6 text-accent" />
                                </div>
                                {room.is_private && <Lock className="w-4 h-4 text-foreground/30" />}
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{room.name}</h3>
                            {room.topic && <p className="text-sm text-foreground/50 mb-4 font-mono">{room.topic}</p>}

                            <div className="flex items-center gap-2 text-xs text-foreground/30 uppercase tracking-widest">
                                <span className={room.current_participants > 0 ? "text-green-400" : ""}>
                                    {room.current_participants || 0} Online
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {rooms.length === 0 && (
                        <div className="col-span-full py-20 text-center text-foreground/30">
                            No active rooms found. Create one to get started!
                        </div>
                    )}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background/80 backdrop-blur-3xl border border-border-subtle shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6"
                    >
                        <h2 className="text-2xl font-bold">Create Focus Room</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g. Deep Work Station"
                                    className="w-full bg-panel border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:border-accent outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">Topic (Optional)</label>
                                <input
                                    type="text"
                                    value={newRoomTopic}
                                    onChange={(e) => setNewRoomTopic(e.target.value)}
                                    placeholder="e.g. Coding only, no chat"
                                    className="w-full bg-panel border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:border-accent outline-none transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    className="rounded border-border-subtle bg-panel text-accent focus:ring-accent"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-foreground/70">Private Room</label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-border-subtle hover:bg-panel transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
