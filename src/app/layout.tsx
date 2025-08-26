import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LocaleProvider } from '@/context/locale-context';
import { AuthProvider } from '@/context/auth-context';
import Script from 'next/script';

const APP_NAME = "Wisebil";
const APP_DESCRIPTION = "Maîtrisez vos finances avec l'IA. Wisebil est votre conseiller financier personnel pour la gestion de budget, le suivi des dépenses et l'épargne intelligente.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "Wisebil - Conseiller Financier IA & Gestion de Budget",
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["gestion de budget", "suivi de dépenses", "conseiller financier ia", "épargne", "finances personnelles", "wisebil", "gestion financière", "afrique", "senegal", "cameroun"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
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
        <Script src="https://cdn.cinetpay.com/seamless/main.js" strategy="beforeInteractive" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
