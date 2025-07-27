import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common/logo';
import { InstallPWA } from '@/components/pwa/install-pwa';
import { Bot, Wallet, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI Categorization',
    description: "Let our smart AI automatically categorize your expenses, so you don't have to.",
    dataAiHint: 'robot technology'
  },
  {
    icon: <Wallet className="h-10 w-10 text-primary" />,
    title: 'Expense Tracking',
    description: 'Keep a clear, simple record of all your transactions in one place.',
    dataAiHint: 'finance money'
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary" />,
    title: 'Insightful Reports',
    description: 'Visualize your spending habits with easy-to-understand charts and graphs.',
    dataAiHint: 'charts graphs'
  },
];

const howItWorks = [
    {
        step: 1,
        title: "Add an Expense",
        description: "Quickly add your expenses by entering a description and amount."
    },
    {
        step: 2,
        title: "Categorize with AI",
        description: "With one click, our AI analyzes the description and assigns the correct category."
    },
    {
        step: 3,
        title: "Get Insights",
        description: "Review your spending habits through our dashboard and make smarter financial decisions."
    }
]

export default function DesktopLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Logo />
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How It Works
          </Link>
          <InstallPWA />
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
        <div className="ml-auto lg:hidden">
            <Button asChild>
                <Link href="/dashboard">Login</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Manage Your Expenses with the Power of AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Wisebil is the smartest way to track your spending. Our AI-powered app simplifies your financial life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/dashboard">Get Started For Free</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="finance app"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Why You'll Love Wisebil
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We've packed Wisebil with features to make managing your money simple and insightful.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center bg-secondary">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Simple Steps to Financial Clarity</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Getting started with Wisebil is as easy as 1, 2, 3.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid gap-12 md:grid-cols-3 md:gap-16 mt-12">
                    {howItWorks.map(item => (
                        <div key={item.step} className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">{item.step}</div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Wisebil. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
