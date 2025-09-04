// src/context/team-chat-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    'data-ai-hint': string;
}

interface TeamChatContextType {
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
}

const TeamChatContext = createContext<TeamChatContextType | undefined>(undefined);

export const TeamChatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <TeamChatContext.Provider value={{ selectedMember, setSelectedMember }}>
      {children}
    </TeamChatContext.Provider>
  );
};

export const useTeamChat = () => {
  const context = useContext(TeamChatContext);
  if (context === undefined) {
    throw new Error('useTeamChat must be used within a TeamChatProvider');
  }
  return context;
};
