import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Download, Eye, BarChart, Bot, Shield, Star, Twitter, Facebook, Instagram, Radio, HeartHandshake, Zap, Check } from 'lucide-react';
import { InstallPWA } from '../pwa/install-pwa';
import { GooglePlayLogo } from './logos/google-play-logo';
import { AppStoreLogo } from './logos/app-store-logo';


const features = [
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "Suivi intelligent des dépenses",
        description: "Catégorisation automatique pour une meilleure compréhension de vos habitudes financières.",
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Conseiller financier IA",
        description: "Recevez des conseils personnalisés pour optimiser votre budget et atteindre vos objectifs.",
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Budgétisation dynamique",
        description: "Créez des budgets flexibles qui s'adaptent à votre style de vie et à vos projets futurs.",
    },
    {
        icon: <Eye className="h-8 w-8 text-primary" />,
        title: "Analyse prévisionnelle",
        description: "Anticipez vos soldes futurs grâce à nos projections basées sur l'intelligence artificielle.",
    },
    {
        icon: <Zap className="h-8 w-8 text-primary" />,
        title: "Agent Vocal Automatisé",
        description: "Dictez vos transactions en une seule fois, l'IA s'occupe de tout remplir pour vous.",
    },
    {
        icon: <HeartHandshake className="h-8 w-8 text-primary" />,
        title: "Support Prioritaire",
        description: "Nos abonnés bénéficient d'un accès prioritaire à notre équipe de support dédiée.",
    }
];

const testimonials = [
    {
        name: "Awa C.",
        role: "Chef de projet",
        quote: "Wisebil a transformé ma façon de gérer mon argent. L'IA est incroyablement précise pour catégoriser mes dépenses, ce qui me fait gagner un temps précieux chaque mois.",
        rating: 5,
        avatar: "https://placehold.co/40x40.png",
        "data-ai-hint": "woman avatar"
    },
    {
        name: "Elhadj N.",
        role: "Développeur Freelance",
        quote: "En tant que freelance, mes revenus varient. Wisebil m'aide à avoir une vision claire de ma trésorerie et à planifier mes investissements. L'assistant IA est un vrai plus !",
        rating: 5,
        avatar: "https://placehold.co/40x40.png",
        "data-ai-hint": "man avatar"
    },
    {
        name: "Aminata S.",
        role: "Étudiante",
        quote: "Gérer mon budget étudiant était un casse-tête. Maintenant, je sais exactement où va mon argent et je peux même mettre de côté pour mes projets. Je recommande à 100% !",
        rating: 5,
        avatar: "https://placehold.co/40x40.png",
        "data-ai-hint": "woman avatar"
    }
];

const faqs = [
    {
        question: "Comment Wisebil est-il différent des autres applications de gestion financière ?",
        answer: "Wisebil se distingue par son assistant IA qui non seulement catégorise vos dépenses, mais vous fournit également des conseils proactifs et personnalisés pour améliorer votre santé financière. Notre technologie d'analyse prévisionnelle vous aide à anticiper et à planifier l'avenir."
    },
    {
        question: "Wisebil est-il vraiment gratuit ou y a-t-il des coûts cachés ?",
        answer: "Wisebil propose une version gratuite robuste avec toutes les fonctionnalités essentielles pour gérer vos finances. Nous avons également des plans Premium pour ceux qui souhaitent des fonctionnalités d'automatisation avancées comme notre agent vocal."
    },
    {
        question: "Wisebil fonctionne-t-il même sans connexion internet ?",
        answer: "Oui, les fonctionnalités de base de l'application sont disponibles hors ligne. Vous pouvez enregistrer des dépenses et consulter vos données à tout moment. Une connexion internet est requise pour la synchronisation et l'accès aux fonctionnalités de l'IA."
    },
    {
        question: "Est-ce que je peux lier mes comptes bancaires à Wisebil ?",
        answer: "Actuellement, nous nous concentrons sur la saisie manuelle pour vous donner un contrôle total et une meilleure conscience de vos dépenses. La liaison bancaire sécurisée est une fonctionnalité que nous prévoyons d'introduire dans une future mise à jour."
    },
    {
        question: "Comment Wisebil protège-t-il mes données financières ?",
        answer: "La sécurité de vos données est notre priorité absolue. Nous utilisons un cryptage de niveau bancaire (AES-256) pour toutes vos informations. Vos données sont anonymisées pour l'analyse par l'IA et ne sont jamais partagées avec des tiers."
    }
]


