'use client';

import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
} from '@/componentes/iu/tarjeta';
import { usarTema } from '@/tema/proveedor-tema';
import { cn } from '@/libreria/utilidades';
import { Check, Moon, Sun } from 'lucide-react';

export default function PaginaAparienciaDocente() {
  const { tema, temaEfectivo, establecerTema } = usarTema();

  const opciones = [
    { valor: 'claro' as const, etiqueta: 'Claro', icono: Sun },
    { valor: 'oscuro' as const, etiqueta: 'Oscuro', icono: Moon },
  ];

  const temaActual =
    tema === 'sistema' ? temaEfectivo : tema === 'oscuro' ? 'oscuro' : 'claro';

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Apariencia' }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Apariencia</h1>
        <p className="mt-1 text-muted-foreground">
          Elige cómo quieres ver la interfaz.
        </p>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Modo de tema</TituloTarjeta>
          <DescripcionTarjeta>
            Puedes cambiar entre modo claro y oscuro en cualquier momento.
          </DescripcionTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {opciones.map((opcion) => {
              const Icono = opcion.icono;
              const activo = temaActual === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  onClick={() => establecerTema(opcion.valor)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                    activo
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-foreground hover:bg-muted/40 dark:hover:bg-gray-800',
                  )}
                >
                  <Icono className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium">{opcion.etiqueta}</p>
                    <p className="text-xs text-muted-foreground">
                      {opcion.valor === 'claro'
                        ? 'Fondo claro y texto oscuro'
                        : 'Fondo oscuro y texto claro'}
                    </p>
                  </div>
                  {activo && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            La preferencia se guarda en este equipo.
          </p>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}
