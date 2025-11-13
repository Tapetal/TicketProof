// src/components/EmptyState.tsx

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  iconClassName?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  iconClassName = 'text-[#6C63FF]'
}: EmptyStateProps) {
  return (
    <div className="text-center max-w-md mx-auto px-4 py-16">
      <div className="w-24 h-24 bg-[#1A1B2E] border-2 border-[#6C63FF]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Icon className={`w-12 h-12 ${iconClassName}`} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">
        {title}
      </h2>
      <p className="text-[#D1D5DB] mb-8">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#00C6AE] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-all transform hover:scale-105"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}