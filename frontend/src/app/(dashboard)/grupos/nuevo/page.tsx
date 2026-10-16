'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
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

interface Turno {
  id: number;
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
}

export default function PaginaNuevoGrupo() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datosFormulario, setDatosFormulario] = useState({
    carreraId: '',
    planEstudioId: '',
    semestre: '',
    turnoId: '',
    paralelo: '',
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    capacidad: '30',
  });

  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  useEffect(() => {
    if (datosFormulario.carreraId) {
      obtenerPlanesEstudio(Number(datosFormulario.carreraId));
    }
  }, [datosFormulario.carreraId]);

  const obtenerDatosIniciales = async () => {
    setCargandoDatos(true);
    try {
      const [respuestaCarreras, respuestaTurnos] = await Promise.all([
        api.get('/carreras/activos'),
        api.get('/turnos/todos'),
      ]);
      setCarreras(respuestaCarreras.data || []);
      setTurnos(respuestaTurnos.data.datos || respuestaTurnos.data || []);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const obtenerPlanesEstudio = async (carreraId: number) => {
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      const planes: PlanEstudio[] = respuesta.data || [];
      setPlanesEstudio(planes);
      // Autocompletar el plan vigente cuando existe uno solo.
      if (planes.length === 1) {
        setDatosFormulario((actual) => ({ ...actual, planEstudioId: planes[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error al obtener los planes de estudio:', error);
      setPlanesEstudio([]);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosFormulario.carreraId) nuevosErrores.carreraId = 'La carrera es requerida';
    if (!datosFormulario.semestre) nuevosErrores.semestre = 'El semestre es requerido';
    if (!datosFormulario.turnoId) nuevosErrores.turnoId = 'El turno es requerido';
    if (!datosFormulario.paralelo.trim()) nuevosErrores.paralelo = 'El paralelo es requerido';
    if (!datosFormulario.gestion.trim()) nuevosErrores.gestion = 'La gestión es requerida';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setCargando(true);
    try {
      await api.post('/grupos', {
        carreraId: Number(datosFormulario.carreraId),
        planEstudioId: datosFormulario.planEstudioId ? Number(datosFormulario.planEstudioId) : undefined,
        semestre: Number(datosFormulario.semestre),
        turnoId: Number(datosFormulario.turnoId),
        paralelo: datosFormulario.paralelo.toUpperCase(),
        gestion: datosFormulario.gestion,
        periodo: datosFormulario.periodo,
        capacidad: Number(datosFormulario.capacidad) || 30,
      });

      router.push('/grupos');
    } catch (error) {
      console.error('Error al crear el grupo:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        setErrores({ submit: mensajeDeError(error, 'Error al crear el grupo') }),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Grupos', href: '/grupos' }, { etiqueta: 'Nuevo grupo' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo grupo</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del grupo</TituloTarjeta>
            <DescripcionTarjeta>
              Completa los datos para registrar un nuevo grupo o paralelo.
            </DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Selector
                etiqueta="Carrera *"
                value={datosFormulario.carreraId}
                onChange={(e) =>
                  setDatosFormulario({ ...datosFormulario, carreraId: e.target.value, planEstudioId: '' })
                }
                error={errores.carreraId}
                opciones={[
                  { value: '', etiqueta: cargandoDatos ? 'Cargando...' : 'Seleccionar carrera...' },
                  ...carreras.map((carrera) => ({ value: carrera.id.toString(), etiqueta: carrera.nombre })),
                ]}
                disabled={cargandoDatos}
              />
              <Selector
                etiqueta="Plan de estudios"
                value={datosFormulario.planEstudioId}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, planEstudioId: e.target.value })}
                opciones={[
                  {
                    value: '',
                    etiqueta: !datosFormulario.carreraId
                      ? 'Primero seleccione una carrera'
                      : planesEstudio.length
                        ? 'Seleccionar plan...'
                        : 'No hay planes vigentes',
                  },
                  ...planesEstudio.map((plan) => ({ value: plan.id.toString(), etiqueta: `RM ${plan.numeroRm}` })),
                ]}
                disabled={!datosFormulario.carreraId || cargandoDatos}
              />
              <Selector
                etiqueta="Semestre *"
                value={datosFormulario.semestre}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, semestre: e.target.value })}
                error={errores.semestre}
                opciones={[
                  { value: '', etiqueta: 'Seleccionar semestre...' },
                  ...Array.from({ length: 10 }, (_, i) => ({
                    value: (i + 1).toString(),
                    etiqueta: `Semestre ${i + 1}`,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Selector
                etiqueta="Turno *"
                value={datosFormulario.turnoId}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, turnoId: e.target.value })}
                error={errores.turnoId}
                opciones={[
                  { value: '', etiqueta: cargandoDatos ? 'Cargando...' : 'Seleccionar turno...' },
                  ...turnos.map((turno) => ({
                    value: turno.id.toString(),
                    etiqueta: `${turno.nombre} (${turno.horaInicio}-${turno.horaFin})`,
                  })),
                ]}
                disabled={cargandoDatos}
              />
              <Entrada
                etiqueta="Paralelo *"
                value={datosFormulario.paralelo}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, paralelo: e.target.value.toUpperCase() })}
                error={errores.paralelo}
                placeholder="A"
                maxLength={5}
              />
              <Entrada
                etiqueta="Gestión *"
                value={datosFormulario.gestion}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, gestion: e.target.value })}
                error={errores.gestion}
                placeholder="2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Selector
                etiqueta="Periodo"
                value={datosFormulario.periodo}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, periodo: e.target.value })}
                opciones={[
                  { value: 'I', etiqueta: 'I (Primer semestre)' },
                  { value: 'II', etiqueta: 'II (Segundo semestre)' },
                ]}
              />
              <Entrada
                etiqueta="Capacidad"
                type="number"
                min={1}
                value={datosFormulario.capacidad}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, capacidad: e.target.value })}
                placeholder="30"
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
          <Boton variante="contorno" type="button" onClick={() => router.push('/grupos')}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={cargando}>
            <Save className="w-4 h-4 mr-2" />
            Guardar grupo
          </Boton>
        </div>
      </form>
    </div>
  );
}
