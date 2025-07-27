import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Leaf className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline text-foreground">
        Wisebil
      </span>
    </Link>
  );
}
