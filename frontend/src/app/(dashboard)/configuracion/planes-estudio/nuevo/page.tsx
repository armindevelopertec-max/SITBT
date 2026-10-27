'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { api } from '@/libreria/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

export default function PaginaNuevoPlan() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datosFormulario, setDatosFormulario] = useState({
    carreraId: '',
    numeroRm: '',
    fechaRm: '',
    estado: 'vigente',
    notas: '',
  });

  useEffect(() => {
    obtenerCarreras();
  }, []);

  const obtenerCarreras = async () => {
    try {
      const respuesta = await api.get('/carreras/activos');
      setCarreras(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosFormulario.carreraId) nuevosErrores.carreraId = 'Carrera es requerida';
    if (!datosFormulario.numeroRm.trim()) nuevosErrores.numeroRm = 'Número RM es requerido';
    if (!datosFormulario.fechaRm) nuevosErrores.fechaRm = 'Fecha RM es requerida';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await api.post('/planes-estudio', {
        carreraId: parseInt(datosFormulario.carreraId),
        numeroRm: datosFormulario.numeroRm.trim().toUpperCase(),
        fechaRm: datosFormulario.fechaRm,
        estado: datosFormulario.estado,
        notas: datosFormulario.notas.trim() || null,
      });

      router.push('/configuracion/planes-estudio');
    } catch (error: any) {
      console.error('Error al crear el plan de estudio:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al crear el plan de estudio' });
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Configuración', href: '/configuracion' },
          { etiqueta: 'Planes de Estudio', href: '/planes-estudio' },
          { etiqueta: 'Nuevo Plan' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Plan de Estudio</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Plan de Estudio</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Selector
                  etiqueta="Carrera *"
                  value={datosFormulario.carreraId}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, carreraId: e.target.value })}
                  error={errores.carreraId}
                  opciones={carreras.map(c => ({ value: c.id.toString(), etiqueta: c.nombre }))}
                  placeholder={cargandoDatos ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={cargandoDatos}
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Número RM *"
                  value={datosFormulario.numeroRm}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, numeroRm: e.target.value.toUpperCase() })}
                  error={errores.numeroRm}
                  placeholder="RM 2024/001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Entrada
                  etiqueta="Fecha RM *"
                  type="date"
                  value={datosFormulario.fechaRm}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, fechaRm: e.target.value })}
                  error={errores.fechaRm}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Estado"
                  value={datosFormulario.estado}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, estado: e.target.value })}
                  opciones={[
                    { value: 'vigente', etiqueta: 'Vigente' },
                    { value: 'historico', etiqueta: 'Histórico' },
                  ]}
                />
              </div>
            </div>

            <div>
              <Entrada
                etiqueta="Notas"
                value={datosFormulario.notas}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
                placeholder="Notas adicionales..."
              />
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
                Guardar Plan
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
