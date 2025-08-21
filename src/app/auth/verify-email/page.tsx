// src/app/auth/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/locale-context";

export default function VerifyEmailPage() {
  const { firebaseUser, logout, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (firebaseUser) {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          clearInterval(interval);
          toast({
            title: t('email_verified_title'),
            description: t('welcome_message'),
          });
          router.push('/dashboard');
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [firebaseUser, router, toast, t]);

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await resendVerificationEmail();
      toast({
        title: t('verification_sent_title'),
        description: t('verification_sent_desc'),
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('error_title'),
        description: t('verification_sent_error'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">{t('verify_your_email')}</CardTitle>
          <CardDescription>
            {t('verify_email_instructions', { email: firebaseUser?.email || 'votre email' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('did_not_receive_email')}
          </p>
          <Button onClick={handleResendEmail} className="w-full" disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('resend_email_button')}
          </Button>
          <Button variant="link" onClick={handleLogout}>{t('logout')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
