// src/types/company.ts
export interface CompanyProfile {
  name: string;
  address: string;
  logoUrl: string;
  signatureUrl: string;
  stampUrl: string;
  brandColor: string;
  dailyReportEnabled?: boolean;
  dailyReportTime?: string; // e.g., "18:00"
  dailyReportFormat?: 'excel' | 'pdf';
}
