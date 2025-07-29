// src/components/landing/logos/app-store-logo.tsx
import { cn } from "@/lib/utils";

export const AppStoreLogo = ({ className }: { className?: string }) => (
    <svg
      className={cn("text-white", className)}
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M23.933 5.429h-3.41a4.135 4.135 0 0 0-4.042-4.042V0h-1.05v1.387a4.135 4.135 0 0 0-4.042 4.042h-3.41a4.135 4.135 0 0 0-4.042 4.042H2.56v1.05h1.387a4.135 4.135 0 0 0 4.042 4.042h3.41a4.135 4.135 0 0 0 4.042 4.042V20h1.05v-1.387a4.135 4.135 0 0 0 4.042-4.042h3.41a4.135 4.135 0 0 0 4.042-4.042H29.4v-1.05h-1.387a4.135 4.135 0 0 0-4.08-4.042zm-8.455 8.163a3.03 3.03 0 0 1-2.022-2.923a.56.56 0 0 1 .555-.555a3.03 3.03 0 0 1 2.923 2.022a.56.56 0 0 1-.555.555a3.034 3.034 0 0 1-.9-.099zm-2.022 3.965a3.03 3.03 0 0 1-2.923-2.022a.56.56 0 0 1 .555-.555a3.03 3.03 0 0 1 2.022 2.923a.56.56 0 0 1-.555.555a3.034 3.034 0 0 1 .9-.099zm3.965-2.022a3.03 3.03 0 0 1-2.022-2.923a.56.56 0 0 1 .555-.555a3.03 3.03 0 0 1 2.923 2.022a.56.56 0 0 1-.555.555a3.034 3.034 0 0 1-.9-.099z"
      ></path>
      <path
        fill="currentColor"
        d="M26 0h-2v2h2v2h2V2a2 2 0 0 0-2-2zM6 0H4a2 2 0 0 0-2 2v2h2V2h2zM26 28h-2v2a2 2 0 0 0 2 2h2v-2h-2zM6 28H4v2h2v2H4a2 2 0 0 0-2-2v-2h2z"
      ></path>
      <path
        fill="currentColor"
        d="M16 22a6 6 0 1 0 6 6a6 6 0 0 0-6-6zm-1.12 9.53l-2.7-2.7l1.41-1.42l1.29 1.3l3.56-3.56l1.41 1.41z"
      ></path>
    </svg>
);

    