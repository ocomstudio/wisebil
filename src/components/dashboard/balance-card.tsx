// src/components/dashboard/balance-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";

export function BalanceCard() {
  const balance = 40000;
  const income = 70000;
  const expenses = 30000;

  return (
    <Card className="bg-gradient-to-br from-primary/80 to-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-primary-foreground/80">
          Solde
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground/80 hover:bg-white/20 hover:text-white">
            <Eye className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary-foreground">
          {balance.toLocaleString('fr-FR')} FCFA
        </div>
        <div className="mt-4 flex justify-between text-primary-foreground/90">
            <div className="text-sm">
                <p className="text-xs opacity-70">Revenus</p>
                <p className="font-semibold">{income.toLocaleString('fr-FR')} FCFA</p>
            </div>
             <div className="text-sm text-right">
                <p className="text-xs opacity-70">Dépenses</p>
                <p className="font-semibold">{expenses.toLocaleString('fr-FR')} FCFA</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
