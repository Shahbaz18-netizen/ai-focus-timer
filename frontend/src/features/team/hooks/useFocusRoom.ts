import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Participant, ChatMessage, Reaction, UserStatus } from '../types';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export const useFocusRoom = (roomId: string | null, userId: string, username: string) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const supabase = useMemo(() => createClient(), []);

    // Initial load and subscription
    useEffect(() => {
        if (!roomId || !userId) return;

        // Reset state on join
        setParticipants([]);
        setMessages([]);
        setReactions([]);

        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState: RealtimePresenceState<Participant> = channel.presenceState();
                const parsedParticipants: Participant[] = [];

                // Supabase presence returns an object where keys are userIds and values are arrays of presence objects
                Object.values(newState).forEach((presences) => {
                    // Start with the most recent presence
                    const latest = presences[0] as unknown as Participant;
                    // Or merge them if needed? For now, take first.
                    if (latest) {
                        parsedParticipants.push({
                            user_id: latest.user_id,
                            username: latest.username,
                            avatar_url: latest.avatar_url,
                            status: latest.status || 'idle',
                            last_seen: new Date().toISOString(),
                        });
                    }
                });

                setParticipants(parsedParticipants);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
                console.log('join', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
                console.log('leave', key, leftPresences);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .on('broadcast', { event: 'chat' }, ({ payload }: { payload: any }) => {
                setMessages((prev) => [...prev, payload as ChatMessage]);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .on('broadcast', { event: 'reaction' }, ({ payload }: { payload: any }) => {
                const reaction = { ...payload, id: Date.now().toString() } as Reaction;
                setReactions((prev) => [...prev, reaction]);

                // Cleanup reaction after animation (e.g., 3s)
                setTimeout(() => {
                    setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
                }, 4000);
            })
            .subscribe((status: string) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    // Initial track
                    channel.track({
                        user_id: userId,
                        username: username,
                        status: 'idle',
                        online_at: new Date().toISOString(),
                    });
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            setIsConnected(false);
        };
    }, [roomId, userId, username, supabase]);

    const updateStatus = useCallback((status: UserStatus) => {
        if (channelRef.current) {
            channelRef.current.track({
                user_id: userId,
                username: username,
                status: status,
                updated_at: new Date().toISOString(),
            });
        }
    }, [userId, username]);

    const sendMessage = useCallback((content: string) => {
        if (!channelRef.current) return;

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            room_id: roomId!,
            user_id: userId,
            username: username,
            content,
            created_at: new Date().toISOString(),
            type: 'text'
        };

        // Optimistic update? Maybe not for chat, consistency is better.
        // Actually for broadcast, we don't get 'ack' in the same way. 
        // We can just broadcast.
        channelRef.current.send({
            type: 'broadcast',
            event: 'chat',
            payload: message,
        });

        // Add to local immediately
        setMessages((prev) => [...prev, message]);

    }, [roomId, userId, username]);

    const sendReaction = useCallback((emoji: string) => {
        if (!channelRef.current) return;

        const reaction = {
            emoji,
            sender_id: userId,
            // Random x position for variety if desired, but UI can handle that
        };

        channelRef.current.send({
            type: 'broadcast',
            event: 'reaction',
            payload: reaction,
        });

        // Show local reaction too
        const localReaction = { ...reaction, id: Date.now().toString() } as Reaction;
        setReactions((prev) => [...prev, localReaction]);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== localReaction.id));
        }, 4000);

    }, [userId]);

    return {
        participants,
        messages,
        reactions,
        isConnected,
        updateStatus,
        sendMessage,
        sendReaction
    };
};
