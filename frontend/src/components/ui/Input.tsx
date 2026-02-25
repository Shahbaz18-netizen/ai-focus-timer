import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={cn(
            "w-full bg-glass border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:border-accent/50 transition-colors",
            className
        )}
        {...props}
    />
);
