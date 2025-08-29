import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LocaleProvider } from '@/context/locale-context';
import { AuthProvider } from '@/context/auth-context';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next"

const APP_NAME = "Wisebil";
const APP_DESCRIPTION = "Maîtrisez vos finances avec l'IA. Wisebil est votre conseiller financier personnel pour la gestion de budget, le suivi des dépenses, l'épargne intelligente et la planification financière au Sénégal, Cameroun, Côte d'Ivoire et dans toute l'Afrique francophone.";

const KEYWORDS = [
  // Français
  "gestion de budget", "suivi de dépenses", "conseiller financier ia", "épargne", "finances personnelles", 
  "wisebil", "gestion financière", "planification financière", "intelligence artificielle finance", "budget app", 
  "application de budget", "coach financier", "assistant financier", "automatisation financière", "fintech",
  "afrique", "sénégal", "cameroun", "côte d'ivoire", "afrique francophone", "dakar", "douala", "abidjan",
  "argent", "économiser de l'argent", "gérer son argent", "dépenses quotidiennes", "analyse financière",
  // Anglais
  "budgeting app", "expense tracker", "ai financial advisor", "personal finance", "savings app",
  "financial planning", "ai in finance", "finance africa", "money management", "fintech africa"
];


export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "Wisebil - Conseiller Financier IA & Gestion de Budget",
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: KEYWORDS,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
  openGraph: {
    type: 'website',
    url: 'https://wisebil-596a8.web.app/', // Remplacez par votre URL de production
    title: 'Wisebil - Votre Conseiller Financier IA',
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [{
      url: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxmaW5hbmNlfGVufDB8fHx8MTc1NDk1NTgxNXww&ixlib=rb-4.1.0&q=80&w=1080',
      width: 1200,
      height: 630,
      alt: 'Wisebil App aidea-mem-generated',
    }],
  }
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </AuthProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
