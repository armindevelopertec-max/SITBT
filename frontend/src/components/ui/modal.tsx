'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utilidades';
import { X } from 'lucide-react';
import { Boton } from './boton';

interface PropsModal {
  abierto: boolean;
  alCerrar: () => void;
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
  tamano?: 'pequeno' | 'mediano' | 'grande' | 'extragrande' | 'completo';
  mostrarBotonCerrar?: boolean;
}

export function Modal({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  children,
  tamano = 'mediano',
  mostrarBotonCerrar = true,
}: PropsModal) {
  if (!abierto) return null;

  const tamanos = {
    pequeno: 'max-w-md',
    mediano: 'max-w-lg',
    grande: 'max-w-2xl',
    extragrande: 'max-w-4xl',
    completo: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={alCerrar}
        />

        <div
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl',
            tamanos[tamano],
            'animate-in fade-in zoom-in-95 duration-200'
          )}
        >
          {(titulo || mostrarBotonCerrar) && (
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div>
                {titulo && (
                  <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                )}
                {descripcion && (
                  <p className="mt-1 text-sm text-gray-500">{descripcion}</p>
                )}
              </div>
              {mostrarBotonCerrar && (
                <button
                  onClick={alCerrar}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface PropsModalConfirmacion {
  abierto: boolean;
  alCerrar: () => void;
  alConfirmar: () => void;
  titulo: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: 'predeterminado' | 'destructivo';
  cargando?: boolean;
  children?: React.ReactNode;
}

export function ModalConfirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'predeterminado',
  cargando = false,
  children,
}: PropsModalConfirmacion) {
  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={titulo} descripcion={mensaje} tamano="pequeno">
      {children}
      <div className="flex justify-end gap-3 mt-6">
        <Boton variante="contorno" onClick={alCerrar} disabled={cargando}>
          {textoCancelar}
        </Boton>
        <Boton
          variante={variante === 'destructivo' ? 'destructivo' : 'primario'}
          onClick={alConfirmar}
          cargando={cargando}
        >
          {textoConfirmar}
        </Boton>
      </div>
    </Modal>
  );
}