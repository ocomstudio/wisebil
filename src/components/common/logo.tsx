import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className, isLink = false }: { className?: string; isLink?: boolean }) {
  const content = (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/logo.png"
        alt="Wisebil Logo"
        width={130}
        height={32}
        className="object-contain"
        priority
      />
    </div>
  );

  if (isLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}
