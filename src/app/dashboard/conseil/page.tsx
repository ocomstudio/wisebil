// src/app/dashboard/conseil/page.tsx
'use client';

import { ConseilPanel } from "@/components/dashboard/conseil-panel";

export default function ConseilPage() {
  return (
    <div className="md:hidden flex flex-col h-full">
        <ConseilPanel />
    </div>
  );
}
