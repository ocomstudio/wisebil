// src/app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, CheckCircle, Heart, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Logo isLink={true} />
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
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
            Bien plus qu'une application.
            <br />
            <span className="text-primary">Une révolution financière.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Wisebil n'est pas seulement un outil. C'est un mouvement vers une liberté financière accessible à tous, propulsé par une technologie qui vous comprend.
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
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Notre Manifeste</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Dans un monde financier complexe, nous avons vu la confusion, le stress et le manque de contrôle. Nous avons vu des outils compliqués qui ajoutent plus de travail qu'ils n'en enlèvent. Wisebil est né d'une conviction simple : la technologie la plus avancée doit rendre la vie radicalement plus simple. Notre mission est de vous redonner le pouvoir sur votre argent, sans effort.
            </p>
          </div>
        </motion.section>

        {/* The How Section */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">IA au service de l'Humain</h3>
                <p className="mt-2 text-muted-foreground">Notre IA n'est pas un gadget. C'est un partenaire intelligent formé pour vous simplifier la vie, automatiser les tâches fastidieuses et vous offrir des conseils pertinents. Elle apprend de vous, pour vous.</p>
            </motion.div>
             <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.2 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">Sécurité Inébranlable</h3>
                <p className="mt-2 text-muted-foreground">Votre confiance est notre capital le plus précieux. Nous la protégeons avec un cryptage de niveau militaire et une politique de confidentialité absolue. Vos données sont à vous, et seulement à vous.</p>
            </motion.div>
             <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.4 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-headline">Simplicité Radicale</h3>
                <p className="mt-2 text-muted-foreground">Chaque écran, chaque bouton, chaque interaction est pensée pour être intuitive. Si vous devez lire un manuel, nous avons échoué. La puissance financière ne devrait jamais être compliquée.</p>
            </motion.div>
        </section>
        
        {/* Meet the AI */}
        <section className="mt-24">
           <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Rencontrez vos nouveaux alliés</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Wisebil, ce n'est pas une seule IA, mais une équipe d'agents spécialisés à votre service.
                </p>
           </div>
           <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><Zap /> Wise, Le Conseiller</h3>
                    <p className="mt-4 text-muted-foreground">Votre coach personnel. Posez-lui n'importe quelle question sur vos finances, demandez des conseils sur vos budgets, ou laissez-le analyser vos dépenses pour vous donner un résumé clair et des pistes d'amélioration.</p>
                </motion.div>
                 <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5, delay: 0.2 }} variants={cardVariants} className="bg-card p-8 rounded-2xl shadow-2xl border border-border">
                    <h3 className="text-2xl font-bold font-headline text-primary flex items-center gap-2"><CheckCircle /> Agent W, L'Assistant</h3>
                    <p className="mt-4 text-muted-foreground">Votre spécialiste de la saisie de données. Dictez-lui une liste de dépenses et de revenus en une seule phrase, ou prenez une photo d'un ticket. Agent W extrait, catégorise et enregistre tout pour vous, en quelques secondes.</p>
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
          <h2 className="text-3xl font-bold font-headline mb-4">Votre transformation commence maintenant.</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Assez parlé. Il est temps d'agir. Rejoignez-nous et découvrez ce que signifie vraiment être en contrôle de votre avenir financier.
          </p>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20 transform-gpu transition-transform hover:scale-105">
            <Link href="/auth/signup">Commencer ma transformation</Link>
          </Button>
        </motion.section>
      </main>
    </div>
  );
}