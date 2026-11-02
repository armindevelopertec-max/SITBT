'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/libreria/utilidades';

interface ElementoMigas {
  etiqueta: string;
  href?: string;
}

interface PropsMigas {
  elementos: ElementoMigas[];
}

export function Migas({ elementos }: PropsMigas) {
  return (
    <nav className="flex" aria-label="Migas">
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href="/panel"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {elementos.map((elemento, indice) => (
          <li key={indice} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            {elemento.href ? (
              <Link
                href={elemento.href}
                className="text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
              >
                {elemento.etiqueta}
              </Link>
            ) : (
              <span
                className={cn(
                  'text-sm',
                  elemento.href
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 font-medium dark:text-gray-100',
                )}
              >
                {elemento.etiqueta}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
