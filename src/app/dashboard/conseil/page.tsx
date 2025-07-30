// src/app/dashboard/conseil/page.tsx
'use client';

import { ConseilPanel } from "@/components/dashboard/conseil-panel";

export default function ConseilPage() {
  return (
    <div className="md:hidden h-[calc(100vh-var(--bottom-nav-height)-var(--header-height))] flex flex-col">
        <style jsx global>{`
          :root {
            --header-height: 65px; /* Adjust if your header height changes */
            --bottom-nav-height: 64px; /* Adjust if your bottom nav height changes */
          }
        `}</style>
        <ConseilPanel />
    </div>
  );
}
