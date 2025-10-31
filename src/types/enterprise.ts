// src/types/enterprise.ts
import type { Transaction } from './transaction';
import type { Product, ProductCategory } from './product';
import type { Sale } from './sale';
import type { Purchase } from './purchase';
import type { ActivityLog } from './activity-log';
import type { CompanyProfile } from './company';

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
    transactions: Transaction[]; // Transactions specific to the enterprise
    products?: Product[];
    productCategories?: ProductCategory[];
    sales?: Sale[];
    purchases?: Purchase[];
    enterpriseActivities?: ActivityLog[];
    companyProfile?: CompanyProfile;
    saleInvoiceCounter?: number;
    purchaseInvoiceCounter?: number;
}

export interface Invitation {
    id: string;
    enterpriseId: string;
    enterpriseName: string;
    email: string; // email of the person being invited
    role: string;
    status: 'pending' | 'accepted' | 'declined';
}
