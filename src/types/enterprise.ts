// src/types/enterprise.ts
export interface Enterprise {
    id: string;
    name: string;
    description: string;
    ownerId: string; // UID of the user who created it
    members?: { uid: string; role: 'owner' | 'manager' | 'member' }[];
}
