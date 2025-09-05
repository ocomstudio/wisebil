// src/app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, CheckCircle, Heart, ShieldCheck, Zap, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/locale-context";

const cardVariants = {
  offscreen: {
    y: 100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 1,
    },
  },
};

export default function AboutPage() {
    const { t } = useLocale();
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Logo isLink={true} />
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_home')}
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative"
        >
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent/10 rounded-full mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            {t('about_hero_title1')}
            <br />
            <span className="text-primary">{t('about_hero_title2')}</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            {t('about_hero_subtitle')}
          </p>
        </motion.section>

        {/* The Why Section */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
          variants={cardVariants}
          className="mt-24"
        >
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('about_manifesto_title')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('about_manifesto_desc')}
            </p>
          </div>
        </motion.section>

        {/* The How Section */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">{t('about_how_title1')}</h3>
                <p className="mt-2 text-muted-foreground">{t('about_how_desc1')}</p>
            </motion.div>
             <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.2 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">{t('about_how_title2')}</h3>
                <p className="mt-2 text-muted-foreground">{t('about_how_desc2')}</p>
            </motion.div>
             <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.4 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">{t('about_how_title3')}</h3>
                <p className="mt-2 text-muted-foreground">{t('about_how_desc3')}</p>
            </motion.div>
        </section>
        
        {/* Meet the AI */}
        <section className="mt-24">
           <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('about_allies_title')}</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('about_allies_subtitle')}
                </p>
           </div>
           <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><Zap /> {t('about_wise_title')}</h3>
                    <p className="mt-4 text-muted-foreground">{t('about_wise_desc')}</p>
                </motion.div>
                 <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.2 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><CheckCircle /> {t('about_agentw_title')}</h3>
                    <p className="mt-4 text-muted-foreground">{t('about_agentw_desc')}</p>
                </motion.div>
           </div>
        </section>

         {/* The Professional Vision */}
        <section className="mt-24">
           <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Notre Vision pour les Professionnels</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Wisebil n'est pas seulement pour les finances personnelles. Nous offrons une suite d'outils puissants pour les freelances et les petites entreprises.
                </p>
           </div>
           <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><Briefcase /> Comptabilité Conforme</h3>
                    <p className="mt-4 text-muted-foreground">Gérez votre plan comptable (SYSCOHADA), enregistrez vos écritures de journal, et générez votre grand livre et votre compte de résultat en toute simplicité.</p>
                </motion.div>
                 <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.2 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><FileText /> Facturation Intuitive</h3>
                    <p className="mt-4 text-muted-foreground">Créez des factures professionnelles, personnalisez-les avec votre logo et votre signature, et suivez leur statut (brouillon, payée, en retard) sans effort.</p>
                </motion.div>
           </div>
        </section>

        {/* CTA */}
        <motion.section 
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            variants={cardVariants}
            className="mt-24 text-center bg-primary/10 p-12 rounded-2xl"
        >
          <h2 className="text-3xl font-bold font-headline mb-4">{t('about_cta_title')}</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            {t('about_cta_subtitle')}
          </p>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20 transform-gpu transition-transform hover:scale-105">
            <Link href="/dashboard">{t('about_cta_button')}</Link>
          </Button>
        </motion.section>
      </main>
    </div>
  );
}
