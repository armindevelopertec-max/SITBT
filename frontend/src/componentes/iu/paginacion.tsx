'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/libreria/utilidades';
import { Boton } from './boton';

interface PropsPaginacion {
  /** Página actual (1-based). */
  pagina: number;
  /** Número total de páginas. */
  totalPaginas: number;
  /** Cambia de página. */
  alCambiar: (pagina: number) => void;
  /** Texto informativo a la izquierda (por ejemplo "Mostrando 6 de 42"). */
  informacion?: string;
  /** Cantidad máxima de números de página a mostrar. */
  maxNumeros?: number;
  className?: string;
  /** Etiquetas de los botones. */
  textoAnterior?: string;
  textoSiguiente?: string;
}

/**
 * Paginación de la aplicación.
 *
 * Un único estilo para todas las pantallas: botones Anterior/Siguiente y los
 * números de página. Cuando hay muchas páginas se muestra una ventana con
 * elipsis alrededor de la página actual.
 */
export function Paginacion({
  pagina,
  totalPaginas,
  alCambiar,
  informacion,
  maxNumeros = 5,
  className,
  textoAnterior = 'Anterior',
  textoSiguiente = 'Siguiente',
}: PropsPaginacion) {
  if (totalPaginas <= 1) {
    return null;
  }

  const paginas = calcularPaginas(pagina, totalPaginas, maxNumeros);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {informacion && (
        <p className="text-sm text-muted-foreground">{informacion}</p>
      )}

      <div className="flex items-center gap-2">
        <Boton
          variante="contorno"
          tamano="pequeno"
          onClick={() => alCambiar(Math.max(1, pagina - 1))}
          disabled={pagina <= 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {textoAnterior}
        </Boton>

        <div className="flex items-center gap-1">
          {paginas.map((item, indice) =>
            item === '...' ? (
              <span
                key={`puntos-${indice}`}
                className="grid h-8 w-8 place-items-center text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => alCambiar(item)}
                aria-current={item === pagina ? 'page' : undefined}
                className={cn(
                  'grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-sm font-medium transition-colors',
                  item === pagina
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                )}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <Boton
          variante="contorno"
          tamano="pequeno"
          onClick={() => alCambiar(Math.min(totalPaginas, pagina + 1))}
          disabled={pagina >= totalPaginas}
        >
          {textoSiguiente}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Boton>
      </div>
    </div>
  );
}

/**
 * Calcula la ventana de páginas a mostrar alrededor de la página actual.
 * Devuelve números o '...' para los saltos.
 */
function calcularPaginas(
  pagina: number,
  totalPaginas: number,
  maxNumeros: number,
): Array<number | '...'> {
  if (totalPaginas <= maxNumeros) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const mitad = Math.floor(maxNumeros / 2);
  let inicio = Math.max(1, pagina - mitad);
  let fin = Math.min(totalPaginas, inicio + maxNumeros - 1);

  // Si estamos al final, ajustamos el inicio para no quedar con pocas páginas.
  if (fin - inicio + 1 < maxNumeros) {
    inicio = Math.max(1, fin - maxNumeros + 1);
  }

  const resultado: Array<number | '...'> = [];
  if (inicio > 1) {
    resultado.push(1);
    if (inicio > 2) resultado.push('...');
  }

  for (let numero = inicio; numero <= fin; numero++) {
    resultado.push(numero);
  }

  if (fin < totalPaginas) {
    if (fin < totalPaginas - 1) resultado.push('...');
    resultado.push(totalPaginas);
  }

  return resultado;
}
