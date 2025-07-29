import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className, isLink = false }: { className?: string; isLink?: boolean }) {
  const content = (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="bg-primary p-1.5 rounded-sm">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold font-headline">
          <span className="text-foreground">Wise</span>
          <span className="text-primary">bil</span>
        </span>
      </div>
  );

  if (isLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}
