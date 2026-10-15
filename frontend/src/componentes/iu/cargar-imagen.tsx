'use client';

import { useState, useRef } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { cn } from '@/libreria/utilidades';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';

interface PropsCargarImagen {
  etiqueta?: string;
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  textoAyuda?: string;
  className?: string;
}

const URL_API = process.env.NEXT_PUBLIC_API_URL;
const BASE_API = process.env.NEXT_PUBLIC_API_BASE || '';
const obtenerUrlSubida = () => URL_API ? `${URL_API}/almacenamiento/subir` : `${BASE_API}/api/almacenamiento/subir`;

export function CargarImagen({
  etiqueta,
  value,
  onChange,
  error,
  textoAyuda,
  className,
}: PropsCargarImagen) {
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const refEntrada = useRef<HTMLInputElement>(null);
  const { tokenAcceso } = usarAlmacenAutenticacion();

  const alCambiarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    await subirArchivo(archivo);
  };

  const subirArchivo = async (archivo: File) => {
    if (!archivo.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setSubiendo(true);
    try {
      const datosFormulario = new FormData();
      datosFormulario.append('archivo', archivo);

      const valorToken = tokenAcceso || '';
      const respuesta = await fetch(`${obtenerUrlSubida()}?carpeta=logos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${valorToken}`,
        },
        body: datosFormulario,
      });

      if (!respuesta.ok) {
        const datosError = await respuesta.json();
        throw new Error(datosError.mensaje || 'Error al subir');
      }

      const datos = await respuesta.json();
      onChange(datos.url);
    } catch (errorSubida: any) {
      console.error('Error al subir el archivo:', errorSubida);
      alert(errorSubida.message || 'Error al subir la imagen');
    } finally {
      setSubiendo(false);
    }
  };

  const alSoltar = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const archivo = e.dataTransfer.files?.[0];
    if (archivo) {
      subirArchivo(archivo);
    }
  };

  const alArrastrarSobre = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const alSalirArrastre = () => {
    setArrastrando(false);
  };

  return (
    <div className={cn('w-full', className)}>
      {etiqueta && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {etiqueta}
        </label>
      )}

      <input
        ref={refEntrada}
        type="file"
        accept="image/*"
        onChange={alCambiarArchivo}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-4">
              <img
                src={value}
                alt="Logo"
                className="w-24 h-24 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Logo actual</p>
                <p className="text-xs text-gray-500 mt-1">{value.split('/').pop()}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => refEntrada.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={subiendo}
            >
              <Upload className="w-4 h-4" />
              {subiendo ? 'Subiendo...' : 'Cambiar'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => refEntrada.current?.click()}
          onDrop={alSoltar}
          onDragOver={alArrastrarSobre}
          onDragLeave={alSalirArrastre}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            arrastrando
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400',
            subiendo && 'opacity-50 pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center gap-3">
            {subiendo ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
                </div>
                <p className="text-sm text-gray-500">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG o WEBP (máx. 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {textoAyuda && !error && (
        <p className="mt-1 text-sm text-gray-500">{textoAyuda}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
