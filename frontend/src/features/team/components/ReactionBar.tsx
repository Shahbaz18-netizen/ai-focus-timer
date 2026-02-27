import { motion } from 'framer-motion';

interface ReactionBarProps {
    onReact: (emoji: string) => void;
}

const REACTIONS = ['🔥', '❤️', '👏', '🧘', '🚀'];

export const ReactionBar = ({ onReact }: ReactionBarProps) => {
    return (
        <div className="flex gap-2 p-2 bg-panel rounded-full backdrop-blur-sm border border-white/5">
            {REACTIONS.map((emoji) => (
                <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onReact(emoji)}
                    className="text-xl hover:bg-panel-hover p-2 rounded-full transition-colors"
                >
                    {emoji}
                </motion.button>
            ))}
        </div>
    );
};
