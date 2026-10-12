'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utilidades';

interface ElementoMigas {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: ElementoMigas[];
}

export function Migas({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Migas">
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href="/panel"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn('text-sm', item.href ? 'text-gray-500' : 'text-gray-900 font-medium')}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
