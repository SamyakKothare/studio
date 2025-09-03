import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ShieldCheck className="size-7 text-primary" />
      <span className="text-lg font-semibold text-foreground">
        FACT CHECKER-AI
      </span>
    </div>
  );
}
