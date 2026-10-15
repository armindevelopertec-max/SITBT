'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Grupo {
  id: number;
  carreraId: number;
  planEstudioId: number;
  semestre: number;
  turnoId: number;
  paralelo: string;
  gestion: string;
  capacidad: number;
}

export default function PaginaEditarGrupo() {
  const router = useRouter();
  const parametros = useParams();
  const grupoId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [noEncontrado, setNoEncontrado] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    carreraId: '',
    planEstudioId: '',
    semestre: '',
    turnoId: '',
    paralelo: '',
    gestion: '',
    capacidad: '30',
  });

  useEffect(() => {
    obtenerDatosIniciales();
    obtenerGrupo();
  }, [grupoId]);

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
      setCarreras(respuestaCarreras.data.datos || []);
      setTurnos(respuestaTurnos.data.datos || []);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const obtenerGrupo = async () => {
    try {
      const respuesta = await api.get(`/grupos/${grupoId}`);
      const grupo: Grupo = respuesta.data;
      setDatosFormulario({
        carreraId: grupo.carreraId.toString(),
        planEstudioId: grupo.planEstudioId.toString(),
        semestre: grupo.semestre.toString(),
        turnoId: grupo.turnoId.toString(),
        paralelo: grupo.paralelo,
        gestion: grupo.gestion,
        capacidad: grupo.capacidad.toString(),
      });
    } catch (error) {
      console.error('Error al obtener el grupo:', error);
      setNoEncontrado(true);
    } finally {
      setCargando(false);
    }
  };

  const obtenerPlanesEstudio = async (carreraId: number) => {
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      setPlanesEstudio(respuesta.data || []);
      if (!respuesta.data || respuesta.data.length === 0) {
        const respuestaCompleta = await api.get(`/planes-estudio?carreraId=${carreraId}`);
        setPlanesEstudio(respuestaCompleta.data?.datos || []);
      }
    } catch (error) {
      console.error('Error al obtener los planes de estudio:', error);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosFormulario.carreraId) nuevosErrores.carreraId = 'Carrera es requerida';
    if (!datosFormulario.planEstudioId) nuevosErrores.planEstudioId = 'Plan de estudio es requerido';
    if (!datosFormulario.semestre) nuevosErrores.semestre = 'Semestre es requerido';
    if (!datosFormulario.turnoId) nuevosErrores.turnoId = 'Turno es requerido';
    if (!datosFormulario.paralelo.trim()) nuevosErrores.paralelo = 'Paralelo es requerido';
    if (!datosFormulario.gestion.trim()) nuevosErrores.gestion = 'Gestión es requerida';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await api.patch(`/grupos/${grupoId}`, {
        carreraId: parseInt(datosFormulario.carreraId),
        planEstudioId: parseInt(datosFormulario.planEstudioId),
        semestre: parseInt(datosFormulario.semestre),
        turnoId: parseInt(datosFormulario.turnoId),
        paralelo: datosFormulario.paralelo.toUpperCase(),
        gestion: datosFormulario.gestion,
        capacidad: parseInt(datosFormulario.capacidad) || 30,
      });

      router.push('/grupos');
    } catch (error: any) {
      console.error('Error al actualizar el grupo:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al actualizar el grupo' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const obtenerSemestres = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
      etiqueta: `Semestre ${i + 1}`,
    }));
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
            { etiqueta: 'Grupos', href: '/grupos' },
            { etiqueta: 'Editar Grupo' }
          ]} />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Grupo no encontrado
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
          { etiqueta: 'Grupos', href: '/grupos' },
          { etiqueta: 'Editar Grupo' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Grupo</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Grupo</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Selector
                  etiqueta="Carrera *"
                  value={datosFormulario.carreraId}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, carreraId: e.target.value, planEstudioId: '' })}
                  error={errores.carreraId}
                  opciones={carreras.map(c => ({ value: c.id.toString(), etiqueta: c.nombre }))}
                  placeholder={cargandoDatos ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={cargandoDatos}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Plan de Estudio *"
                  value={datosFormulario.planEstudioId}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, planEstudioId: e.target.value })}
                  error={errores.planEstudioId}
                  opciones={planesEstudio.map(p => ({ value: p.id.toString(), etiqueta: `RM ${p.numeroRm}` }))}
                  placeholder={!datosFormulario.carreraId ? 'Primero seleccione carrera' : planesEstudio.length ? 'Seleccionar plan...' : 'No hay planes'}
                  disabled={!datosFormulario.carreraId || cargandoDatos}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Semestre *"
                  value={datosFormulario.semestre}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, semestre: e.target.value })}
                  error={errores.semestre}
                  opciones={obtenerSemestres()}
                  placeholder="Seleccionar semestre..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Selector
                  etiqueta="Turno *"
                  value={datosFormulario.turnoId}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, turnoId: e.target.value })}
                  error={errores.turnoId}
                  opciones={turnos.map(t => ({ value: t.id.toString(), etiqueta: `${t.nombre} (${t.horaInicio}-${t.horaFin})` }))}
                  placeholder={cargandoDatos ? 'Cargando...' : 'Seleccionar turno...'}
                  disabled={cargandoDatos}
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Paralelo *"
                  value={datosFormulario.paralelo}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, paralelo: e.target.value.toUpperCase() })}
                  error={errores.paralelo}
                  placeholder="A"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Gestión *"
                  value={datosFormulario.gestion}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, gestion: e.target.value })}
                  error={errores.gestion}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="md:w-1/3">
              <Entrada
                etiqueta="Capacidad"
                type="number"
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
                Actualizar Grupo
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
