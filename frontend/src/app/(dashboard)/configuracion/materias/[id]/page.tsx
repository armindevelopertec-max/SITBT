'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { api } from '@/libreria/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  area: string | null;
}

export default function PaginaEditarMateria() {
  const router = useRouter();
  const parametros = useParams();
  const materiaId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [noEncontrado, setNoEncontrado] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    codigo: '',
    nombre: '',
  });

  useEffect(() => {
    obtenerMateria();
  }, [materiaId]);

  const obtenerMateria = async () => {
    try {
      const respuesta = await api.get(`/materias/${materiaId}`);
      const materia: Materia = respuesta.data;
      setDatosFormulario({
        codigo: materia.codigo,
        nombre: materia.nombre,
      });
    } catch (error) {
      console.error('Error al obtener la materia:', error);
      setNoEncontrado(true);
    } finally {
      setCargando(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosFormulario.codigo.trim()) {
      nuevosErrores.codigo = 'Código es requerido';
    } else if (datosFormulario.codigo.length < 3) {
      nuevosErrores.codigo = 'Código debe tener al menos 3 caracteres';
    }

    if (!datosFormulario.nombre.trim()) {
      nuevosErrores.nombre = 'Nombre es requerido';
    } else if (datosFormulario.nombre.length < 3) {
      nuevosErrores.nombre = 'Nombre debe tener al menos 3 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await api.patch(`/materias/${materiaId}`, {
        codigo: datosFormulario.codigo.trim().toUpperCase(),
        nombre: datosFormulario.nombre.trim(),
      });

      router.push('/configuracion/materias');
    } catch (error: any) {
      console.error('Error al actualizar la materia:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else if (error.response?.data?.error?.code === '23505') {
        setErrores({ submit: 'Ya existe una materia con este código' });
      } else {
        setErrores({ submit: 'Error al actualizar la materia' });
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (noEncontrado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Boton>
          <Migas elementos={[
            { etiqueta: 'Configuración', href: '/configuracion' },
            { etiqueta: 'Materias', href: '/materias' },
            { etiqueta: 'Editar Materia' }
          ]} />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Materia no encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Configuración', href: '/configuracion' },
          { etiqueta: 'Materias', href: '/materias' },
          { etiqueta: 'Editar Materia' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Materia</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos de la Materia</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Entrada
                  etiqueta="Código *"
                  value={datosFormulario.codigo}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, codigo: e.target.value.toUpperCase() })}
                  error={errores.codigo}
                  placeholder="MAT-101"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Nombre *"
                  value={datosFormulario.nombre}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, nombre: e.target.value })}
                  error={errores.nombre}
                  placeholder="Matemáticas I"
                />
              </div>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errores.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errores.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Boton variante="contorno" type="button" onClick={() => router.back()}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Actualizar Materia
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
