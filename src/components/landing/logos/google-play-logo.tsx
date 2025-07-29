// src/components/landing/logos/google-play-logo.tsx
import { cn } from "@/lib/utils";

export const GooglePlayLogo = ({ className }: { className?: string }) => (
    <svg 
        className={cn("text-white", className)}
        aria-hidden="true"
        role="img"
        width="1em" 
        height="1em" 
        preserveAspectRatio="xMidYMid meet" 
        viewBox="0 0 32 32">
        <path 
            fill="currentColor" 
            d="M28.09 14.53L7.75 1.4A2.08 2.08 0 0 0 4 3.14v25.7A2.08 2.08 0 0 0 7.75 30.6l20.34-13.13a2.22 2.22 0 0 0 0-2.94Z"
        />
        <path 
            fill="currentColor" 
            opacity=".12" 
            d="m16.27 16.03l11.82-7.63l-12 12.01l.18-4.38z"
        />
         <path 
            fill="currentColor" 
            opacity=".15" 
            d="m16.27 16.03l.18 4.38l-12-12.01l11.82 7.63z"
        />
    </svg>
);

    