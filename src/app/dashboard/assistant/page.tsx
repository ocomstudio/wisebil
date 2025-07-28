// src/app/dashboard/assistant/page.tsx
'use client';

import { AssistantPanel } from "@/components/dashboard/assistant-panel";

export default function AssistantPage() {

  return (
    <div className="md:hidden h-full">
        <AssistantPanel />
    </div>
  );
}
