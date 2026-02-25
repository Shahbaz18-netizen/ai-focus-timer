import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Button = ({
    className,
    variant = 'primary',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }) => {
    const variants = {
        primary: "bg-accent text-black hover:opacity-90",
        secondary: "bg-glass text-foreground hover:bg-white/5 border border-glass-border",
        outline: "bg-transparent border border-accent text-accent hover:bg-accent hover:text-black",
    };

    return (
        <button
            className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
