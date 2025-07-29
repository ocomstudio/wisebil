import { Logo } from "@/components/common/logo";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthProvider } from "@/context/auth-context";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="relative flex flex-col items-center justify-center p-8 lg:p-12">
          
          <div className="absolute top-8 left-8">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-8">
                  <Logo />
                  <Select defaultValue="fr">
                      <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              {children}
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center bg-secondary/30 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
          <div className="z-10 relative">
              <Image
                  src="https://placehold.co/600x400.png"
                  width={500}
                  height={350}
                  alt="Wisebil illustration"
                  data-ai-hint="finance illustration"
                  className="rounded-2xl shadow-2xl mb-8 transform-gpu transition-transform hover:scale-105"
              />
              <h2 className="text-3xl font-bold font-headline mb-4">
                  Prenez le contrôle de vos finances.
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                  Rejoignez des milliers d'utilisateurs et commencez à prendre des décisions financières plus intelligentes dès aujourd'hui.
              </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
