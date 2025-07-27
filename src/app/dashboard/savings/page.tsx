// src/app/dashboard/savings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const savingsGoals = [
  {
    name: "Nouvel Ordinateur",
    saved: 150000,
    total: 500000,
  },
  {
    name: "Fonds d'urgence",
    saved: 400000,
    total: 1000000,
  },
  {
    name: "Vacances",
    saved: 50000,
    total: 300000,
  }
];

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Objectifs d'Épargne</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvel Objectif
        </Button>
      </div>
      
       <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary"/>
            <span>Règle des 50/30/20</span>
          </CardTitle>
           <CardDescription>
            Une règle simple pour gérer votre budget : 50% pour les besoins, 30% pour les envies, et 20% pour l'épargne.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button size="sm">En savoir plus</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {savingsGoals.map((goal) => (
          <Card key={goal.name}>
            <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-secondary rounded-full">
                    <Target className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle>{goal.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                        {Math.round((goal.saved/goal.total) * 100)}%
                    </Badge>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={(goal.saved / goal.total) * 100} />
               <div className="flex justify-between text-sm text-muted-foreground">
                 <span>{goal.saved.toLocaleString('fr-FR')} FCFA</span>
                 <span>{goal.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