export default function DesktopLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50">
        <Logo />
        <nav className="ml-auto hidden lg:flex gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Fonctionnalités
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
            Tarifs
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#testimonials">
            Avis
          </Link>
           <Link className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
            FAQ
          </Link>
          <Button variant="outline" asChild>
             <Link href="/auth/login">Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">S'inscrire</Link>
          </Button>
        </nav>
        <div className="ml-auto lg:hidden">
             <Button asChild>
                <Link href="/auth/login">Se connecter</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/10 z-0"></div>
             <div className="container px-4 md:px-6 z-10 relative">
                 <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                                L'intelligence financière <span className="text-primary">à votre portée.</span>
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Plus qu'une simple application de gestion de dépenses, Wisebil est votre conseiller financier personnel, propulsé par l'intelligence artificielle.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button asChild size="lg">
                                <Link href="/auth/signup">Commencer gratuitement</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="#features">Découvrir les fonctionnalités</Link>
                            </Button>
                        </div>
                    </div>
                    <Image
                        src="https://placehold.co/600x600.png"
                        width="600"
                        height="600"
                        alt="Hero"
                        data-ai-hint="finance app mobile"
                        className="mx-auto aspect-square overflow-hidden rounded-xl object-contain sm:w-full lg:order-last"
                    />
                </div>
            </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Fonctionnalités Intelligentes
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Wisebil utilise l'IA pour transformer votre gestion financière.
                </h2>
                 <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Dites adieu aux saisies manuelles fastidieuses. Notre technologie vous fait gagner du temps et vous apporte une clarté inégalée sur vos finances.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="text-left bg-card/50 backdrop-blur-sm border-border/50 p-4">
                    <CardHeader className="p-2">
                        {feature.icon}
                        <CardTitle className="mt-4 text-lg font-headline">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                         <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                            Tarifs Simples
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Un plan pour chaque besoin</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Choisissez le plan qui vous convient et commencez à transformer vos finances dès aujourd'hui. Sans frais cachés.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-1 lg:grid-cols-3 mt-12">
                    {/* Free Plan */}
                    <Card className="flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-2xl">Gratuit</CardTitle>
                            <p className="text-4xl font-bold">0 F <span className="text-lg font-normal text-muted-foreground">/mois</span></p>
                            <p className="text-muted-foreground text-sm pt-2">Pour commencer à suivre vos finances personnelles.</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Transactions illimitées</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Budgets et objectifs</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Agent Vocal (1 usage/mois)</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Assistant IA (1 usage/mois)</li>
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                             <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/signup">Choisir ce plan</Link>
                            </Button>
                        </div>
                    </Card>
                    {/* Premium Plan */}
                    <Card className="flex flex-col border-primary shadow-2xl shadow-primary/10">
                         <CardHeader className="pb-4">
                            <p className="text-sm font-semibold text-primary">Le plus populaire</p>
                            <CardTitle className="font-headline text-2xl">Premium</CardTitle>
                            <p className="text-4xl font-bold">9 000 F <span className="text-lg font-normal text-muted-foreground">/mois</span></p>
                            <p className="text-muted-foreground text-sm pt-2">Pour automatiser et optimiser vos finances.</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                             <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tout du plan Gratuit</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Agent Vocal (15 usages/mois)</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Assistant IA (15 usages/mois)</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Support prioritaire</li>
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button asChild className="w-full">
                                <Link href="/auth/signup">Passer au Premium</Link>
                            </Button>
                        </div>
                    </Card>
                    {/* Enterprise Plan */}
                     <Card className="flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-2xl">Entreprise</CardTitle>
                            <p className="text-4xl font-bold">19 900 F <span className="text-lg font-normal text-muted-foreground">/mois</span></p>
                            <p className="text-muted-foreground text-sm pt-2">Pour un accès illimité et des fonctionnalités en avant-première.</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Tout du plan Premium</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Agent Vocal (illimité)</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Assistant IA (illimité)</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Accès anticipé aux nouveautés</li>
                            </ul>
                        </CardContent>
                         <div className="p-6 pt-0 mt-auto">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/signup">Choisir ce plan</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Ce que disent nos utilisateurs</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Découvrez pourquoi des milliers de personnes font confiance à Wisebil pour gérer leurs finances.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4 gap-3">
                                    <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full" data-ai-hint={testimonial['data-ai-hint']} />
                                    <div>
                                      <div className="font-semibold">{testimonial.name}</div>
                                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                                </div>
                                <p className="text-muted-foreground text-sm">"{testimonial.quote}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Questions Fréquentes</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Vous avez des questions ? Nous avons les réponses.
                        </p>
                    </div>
                </div>
                <div className="mx-auto max-w-3xl mt-12">
                     <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
            <div className="container px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Prêt à transformer votre vie financière ?</h2>
                <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed my-4">
                    Rejoignez des milliers d'utilisateurs qui ont décidé de prendre le contrôle de leur argent avec Wisebil.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                   <Button size="lg" variant="secondary" asChild>
                     <Link href="#">
                        <GooglePlayLogo className="h-8" />
                     </Link>
                   </Button>
                    <Button size="lg" variant="secondary" asChild>
                     <Link href="#">
                        <AppStoreLogo className="h-8" />
                     </Link>
                   </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-secondary/30">
        <div className="container px-4 md:px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <Logo />
              <p className="text-xs text-muted-foreground">La meilleure application de gestion financière pour prendre le contrôle de votre argent.</p>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="text-muted-foreground"><Twitter className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="text-muted-foreground"><Facebook className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" className="text-muted-foreground"><Instagram className="h-4 w-4" /></Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Produit</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#features" className="text-muted-foreground hover:text-primary">Fonctionnalités</Link>
                <Link href="#pricing" className="text-muted-foreground hover:text-primary">Tarifs</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Mises à jour</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-primary">Centre d'aide</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Contactez-nous</Link>
                <Link href="#faq" className="text-muted-foreground hover:text-primary">FAQ</Link>
              </nav>
            </div>
             <div>
              <h4 className="font-semibold mb-2">Légal</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Conditions d'utilisation</Link>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Politique de confidentialité</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Wisebil by Ocomstudio. Tous droits réservés.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" href="/terms-of-service">
                Termes
              </Link>
              <Link className="text-xs hover:underline underline-offset-4" href="/privacy-policy">
                Confidentialité
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
