import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div className={cn("glass-card p-6", className)} {...props}>
        {children}
    </div>
);
