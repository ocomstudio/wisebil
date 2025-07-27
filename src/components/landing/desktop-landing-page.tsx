import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Download, Eye, BarChart, Bot, Shield, Star, Twitter, Facebook, Instagram } from 'lucide-react';
import { InstallPWA } from '../pwa/install-pwa';


const features = [
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "Suivi intelligent des dépenses",
        description: "Catégorisation automatique pour une meilleure compréhension de vos habitudes financières.",
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Conseiller financier",
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
        icon: <CheckCircle className="h-8 w-8 text-primary" />,
        title: "Alertes personnalisées",
        description: "Soyez notifié des dépenses importantes, des factures à venir et des opportunités d'économie.",
    },
    {
        icon: <Download className="h-8 w-8 text-primary" />,
        title: "Rapports & Exports",
        description: "Générez des rapports détaillés et exportez vos données pour vos déclarations ou analyses.",
    }
];

const testimonials = [
    {
        name: "Awa C.",
        role: "Chef de projet",
        quote: "Wisebil a transformé ma façon de gérer mon argent. L'IA est incroyablement précise pour catégoriser mes dépenses, ce qui me fait gagner un temps précieux chaque mois.",
        rating: 5,
    },
    {
        name: "Elhadj N.",
        role: "Développeur Freelance",
        quote: "En tant que freelance, mes revenus varient. Wisebil m'aide à avoir une vision claire de ma trésorerie et à planifier mes investissements. L'assistant IA est un vrai plus !",
        rating: 5,
    },
    {
        name: "Aminata S.",
        role: "Étudiante",
        quote: "Gérer mon budget étudiant était un casse-tête. Maintenant, je sais exactement où va mon argent et je peux même mettre de côté pour mes projets. Je recommande à 100% !",
        rating: 5,
    }
];

const faqs = [
    {
        question: "Comment Wisebil est-il différent des autres applications de gestion financière ?",
        answer: "Wisebil se distingue par son assistant IA qui non seulement catégorise vos dépenses, mais vous fournit également des conseils proactifs et personnalisés pour améliorer votre santé financière. Notre technologie d'analyse prévisionnelle vous aide à anticiper et à planifier l'avenir."
    },
    {
        question: "Wisebil est-il vraiment gratuit ou y a-t-il des coûts cachés ?",
        answer: "Wisebil propose une version gratuite robuste avec toutes les fonctionnalités essentielles pour gérer vos finances. Nous avons également un plan Premium pour ceux qui souhaitent des fonctionnalités avancées comme des rapports illimités et un coaching financier personnalisé."
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
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#testimonials">
            Avis
          </Link>
           <Link className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
            FAQ
          </Link>
          <Button variant="outline" asChild>
             <Link href="/dashboard">Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Télécharger l'app</Link>
          </Button>
        </nav>
        <div className="ml-auto lg:hidden">
             <Button asChild>
                <Link href="/dashboard">Se connecter</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/10 z-0"></div>
             <div className="container px-4 md:px-6 z-10 relative">
                 <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                                Maîtrisez vos finances avec Wisebil
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Plus qu'une simple application de gestion de dépenses, Wisebil est votre conseiller financier personnel, propulsé par l'intelligence artificielle.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button asChild size="lg">
                                <Link href="/dashboard">Télécharger l'application</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="#features">Découvrir</Link>
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
                 <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <div>
                        <p className="text-4xl font-bold font-headline text-primary">500,000+</p>
                        <p className="text-muted-foreground">Utilisateurs</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold font-headline text-primary">25%</p>
                        <p className="text-muted-foreground">Économies en moyenne</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold font-headline text-primary">20+</p>
                        <p className="text-muted-foreground">Pays</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold font-headline text-primary">4.9/5</p>
                        <p className="text-muted-foreground">Note moyenne</p>
                    </div>
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
                  Wisebil utilise l'intelligence artificielle pour transformer la façon dont vous gérez vos finances.
                </h2>
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
        
        <section id="discover" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                 <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Découvrez Wisebil
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Un conseiller financier dans votre poche</h2>
                <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0"/>
                        <span>Adoptez la bonne mentalité en matière de finances personnelles et reprenez le contrôle de votre argent.</span>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0"/>
                        <span>Fonctionne hors ligne. Vos données sont stockées localement sur votre téléphone, pas besoin d'être connecté.</span>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0"/>
                        <span>Support multiple de devises. Wisebil est disponible dans plus de 20 pays et prend en charge plusieurs devises.</span>
                    </li>
                </ul>
                <Button asChild>
                    <Link href="/dashboard">Voir toutes les fonctionnalités</Link>
                </Button>
              </div>
              <Image
                src="https://placehold.co/600x600.png"
                width="600"
                height="600"
                alt="Discover Wisebil"
                data-ai-hint="man jumping phone"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
              />
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
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                                </div>
                                <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                                <div className="font-semibold">{testimonial.name}</div>
                                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/80 text-primary-foreground">
            <div className="container px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Prêt à transformer votre vie financière ?</h2>
                <p className="mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed my-4">
                    Rejoignez plus de 500 000 utilisateurs qui ont décidé de prendre le contrôle de leur argent avec Wisebil.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                   <Button size="lg" variant="secondary" asChild>
                     <Link href="#">
                        <Image src="/google-play.svg" alt="Google Play" width={140} height={40} data-ai-hint="google play" />
                     </Link>
                   </Button>
                    <Button size="lg" variant="secondary" asChild>
                     <Link href="#">
                        <Image src="/app-store.svg" alt="App Store" width={125} height={40} data-ai-hint="app store" />
                     </Link>
                   </Button>
                </div>
                <p className="text-xs mt-4">Compatible avec tous les appareils iOS et Android. Téléchargement gratuit.</p>
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
                <Link href="#" className="text-muted-foreground hover:text-primary">Fonctionnalités</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Tarifs</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Mises à jour</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-primary">Centre d'aide</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Contactez-nous</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link>
              </nav>
            </div>
             <div>
              <h4 className="font-semibold mb-2">Entreprise</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-primary">À propos</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Carrières</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Presse</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Wisebil. Tous droits réservés.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Conditions d'utilisation
              </Link>
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Confidentialité
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
