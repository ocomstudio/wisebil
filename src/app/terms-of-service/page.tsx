"use client";
// src/app/terms-of-service/page.tsx
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-10">
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
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : 28 juillet 2024</p>

          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">1. Acceptation des Conditions</h2>
              <p>
                En téléchargeant, installant ou utilisant l'application Wisebil ("Service"), vous acceptez d'être lié par ces Conditions Générales d'Utilisation ("Conditions"). Si vous n'êtes pas d'accord avec une partie des conditions, vous ne pouvez pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">2. Description du Service</h2>
              <p>
                Wisebil est une application de gestion financière personnelle qui utilise l'intelligence artificielle pour aider les utilisateurs à suivre, budgétiser et analyser leurs finances. Les fonctionnalités incluent le suivi des transactions, la budgétisation, la définition d'objectifs d'épargne et des conseils financiers générés par l'IA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">3. Comptes Utilisateurs</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Éligibilité :</strong> Vous devez avoir au moins 18 ans pour créer un compte et utiliser Wisebil.
                </li>
                <li>
                  <strong>Exactitude des informations :</strong> Vous vous engagez à fournir des informations exactes et complètes lors de votre inscription et à les maintenir à jour.
                </li>
                <li>
                  <strong>Sécurité du compte :</strong> Vous êtes responsable de la sécurité de votre mot de passe et de toutes les activités qui se déroulent sous votre compte. Avertissez-nous immédiatement de toute utilisation non autorisée.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">4. Abonnements et Paiements</h2>
               <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Plans :</strong> Wisebil propose un plan gratuit et des plans payants ("Premium", "Business"). Les fonctionnalités disponibles dépendent du plan choisi.
                </li>
                <li>
                  <strong>Facturation :</strong> Les abonnements sont facturés sur une base mensuelle ou annuelle. Les paiements sont traités via notre partenaire de paiement sécurisé, CinetPay.
                </li>
                <li>
                  <strong>Annulation :</strong> Vous pouvez annuler votre abonnement à tout moment. L'annulation prendra effet à la fin de la période de facturation en cours.
                </li>
              </ul>
            </section>
            
             <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">5. Utilisation Acceptable</h2>
              <p>
                Vous vous engagez à ne pas utiliser le Service pour toute activité illégale ou non autorisée. Vous ne devez pas, dans l'utilisation du Service, violer les lois de votre juridiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">6. Clause de Non-responsabilité</h2>
              <p>
                Wisebil est un outil d'information financière et ne fournit pas de conseils financiers professionnels. Les conseils générés par notre IA sont basés sur les données que vous fournissez et doivent être considérés comme des suggestions, et non comme des directives d'investissement ou des conseils juridiques. Nous ne sommes pas responsables des décisions financières que vous prenez sur la base des informations fournies par notre Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">7. Résiliation</h2>
              <p>
                Nous pouvons résilier ou suspendre votre accès à notre Service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris si vous violez les Conditions.
              </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">8. Modifications des Conditions</h2>
                <p>
                    Nous nous réservons le droit de modifier ces Conditions à tout moment. Si une révision est importante, nous fournirons un préavis d'au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.
                </p>
            </section>

             <section>
                <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Nous contacter</h2>
                <p>
                    Si vous avez des questions sur ces Conditions, veuillez nous contacter à <a href="mailto:contact@wisebil.com" className="text-primary hover:underline">contact@wisebil.com</a>.
                </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
