import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdBanner() {
  return (
    <Card className="bg-secondary/50 border-dashed">
      <CardContent className="p-4 text-center">
        <Image 
          src="https://placehold.co/300x200.png" 
          width={300} 
          height={200} 
          alt="Advertisement"
          data-ai-hint="advertisement banner" 
          className="rounded-md mb-4 w-full" 
        />
        <h4 className="font-bold font-headline text-sm mb-1">Upgrade Your Plan</h4>
        <p className="text-xs text-muted-foreground mb-3">Get unlimited reports and premium support.</p>
        <Button size="sm" className="w-full">Learn More</Button>
      </CardContent>
    </Card>
  )
}
