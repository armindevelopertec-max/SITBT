'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import {
  BarraFiltros,
  BuscadorFiltro,
  CampoFiltro,
} from '@/componentes/iu/barra-filtros';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { Search, Plus, Lock, Unlock, Trash2, Loader2, Eye, Wand2, CopyPlus } from 'lucide-react';

interface Periodo {
  id: number;
  gestionId: number;
  numero: string;
  nombre?: string | null;
  estado?: string;
  gestion?: { id: number; anio: string } | null;
}

interface Grupo {
  id: number;
  codigo: string;
  carreraId: number;
  planEstudioId: number;
  materiaId: number | null;
  semestre: number;
  turnoId: number;
  paralelo: string;
  gestion: string;
  periodoId: number | null;
  periodo?: Periodo | null;
  capacidad: number;
  estado: 'activo' | 'cerrado';
  carrera?: { id: number; codigo: string; nombre: string };
  plan_estudio?: { id: number; numeroRm: string };
  turno?: { id: number; codigo: string; nombre: string; horaInicio: string; horaFin: string };
  materia?: { id: number; codigo: string; nombre: string } | null;
  inscritos?: number;
  cuposDisponibles?: number;
}

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

interface Gestion {
  id: number;
  anio: string;
  esActual: boolean;
  periodos?: Periodo[];
}

/** Periodo aplanado con su gestión, listo para los selectores. */
interface OpcionPeriodo {
  id: number;
  numero: string;
  gestion: string;
  etiqueta: string;
}

/** Arma la lista de periodos (con su gestión) a partir de las gestiones. */
const construirOpcionesPeriodo = (gestiones: Gestion[]): OpcionPeriodo[] =>
  gestiones.flatMap((gestion) =>
    (gestion.periodos || []).map((periodo) => ({
      id: periodo.id,
      numero: periodo.numero,
      gestion: gestion.anio,
      etiqueta: `${gestion.anio} · Periodo ${periodo.numero}`,
    })),
  );

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

interface ResultadoGenerar {
  creados: number;
  existentes: number;
  mensaje: string;
}

const obtenerSemestres = () =>
  Array.from({ length: 6 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `${i + 1}.º semestre`,
  }));

