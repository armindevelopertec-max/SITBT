'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { Search, Plus, Edit2, Trash2, Loader2, Eye, Wand2 } from 'lucide-react';

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
  periodo: string;
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

interface ResultadoGenerar {
  creados: number;
  existentes: number;
  mensaje: string;
}

const obtenerSemestres = () =>
  Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `${i + 1}.º semestre`,
  }));

export default function PaginaGrupos() {
  const router = useRouter();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [total, setTotal] = useState(0);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroGestion, setFiltroGestion] = useState('');
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
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    carreraId: '',
    planEstudioId: '',
    semestres: [] as number[],
    turnoIds: [] as number[],
    paralelos: ['A'] as string[],
    capacidad: '30',
  });

  // Carga inicial de catálogos
  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  // Recarga de la lista al cambiar filtros
  useEffect(() => {
    obtenerGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroGestion, filtroCarrera, filtroSemestre, filtroPeriodo, filtroTurno, filtroParalelo, filtroEstado, busquedaAplicada]);

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
      setGestiones(todasLasGestiones);
      setTurnos(respuestaTurnos.data.datos || respuestaTurnos.data || []);

      const gestionActual = todasLasGestiones.find((g: Gestion) => g.esActual);
      if (gestionActual) {
        setFiltroGestion(gestionActual.anio);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const obtenerGrupos = async () => {
    try {
      setCargando(true);
      const parametros: Record<string, string | number> = { pagina: 1, limite: 100 };
      if (filtroGestion) parametros.gestion = filtroGestion;
      if (filtroCarrera) parametros.carreraId = Number(filtroCarrera);
      if (filtroSemestre) parametros.semestre = Number(filtroSemestre);
      if (filtroPeriodo) parametros.periodo = filtroPeriodo;
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
      gestion: filtroGestion || new Date().getFullYear().toString(),
      periodo: 'I',
      carreraId: '',
      planEstudioId: '',
      semestres: [],
      turnoIds: [],
      paralelos: ['A'],
      capacidad: '30',
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

  const alternarEnArray = <T,>(lista: T[], valor: T): T[] =>
    lista.includes(valor) ? lista.filter((elemento) => elemento !== valor) : [...lista, valor];

  const generar = async () => {
    if (!formularioGenerar.planEstudioId) {
      setResultadoGenerar({ creados: 0, existentes: 0, mensaje: 'Selecciona un plan de estudios.' });
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await api.post('/grupos/generar', {
        gestion: formularioGenerar.gestion,
        periodo: formularioGenerar.periodo,
        planEstudioId: Number(formularioGenerar.planEstudioId),
        semestres: formularioGenerar.semestres,
        turnoIds: formularioGenerar.turnoIds,
        paralelos: formularioGenerar.paralelos,
        capacidad: formularioGenerar.capacidad,
      });
      setResultadoGenerar(respuesta.data);
      if (respuesta.data.creados > 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Grupos y Paralelos</h1>
        <div className="flex gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Selector
                etiqueta="Gestión"
                value={filtroGestion}
                onChange={(e) => setFiltroGestion(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las gestiones' },
                  ...gestiones.map((gestion) => ({ value: gestion.anio, etiqueta: gestion.anio })),
                ]}
              />
              <Selector
                etiqueta="Carrera"
                value={filtroCarrera}
                onChange={(e) => setFiltroCarrera(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las carreras' },
                  ...carreras.map((carrera) => ({ value: carrera.id.toString(), etiqueta: carrera.nombre })),
                ]}
              />
              <Selector
                etiqueta="Semestre"
                value={filtroSemestre}
                onChange={(e) => setFiltroSemestre(e.target.value)}
                opciones={[{ value: '', etiqueta: 'Todos los semestres' }, ...obtenerSemestres()]}
              />
              <Selector
                etiqueta="Periodo"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos los periodos' },
                  { value: 'I', etiqueta: 'Periodo I' },
                  { value: 'II', etiqueta: 'Periodo II' },
                ]}
              />
              <Selector
                etiqueta="Turno"
                value={filtroTurno}
                onChange={(e) => setFiltroTurno(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos los turnos' },
                  ...turnos.map((turno) => ({ value: turno.id.toString(), etiqueta: `${turno.codigo} - ${turno.nombre}` })),
                ]}
              />
              <Entrada
                etiqueta="Paralelo"
                value={filtroParalelo}
                onChange={(e) => setFiltroParalelo(e.target.value.toUpperCase())}
                placeholder="Ej.: A"
                maxLength={5}
              />
              <Selector
                etiqueta="Estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos' },
                  { value: 'activo', etiqueta: 'Activos' },
                  { value: 'cerrado', etiqueta: 'Cerrados' },
                ]}
              />
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Entrada
                    placeholder="Buscar por código o carrera..."
                    className="pl-10"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
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
                      <CeldaTabla colSpan={11} className="text-center py-8 text-gray-500">
                        No se encontraron grupos
                      </CeldaTabla>
                    </FilaTabla>
                  ) : (
                    grupos.map((grupo) => (
                      <FilaTabla key={grupo.id}>
                        <CeldaTabla className="font-medium">
                          <button
                            onClick={() => router.push(`/grupos/${grupo.id}`)}
                            className="text-primary-600 hover:underline text-left font-bold"
                          >
                            {grupo.codigo}
                          </button>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm font-medium">{grupo.carrera?.nombre || '-'}</div>
                          <div className="text-xs text-gray-500">{grupo.carrera?.codigo || ''}</div>
                        </CeldaTabla>
                        <CeldaTabla>{grupo.semestre}.º semestre</CeldaTabla>
                        <CeldaTabla>
                          <Insignia variante="primario">Periodo {grupo.periodo || 'I'}</Insignia>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm">{grupo.turno?.nombre || '-'}</div>
                          <div className="text-xs text-gray-500">
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
                              <Edit2 className="w-4 h-4" />
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
              <p className="mt-4 text-sm text-gray-500">
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
          <p className="text-sm text-gray-600">
            Genera automáticamente los grupos para los semestres, turnos y paralelos seleccionados de un plan de estudios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Entrada
              etiqueta="Gestión *"
              value={formularioGenerar.gestion}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, gestion: e.target.value })}
              placeholder="2024"
            />
            <Selector
              etiqueta="Periodo *"
              value={formularioGenerar.periodo}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, periodo: e.target.value })}
              opciones={[
                { value: 'I', etiqueta: 'I (Primer semestre)' },
                { value: 'II', etiqueta: 'II (Segundo semestre)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              etiqueta="Plan de estudios *"
              value={formularioGenerar.planEstudioId}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, planEstudioId: e.target.value })}
              disabled={!formularioGenerar.carreraId}
              opciones={[
                { value: '', etiqueta: formularioGenerar.carreraId ? 'Seleccionar plan...' : 'Primero seleccione una carrera' },
                ...planesGenerar.map((plan) => ({ value: plan.id.toString(), etiqueta: `RM ${plan.numeroRm}` })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semestres *</label>
            <div className="flex flex-wrap gap-2">
              {obtenerSemestres().map((semestre) => {
                const valor = Number(semestre.value);
                const activo = formularioGenerar.semestres.includes(valor);
                return (
                  <button
                    key={semestre.value}
                    type="button"
                    onClick={() =>
                      setFormularioGenerar({
                        ...formularioGenerar,
                        semestres: alternarEnArray(formularioGenerar.semestres, valor),
                      })
                    }
                    className={
                      'px-3 py-1.5 rounded-full border text-sm transition-colors ' +
                      (activo
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                    }
                  >
                    {semestre.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turnos *</label>
            <div className="flex flex-wrap gap-2">
              {turnos.map((turno) => {
                const activo = formularioGenerar.turnoIds.includes(turno.id);
                return (
                  <button
                    key={turno.id}
                    type="button"
                    onClick={() =>
                      setFormularioGenerar({
                        ...formularioGenerar,
                        turnoIds: alternarEnArray(formularioGenerar.turnoIds, turno.id),
                      })
                    }
                    className={
                      'px-3 py-1.5 rounded-full border text-sm transition-colors ' +
                      (activo
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                    }
                  >
                    {turno.codigo} ({turno.nombre})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paralelos *</label>
            <div className="flex flex-wrap gap-2">
              {['A', 'B', 'C'].map((paralelo) => {
                const activo = formularioGenerar.paralelos.includes(paralelo);
                return (
                  <button
                    key={paralelo}
                    type="button"
                    onClick={() =>
                      setFormularioGenerar({
                        ...formularioGenerar,
                        paralelos: alternarEnArray(formularioGenerar.paralelos, paralelo),
                      })
                    }
                    className={
                      'px-3 py-1.5 rounded-full border text-sm transition-colors ' +
                      (activo
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                    }
                  >
                    {paralelo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:w-1/3">
            <Entrada
              etiqueta="Capacidad por grupo"
              type="number"
              min={1}
              value={formularioGenerar.capacidad}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, capacidad: e.target.value })}
              placeholder="30"
            />
          </div>

          {resultadoGenerar && (
            <div
              className={
                'p-3 rounded-lg text-sm ' +
                (resultadoGenerar.creados > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')
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
              disabled={
                !formularioGenerar.planEstudioId ||
                formularioGenerar.semestres.length === 0 ||
                formularioGenerar.turnoIds.length === 0 ||
                formularioGenerar.paralelos.length === 0
              }
            >
              Generar grupos
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
