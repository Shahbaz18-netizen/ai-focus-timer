export interface FocusRoom {
    id: string;
    name: string;
    description?: string;
    topic?: string;
    created_by: string;
    created_at: string;
    is_active: boolean;
    is_private: boolean;
    current_participants: number;
}

export type UserStatus = 'focusing' | 'paused' | 'idle' | 'break';

export interface Participant {
    user_id: string;
    username: string; // or display_name
    avatar_url?: string;
    status: UserStatus;
    last_seen: string;
    focus_duration?: number; // minutes
}

export interface ChatMessage {
    id: string;
    room_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
    type: 'text' | 'reaction' | 'system';
}

export interface Reaction {
    id: string;
    emoji: string;
    sender_id: string;
    x?: number; // for floating animation
    y?: number;
}
