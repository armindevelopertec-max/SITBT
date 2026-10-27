'use client';

import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { coloresPrimariosDisponibles, usarTema } from '@/tema/proveedor-tema';
import { cn } from '@/libreria/utilidades';
import { Check, Moon, Sun, Monitor } from 'lucide-react';

export default function PaginaApariencia() {
  const { tema, temaEfectivo, colorPrimario, establecerTema, establecerColorPrimario } = usarTema();

  const opcionesTema = [
    { valor: 'claro' as const, etiqueta: 'Claro', icono: Sun },
    { valor: 'oscuro' as const, etiqueta: 'Oscuro', icono: Moon },
    { valor: 'sistema' as const, etiqueta: 'Sistema', icono: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Apariencia</h2>
        <p className="text-gray-500 dark:text-gray-400">Personaliza el tema y el color principal del panel</p>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Modo de tema</TituloTarjeta>
          <DescripcionTarjeta>Elige entre claro, oscuro o seguir la configuración del sistema</DescripcionTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {opcionesTema.map((opcion) => {
              const ActivoIcono = opcion.icono;
              const activo = tema === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  onClick={() => establecerTema(opcion.valor)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border transition-colors text-left',
                    activo
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                  )}
                >
                  <ActivoIcono className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-medium">{opcion.etiqueta}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {opcion.valor === 'sistema' ? `Actual: ${temaEfectivo === 'oscuro' ? 'oscuro' : 'claro'}` : opcion.etiqueta}
                    </p>
                  </div>
                  {activo && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Color principal</TituloTarjeta>
          <DescripcionTarjeta>Personaliza el color que se usa en botones, enlaces y elementos destacados</DescripcionTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="flex flex-wrap gap-3">
            {coloresPrimariosDisponibles.map((color) => {
              const activo = colorPrimario === color.valor;
              return (
                <button
                  key={color.valor}
                  onClick={() => establecerColorPrimario(color.valor)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                    activo
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                  )}
                  title={color.etiqueta}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `hsl(${colorHsl(color.valor)})` }}
                  />
                  <span className="text-sm">{color.etiqueta}</span>
                  {activo && <Check className="w-4 h-4 ml-1" />}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Los cambios se aplican inmediatamente y se guardan en este equipo.
          </p>
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Vista previa</TituloTarjeta>
          <DescripcionTarjeta>Así se verá con la configuración actual</DescripcionTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="flex flex-wrap items-center gap-3">
          <Boton>Botón primario</Boton>
          <Boton variante="contorno">Botón con borde</Boton>
          <Boton variante="secundario">Botón secundario</Boton>
          <span className="text-primary font-medium">Texto con color primario</span>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}

function colorHsl(color: string) {
  const colores: Record<string, string> = {
    azul: '221.2 83.2% 53.3%',
    verde: '142.1 76.2% 36.3%',
    violeta: '262.1 83.3% 57.8%',
    rojo: '0 72.2% 50.6%',
    naranja: '24.6 95% 53.1%',
    cian: '189.5 94.5% 42.7%',
    rosa: '346.8 77.2% 49.8%',
    ambar: '45.4 93.4% 47.5%',
  };
  return colores[color] || colores.azul;
}