export default function PaginaGrupos() {
  const router = useRouter();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [total, setTotal] = useState(0);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [periodos, setPeriodos] = useState<OpcionPeriodo[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [filtroParalelo, setFiltroParalelo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');

  // Modales / acciones
  const [guardando, setGuardando] = useState(false);
  const [modalGenerarAbierto, setModalGenerarAbierto] = useState(false);
  const [grupoEliminando, setGrupoEliminando] = useState<Grupo | null>(null);
  const [grupoCambiandoEstado, setGrupoCambiandoEstado] = useState<Grupo | null>(null);

  const [resultadoGenerar, setResultadoGenerar] = useState<ResultadoGenerar | null>(null);
  const [planesGenerar, setPlanesGenerar] = useState<PlanEstudio[]>([]);
  const [formularioGenerar, setFormularioGenerar] = useState({
    periodoId: '',
    carreraId: '',
    planEstudioId: '',
  });

  // Modal clonar periodo
  const [modalClonarAbierto, setModalClonarAbierto] = useState(false);
  const [periodoOrigenId, setPeriodoOrigenId] = useState('');
  const [periodoDestinoId, setPeriodoDestinoId] = useState('');
  const [carreraClonarId, setCarreraClonarId] = useState('');
  const [resultadoClonar, setResultadoClonar] = useState<ResultadoGenerar | null>(null);

  // Carga inicial de catálogos
  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  // Recarga de la lista al cambiar filtros
  useEffect(() => {
    obtenerGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroCarrera, filtroSemestre, filtroPeriodo, filtroTurno, filtroParalelo, filtroEstado, busquedaAplicada]);

  // Debounce del buscador
  useEffect(() => {
    const temporizador = setTimeout(() => setBusquedaAplicada(busqueda), 400);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const obtenerDatosIniciales = async () => {
    try {
      const [respuestaCarreras, respuestaGestiones, respuestaTurnos] = await Promise.all([
        api.get('/carreras/activos'),
        api.get('/gestiones'),
        api.get('/turnos/todos'),
      ]);
      setCarreras(respuestaCarreras.data || []);
      const todasLasGestiones = respuestaGestiones.data.datos || respuestaGestiones.data || [];
      setPeriodos(construirOpcionesPeriodo(todasLasGestiones));
      setTurnos(respuestaTurnos.data.datos || respuestaTurnos.data || []);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const obtenerGrupos = async () => {
    try {
      setCargando(true);
      const parametros: Record<string, string | number> = { pagina: 1, limite: 100 };
      if (filtroCarrera) parametros.carreraId = Number(filtroCarrera);
      if (filtroSemestre) parametros.semestre = Number(filtroSemestre);
      if (filtroPeriodo) parametros.periodoId = Number(filtroPeriodo);
      if (filtroTurno) parametros.turnoId = Number(filtroTurno);
      if (filtroParalelo) parametros.paralelo = filtroParalelo.toUpperCase();
      if (filtroEstado) parametros.estado = filtroEstado;
      if (busquedaAplicada.trim()) parametros.busqueda = busquedaAplicada.trim();

      const respuesta = await api.get('/grupos', { params: parametros });
      setGrupos(respuesta.data.datos || []);
      setTotal(respuesta.data.total || 0);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al obtener grupos')),
      );
    } finally {
      setCargando(false);
    }
  };

  const abrirGenerar = () => {
    setResultadoGenerar(null);
    setPlanesGenerar([]);
    setFormularioGenerar({
      periodoId: filtroPeriodo || '',
      carreraId: '',
      planEstudioId: '',
    });
    setModalGenerarAbierto(true);
  };

  const obtenerPlanesGenerar = async (carreraId: string) => {
    setFormularioGenerar((actual) => ({ ...actual, carreraId, planEstudioId: '' }));
    if (!carreraId) {
      setPlanesGenerar([]);
      return;
    }
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      const planes: PlanEstudio[] = respuesta.data || [];
      setPlanesGenerar(planes);
      if (planes.length === 1) {
        setFormularioGenerar((actual) => ({ ...actual, planEstudioId: planes[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error al obtener planes de estudio:', error);
      setPlanesGenerar([]);
    }
  };

  const generar = async () => {
    if (!formularioGenerar.periodoId) {
      setResultadoGenerar({ creados: 0, existentes: 0, mensaje: 'Selecciona un periodo.' });
      return;
    }
    if (!formularioGenerar.planEstudioId) {
      setResultadoGenerar({ creados: 0, existentes: 0, mensaje: 'Selecciona un plan de estudios (RM).' });
      return;
    }
    // Por defecto se generan los 6 semestres en el turno Mañana, paralelo A,
    // cubriendo todas las materias del plan de estudios.
    const turnoManana = turnos.find((turno) => turno.codigo?.toUpperCase() === 'MAÑANA')?.id ?? 1;
    setGuardando(true);
    try {
      const respuesta = await api.post('/grupos/generar', {
        periodoId: Number(formularioGenerar.periodoId),
        planEstudioId: Number(formularioGenerar.planEstudioId),
        semestres: [1, 2, 3, 4, 5, 6],
        turnoIds: [turnoManana],
        paralelos: ['A'],
        capacidad: '30',
      });
      setResultadoGenerar(respuesta.data);
      if (respuesta.data.creados > 0) {
        setFiltroPeriodo(formularioGenerar.periodoId);
        obtenerGrupos();
      }
    } catch (error) {
      console.error('Error al generar grupos:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        setResultadoGenerar({ creados: 0, existentes: 0, mensaje: mensajeDeError(error, 'Error al generar grupos') }),
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirClonar = () => {
    setResultadoClonar(null);
    setPeriodoOrigenId(filtroPeriodo || '');
    setPeriodoDestinoId('');
    setCarreraClonarId('');
    setModalClonarAbierto(true);
  };

  const clonar = async () => {
    if (!periodoOrigenId || !periodoDestinoId) {
      setResultadoClonar({ creados: 0, existentes: 0, mensaje: 'Selecciona el periodo de origen y el de destino.' });
      return;
    }
    if (periodoOrigenId === periodoDestinoId) {
      setResultadoClonar({ creados: 0, existentes: 0, mensaje: 'El periodo de origen y el de destino deben ser distintos.' });
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await api.post('/grupos/clonar', {
        periodoOrigenId: Number(periodoOrigenId),
        periodoDestinoId: Number(periodoDestinoId),
        ...(carreraClonarId ? { carreraId: Number(carreraClonarId) } : {}),
      });
      setResultadoClonar({
        creados: respuesta.data.creados,
        existentes: respuesta.data.existentes,
        mensaje: respuesta.data.mensaje,
      });
      if (respuesta.data.creados > 0) {
        setFiltroPeriodo(periodoDestinoId);
        obtenerGrupos();
      }
    } catch (error) {
      console.error('Error al clonar grupos:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        setResultadoClonar({ creados: 0, existentes: 0, mensaje: mensajeDeError(error, 'Error al clonar grupos') }),
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!grupoEliminando) return;
    setGuardando(true);
    try {
      await api.delete(`/grupos/${grupoEliminando.id}`);
      setGrupoEliminando(null);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar grupo'));
      });
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCambiarEstado = async () => {
    if (!grupoCambiandoEstado) return;
    setGuardando(true);
    try {
      const nuevoEstado = grupoCambiandoEstado.estado === 'activo' ? 'cerrado' : 'activo';
      await api.patch(`/grupos/${grupoCambiandoEstado.id}/estado`, { estado: nuevoEstado });
      setGrupoCambiandoEstado(null);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al cambiar estado del grupo:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al cambiar el estado del grupo'));
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Grupos' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Grupos y Paralelos</h1>
        <div className="flex flex-wrap gap-2">
          <Boton variante="contorno" onClick={abrirClonar}>
            <CopyPlus className="w-4 h-4 mr-2" />
            Clonar periodo
          </Boton>
          <Boton variante="contorno" onClick={abrirGenerar}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generar grupos
          </Boton>
          <Boton onClick={() => router.push('/grupos/nuevo')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo grupo
          </Boton>
        </div>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col gap-4">
            <div>
              <TituloTarjeta>Filtros</TituloTarjeta>
              <DescripcionTarjeta>Busca y filtra los grupos y paralelos registrados.</DescripcionTarjeta>
            </div>
            <BarraFiltros columnas={6}>
              <CampoFiltro
                etiqueta="Carrera"
                value={filtroCarrera}
                onChange={setFiltroCarrera}
                placeholder="Todas las carreras"
                opciones={carreras.map((carrera) => ({
                  value: carrera.id.toString(),
                  etiqueta: carrera.nombre,
                }))}
              />
              <CampoFiltro
                etiqueta="Semestre"
                value={filtroSemestre}
                onChange={setFiltroSemestre}
                placeholder="Todos los semestres"
                opciones={obtenerSemestres()}
              />
              <CampoFiltro
                etiqueta="Periodo"
                value={filtroPeriodo}
                onChange={setFiltroPeriodo}
                placeholder="Todos los periodos"
                opciones={periodos.map((periodo) => ({
                  value: periodo.id.toString(),
                  etiqueta: periodo.etiqueta,
                }))}
              />
              <CampoFiltro
                etiqueta="Turno"
                value={filtroTurno}
                onChange={setFiltroTurno}
                placeholder="Todos los turnos"
                opciones={turnos.map((turno) => ({
                  value: turno.id.toString(),
                  etiqueta: `${turno.codigo} - ${turno.nombre}`,
                }))}
              />
              <CampoFiltro
                etiqueta="Paralelo"
                value={filtroParalelo}
                onChange={(valor) => setFiltroParalelo(valor.toUpperCase())}
                placeholder="Todos"
                opciones={['A', 'B', 'C', 'D', 'E', 'F'].map((p) => ({
                  value: p,
                  etiqueta: p,
                }))}
              />
              <CampoFiltro
                etiqueta="Estado"
                value={filtroEstado}
                onChange={setFiltroEstado}
                placeholder="Todos"
                opciones={[
                  { value: 'activo', etiqueta: 'Activos' },
                  { value: 'cerrado', etiqueta: 'Cerrados' },
                ]}
              />
              <BuscadorFiltro
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por código o carrera..."
                className="lg:col-span-2"
              />
            </BarraFiltros>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : (
            <>
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Código</CeldaEncabezado>
                    <CeldaEncabezado>Carrera</CeldaEncabezado>
                    <CeldaEncabezado>Nivel / Semestre</CeldaEncabezado>
                    <CeldaEncabezado>Periodo</CeldaEncabezado>
                    <CeldaEncabezado>Turno</CeldaEncabezado>
                    <CeldaEncabezado>Paralelo</CeldaEncabezado>
                    <CeldaEncabezado>Capacidad</CeldaEncabezado>
                    <CeldaEncabezado>Inscritos</CeldaEncabezado>
                    <CeldaEncabezado>Cupos</CeldaEncabezado>
                    <CeldaEncabezado>Estado</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {grupos.length === 0 ? (
                    <FilaTabla>
                      <CeldaTabla colSpan={11} className="text-center py-8 text-muted-foreground">
                        No se encontraron grupos
                      </CeldaTabla>
                    </FilaTabla>
                  ) : (
                    grupos.map((grupo) => (
                      <FilaTabla key={grupo.id}>
                        <CeldaTabla className="font-medium">
                          <button
                            onClick={() => router.push(`/grupos/${grupo.id}`)}
                            className="text-primary-600 dark:text-primary-400 hover:underline text-left font-bold"
                          >
                            {grupo.codigo}
                          </button>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm font-medium">{grupo.carrera?.nombre || '-'}</div>
                          <div className="text-xs text-muted-foreground">{grupo.carrera?.codigo || ''}</div>
                        </CeldaTabla>
                        <CeldaTabla>{grupo.semestre}.º semestre</CeldaTabla>
                        <CeldaTabla>
                          <Insignia variante="primario">
                            {grupo.periodo ? `${grupo.periodo.gestion?.anio || ''} · ${grupo.periodo.numero}` : '-'}
                          </Insignia>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm">{grupo.turno?.nombre || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            {grupo.turno ? `${grupo.turno.horaInicio} - ${grupo.turno.horaFin}` : ''}
                          </div>
                        </CeldaTabla>
                        <CeldaTabla>{grupo.paralelo}</CeldaTabla>
                        <CeldaTabla>{grupo.capacidad}</CeldaTabla>
                        <CeldaTabla>{grupo.inscritos ?? 0}</CeldaTabla>
                        <CeldaTabla>{grupo.cuposDisponibles ?? grupo.capacidad}</CeldaTabla>
                        <CeldaTabla>
                          <Insignia variante={grupo.estado === 'activo' ? 'exito' : 'secundario'}>
                            {grupo.estado === 'activo' ? 'Activo' : 'Cerrado'}
                          </Insignia>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="flex items-center justify-end gap-1">
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Ver detalle"
                              onClick={() => router.push(`/grupos/${grupo.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Boton>
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title={grupo.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar grupo'}
                              onClick={() => setGrupoCambiandoEstado(grupo)}
                            >
                              {grupo.estado === 'activo' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Boton>
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Eliminar"
                              onClick={() => setGrupoEliminando(grupo)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Boton>
                          </div>
                        </CeldaTabla>
                      </FilaTabla>
                    ))
                  )}
                </CuerpoTabla>
              </Tabla>
              <p className="mt-4 text-sm text-muted-foreground">
                Mostrando {grupos.length} de {total} grupo(s).
              </p>
            </>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Generar grupos */}
      <Modal
        abierto={modalGenerarAbierto}
        alCerrar={() => {
          setModalGenerarAbierto(false);
          setResultadoGenerar(null);
        }}
        titulo="Generar grupos"
        tamano="grande"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Genera automáticamente los <strong>6 grupos</strong> (uno por semestre) del plan de estudios, en el turno
            <strong> Mañana</strong> y paralelo <strong>A</strong>, cubriendo todas las materias de la carrera.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Selector
              etiqueta="Carrera *"
              value={formularioGenerar.carreraId}
              onChange={(e) => obtenerPlanesGenerar(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Seleccionar carrera...' },
                ...carreras.map((carrera) => ({
                  value: carrera.id.toString(),
                  etiqueta: `${carrera.codigo} - ${carrera.nombre}`,
                })),
              ]}
            />
            <Selector
              etiqueta="Plan de estudios (RM) *"
              value={formularioGenerar.planEstudioId}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, planEstudioId: e.target.value })}
              disabled={!formularioGenerar.carreraId}
              opciones={[
                { value: '', etiqueta: formularioGenerar.carreraId ? 'Seleccionar plan...' : 'Primero seleccione una carrera' },
                ...planesGenerar.map((plan) => ({ value: plan.id.toString(), etiqueta: `RM ${plan.numeroRm}` })),
              ]}
            />
            <Selector
              etiqueta="Periodo *"
              value={formularioGenerar.periodoId}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, periodoId: e.target.value })}
              opciones={[
                { value: '', etiqueta: 'Seleccionar periodo...' },
                ...periodos.map((periodo) => ({ value: periodo.id.toString(), etiqueta: periodo.etiqueta })),
              ]}
            />
          </div>

          {resultadoGenerar && (
            <div
              className={
                'p-3 rounded-lg text-sm ' +
                (resultadoGenerar.creados > 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300')
              }
            >
              <p>{resultadoGenerar.mensaje}</p>
              <p className="mt-1 font-medium">
                Creados: {resultadoGenerar.creados} · Existentes: {resultadoGenerar.existentes}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton
              variante="contorno"
              onClick={() => {
                setModalGenerarAbierto(false);
                setResultadoGenerar(null);
              }}
            >
              Cerrar
            </Boton>
            <Boton
              onClick={generar}
              cargando={guardando}
              disabled={!formularioGenerar.periodoId || !formularioGenerar.planEstudioId}
            >
              Generar grupos
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal Clonar grupos de un periodo a otro */}
      <Modal
        abierto={modalClonarAbierto}
        alCerrar={() => {
          setModalClonarAbierto(false);
          setResultadoClonar(null);
        }}
        titulo="Clonar grupos de un periodo"
        tamano="grande"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copia la <strong>estructura</strong> de los grupos (carrera, semestre, turno, paralelo y capacidad)
            desde un periodo a otro, regenerando el código. <strong>No se copian los estudiantes.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Selector
              etiqueta="Periodo de origen *"
              value={periodoOrigenId}
              onChange={(e) => setPeriodoOrigenId(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Seleccionar periodo...' },
                ...periodos.map((periodo) => ({ value: periodo.id.toString(), etiqueta: periodo.etiqueta })),
              ]}
            />
            <Selector
              etiqueta="Periodo de destino *"
              value={periodoDestinoId}
              onChange={(e) => setPeriodoDestinoId(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Seleccionar periodo...' },
                ...periodos.map((periodo) => ({ value: periodo.id.toString(), etiqueta: periodo.etiqueta })),
              ]}
            />
          </div>

          <Selector
            etiqueta="Carrera (opcional)"
            value={carreraClonarId}
            onChange={(e) => setCarreraClonarId(e.target.value)}
            opciones={[
              { value: '', etiqueta: 'Todas las carreras' },
              ...carreras.map((carrera) => ({
                value: carrera.id.toString(),
                etiqueta: `${carrera.codigo} - ${carrera.nombre}`,
              })),
            ]}
          />

          {resultadoClonar && (
            <div
              className={
                'p-3 rounded-lg text-sm ' +
                (resultadoClonar.creados > 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300')
              }
            >
              <p>{resultadoClonar.mensaje}</p>
              <p className="mt-1 font-medium">
                Creados: {resultadoClonar.creados} · Existentes: {resultadoClonar.existentes}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton
              variante="contorno"
              onClick={() => {
                setModalClonarAbierto(false);
                setResultadoClonar(null);
              }}
            >
              Cerrar
            </Boton>
            <Boton
              onClick={clonar}
              cargando={guardando}
              disabled={!periodoOrigenId || !periodoDestinoId || periodoOrigenId === periodoDestinoId}
            >
              Clonar grupos
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Confirmación de eliminación */}
      <ModalConfirmacion
        abierto={!!grupoEliminando}
        alCerrar={() => setGrupoEliminando(null)}
        alConfirmar={confirmarEliminar}
        titulo="Eliminar grupo"
        mensaje={`¿Estás seguro de eliminar el grupo "${grupoEliminando?.codigo}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />

      {/* Confirmación de cambio de estado */}
      <ModalConfirmacion
        abierto={!!grupoCambiandoEstado}
        alCerrar={() => setGrupoCambiandoEstado(null)}
        alConfirmar={confirmarCambiarEstado}
        titulo={grupoCambiandoEstado?.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar grupo'}
        mensaje={
          grupoCambiandoEstado?.estado === 'activo'
            ? `El grupo "${grupoCambiandoEstado?.codigo}" pasará a estado cerrado.`
            : `El grupo "${grupoCambiandoEstado?.codigo}" volverá a estar activo.`
        }
        textoConfirmar={grupoCambiandoEstado?.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar'}
        cargando={guardando}
      />
    </div>
  );
}
