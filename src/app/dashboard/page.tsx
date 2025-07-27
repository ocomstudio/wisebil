import { BalanceCard } from "@/components/dashboard/balance-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Lightbulb, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <BalanceCard />

      <div className="grid grid-cols-2 gap-4">
        <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" asChild>
          <Link href="/dashboard/add-expense">
            Ajouter une dépense
          </Link>
        </Button>
        <Button variant="secondary" className="bg-green-500/20 text-green-400 hover:bg-green-500/30" asChild>
          <Link href="/dashboard/add-income">
           Ajouter un revenu
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-lg">Conseil du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Revoyez vos abonnements mensuels. Vous pourriez être surpris de ce que vous pouvez économiser !
          </p>
        </CardContent>
      </Card>
      
      <RecentExpenses />
    </div>
  );
}
