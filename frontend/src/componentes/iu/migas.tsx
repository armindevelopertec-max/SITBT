'use client';

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/libreria/utilidades';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { rutaInicio } from '@/libreria/autenticacion';

interface ElementoMigas {
  etiqueta: string;
  href?: string;
}

interface PropsMigas {
  elementos: ElementoMigas[];
}

export function Migas({ elementos }: PropsMigas) {
  const pathname = usePathname();
  const { usuario } = usarAlmacenAutenticacion();

  // La casita debe llevar al inicio del portal en el que está el usuario.
  // Se usa la ruta actual para no depender de la hidratación del almacén.
  const hrefInicio = pathname.startsWith('/docente')
    ? '/docente'
    : pathname.startsWith('/estudiante')
      ? '/estudiante'
      : rutaInicio(usuario);

  return (
    <nav className="flex" aria-label="Migas">
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href={hrefInicio}
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
