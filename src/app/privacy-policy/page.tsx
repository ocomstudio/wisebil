"use client";
// src/app/privacy-policy/page.tsx
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Politique de Confidentialité de Wisebil</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : 28 juillet 2024</p>

          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Introduction</h2>
              <p>
                Bienvenue sur Wisebil ("nous", "notre"). Nous nous engageons à protéger la confidentialité et la sécurité de vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application mobile et nos services.
              </p>
              <p className="mt-4">
                En utilisant Wisebil, vous consentez aux pratiques de données décrites dans cette politique. Si vous n'êtes pas d'accord, veuillez ne pas utiliser nos services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">1. Les informations que nous collectons</h2>
              <p>Nous collectons plusieurs types d'informations pour fournir et améliorer nos services :</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Informations de compte :</strong> Lorsque vous créez un compte, nous collectons votre nom, votre adresse e-mail et votre numéro de téléphone.
                </li>
                <li>
                  <strong>Données financières :</strong> Vous nous fournissez des informations sur vos transactions, revenus, dépenses, budgets et objectifs d'épargne. Ces données sont le cœur de l'expérience Wisebil.
                </li>
                <li>
                  <strong>Données générées par l'IA :</strong> Les interactions avec nos fonctionnalités d'IA (Assistant, Agent W) sont traitées pour vous fournir des réponses, mais ne sont pas utilisées pour entraîner les modèles globaux de l'IA.
                </li>
                <li>
                  <strong>Données techniques :</strong> Nous collectons des informations sur l'appareil que vous utilisez, votre système d'exploitation et des identifiants uniques pour assurer la compatibilité et la sécurité.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">2. Comment nous utilisons vos informations</h2>
              <p>Vos données sont utilisées exclusivement pour :</p>
               <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Fournir et personnaliser nos services :</strong> Afficher vos tableaux de bord, catégoriser vos dépenses et vous donner une vue d'ensemble de vos finances.
                </li>
                <li>
                  <strong>Alimenter nos fonctionnalités d'IA :</strong> Notre IA utilise vos données financières pour vous fournir des résumés, des conseils personnalisés et automatiser la saisie.
                </li>
                <li>
                  <strong>Communiquer avec vous :</strong> Vous envoyer des notifications importantes, des alertes de sécurité et des réponses de notre support client.
                </li>
                 <li>
                  <strong>Améliorer l'application :</strong> Analyser les données d'utilisation (de manière anonyme et agrégée) pour identifier les bugs et améliorer l'expérience utilisateur.
                </li>
              </ul>
            </section>

             <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">3. Sécurité de vos données</h2>
              <p>
                La sécurité de vos données est notre priorité absolue. Nous mettons en œuvre des mesures de sécurité de niveau bancaire :
              </p>
               <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Chiffrement :</strong> Toutes les données, qu'elles soient stockées ou en transit, sont chiffrées à l'aide de protocoles de sécurité robustes (AES-256).
                </li>
                <li>
                  <strong>Infrastructure sécurisée :</strong> Nous nous appuyons sur l'infrastructure cloud sécurisée de Google (Firebase) pour stocker vos données.
                </li>
                <li>
                  <strong>Anonymisation :</strong> Les données utilisées pour l'analyse globale sont toujours anonymisées pour protéger votre identité.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">4. Partage des informations</h2>
              <p>
                Nous ne vendons, ne louons et ne partageons jamais vos données financières personnelles avec des tiers à des fins de marketing. Le partage est limité aux cas suivants :
              </p>
               <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Fournisseurs de services :</strong> Nous travaillons avec des fournisseurs de confiance (comme Google pour l'IA) qui sont contractuellement obligés de protéger vos données.
                </li>
                <li>
                  <strong>Obligations légales :</strong> Nous pouvons divulguer vos informations si la loi l'exige ou pour nous conformer à une procédure légale valide.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">5. Vos droits et contrôles</h2>
                <p>Vous gardez le contrôle total de vos données :</p>
               <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                  <strong>Accès et modification :</strong> Vous pouvez consulter et modifier vos informations directement dans l'application.
                </li>
                <li>
                  <strong>Exportation :</strong> Vous pouvez exporter toutes vos données à tout moment depuis les paramètres de l'application.
                </li>
                <li>
                  <strong>Suppression :</strong> Vous pouvez supprimer votre compte et toutes les données associées depuis les paramètres. Cette action est irréversible.
                </li>
              </ul>
            </section>
            
            <section>
                <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">6. Modifications de cette politique</h2>
                <p>
                    Nous pouvons mettre à jour cette politique de temps à autre. Nous vous informerons de tout changement important par e-mail ou via une notification dans l'application.
                </p>
            </section>

             <section>
                <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Nous contacter</h2>
                <p>
                    Si vous avez des questions sur cette Politique de Confidentialité, veuillez nous contacter à <a href="mailto:contact@wisebil.com" className="text-primary hover:underline">contact@wisebil.com</a>.
                </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
