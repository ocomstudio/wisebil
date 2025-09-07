// src/types/enterprise.ts
import type { Transaction } from './transaction';

export interface Member {
    uid: string;
    email: string;
    name: string;
    role: string;
    type: 'owner' | 'member';
}
export interface Enterprise {
    id: string;
    name: string;
    description: string;
    ownerId: string; // UID of the user who created it
    members: Member[];
    memberIds: string[]; // For easier querying
    transactions: Transaction[];
}
