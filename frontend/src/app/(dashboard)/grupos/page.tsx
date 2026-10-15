'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Insignia } from '@/components/ui/insignia';
import { Modal, ModalConfirmacion } from '@/components/ui/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2, Users, UserCheck, BookOpen, ArrowLeft } from 'lucide-react';

interface Grupo {
  id: number;
  codigo: string;
  carreraId: number;
  planEstudioId: number;
  materiaId: number;
  semestre: number;
  turnoId: number;
  paralelo: string;
  gestion: string;
  periodo: string;
  capacidad: number;
  carrera?: { id: number; codigo: string; nombre: string };
  turno?: { id: number; codigo: string; nombre: string; horaInicio: string; horaFin: string };
  plan_estudio?: { numeroRm: string };
  materia?: { id: number; codigo: string; nombre: string };
}

interface EstudianteEnGrupo {
  id: number;
  grupoId: number;
  estudianteId: number;
  inscritoEn: string;
  estudiante?: {
    id: number;
    codigoInscripcion: string;
    persona?: {
      ci: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
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

interface Personal {
  id: number;
  personaId: number;
  cargo: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface AsignacionDocente {
  id: number;
  docenteId: number;
  materiaId: number;
  grupoId: number;
  gestion: string;
  estado: string;
  docente?: Personal;
  materia?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export default function PaginaGrupos() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [filtroGestion, setFiltroGestion] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');

  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [estudiantesGrupo, setEstudiantesGrupo] = useState<EstudianteEnGrupo[]>([]);
  const [asignacionesGrupo, setAsignacionesGrupo] = useState<AsignacionDocente[]>([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [grupoEliminando, setGrupoEliminando] = useState<Grupo | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [modalGenerarAbierto, setModalGenerarAbierto] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [planesCarrera, setPlanesCarrera] = useState<any[]>([]);
  const [formularioGenerar, setFormularioGenerar] = useState({
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    turnoIds: [] as number[],
    paralelos: ['A'],
    carreraId: '' as string,
    planEstudioId: '' as string,
    capacidad: '30',
  });
  const [resultadoGenerar, setResultadoGenerar] = useState<{ creados: number; mensaje: string } | null>(null);

  const [formularioNuevo, setFormularioNuevo] = useState({
    carreraId: '',
    planEstudioId: '',
    materiaId: '',
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
    obtenerGrupos();
  }, [filtroGestion, filtroCarrera, filtroSemestre]);

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

      const gestionActual = todasLasGestiones.find((g: any) => g.esActual);
      if (gestionActual) {
        setFiltroGestion(gestionActual.anio);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerGrupos = async () => {
    try {
      setCargando(true);
      const parametros: any = { limite: 100 };
      if (filtroGestion) parametros.gestion = filtroGestion;
      if (filtroCarrera) parametros.careerId = filtroCarrera;
      if (filtroSemestre) parametros.semester = parseInt(filtroSemestre);

      const respuesta = await api.get(`/grupos`, { params: parametros });
      setGrupos(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerDetallesGrupo = async (grupo: Grupo) => {
    setGrupoSeleccionado(grupo);
    setCargandoDetalles(true);
    try {
      const [respuestaEstudiantes, respuestaAsignaciones] = await Promise.all([
        api.get(`/grupos/${grupo.id}/estudiantes`),
        api.get(`/asignaciones-docentes/grupo/${grupo.id}?gestion=${grupo.gestion}`),
      ]);
      setEstudiantesGrupo(respuestaEstudiantes.data || []);
      setAsignacionesGrupo(respuestaAsignaciones.data || []);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
    } finally {
      setCargandoDetalles(false);
    }
  };

  const crear = async () => {
    setGuardando(true);
    try {
      await api.post('/grupos', {
        carreraId: parseInt(formularioNuevo.carreraId),
        planEstudioId: parseInt(formularioNuevo.planEstudioId) || undefined,
        materiaId: parseInt(formularioNuevo.materiaId) || undefined,
        semestre: parseInt(formularioNuevo.semestre),
        turnoId: parseInt(formularioNuevo.turnoId) || undefined,
        paralelo: formularioNuevo.paralelo.toUpperCase(),
        gestion: formularioNuevo.gestion,
        periodo: formularioNuevo.periodo,
        capacidad: parseInt(formularioNuevo.capacidad) || 30,
      });
      setModalAbierto(false);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al crear grupo:', error);
    } finally {
      setGuardando(false);
    }
  };

  const generar = async () => {
    if (!formularioGenerar.planEstudioId) {
      setResultadoGenerar({ creados: 0, mensaje: 'Selecciona un plan de estudios' });
      return;
    }
    setGuardando(true);
    try {
      const resultado = await api.post('/grupos/generar', {
        gestion: formularioGenerar.gestion,
        periodo: formularioGenerar.periodo,
        turnoIds: formularioGenerar.turnoIds,
        paralelos: formularioGenerar.paralelos,
        planEstudioId: parseInt(formularioGenerar.planEstudioId),
        capacidad: formularioGenerar.capacidad,
      });
      setResultadoGenerar(resultado.data);
      if (resultado.data.creados > 0) {
        obtenerGrupos();
      }
    } catch (error) {
      console.error('Error al generar grupos:', error);
      setResultadoGenerar({ creados: 0, mensaje: 'Error al generar grupos' });
    } finally {
      setGuardando(false);
    }
  };

  const obtenerPlanesPorCarrera = async (carreraId: string) => {
    if (!carreraId) {
      setPlanesCarrera([]);
      return;
    }
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      setPlanesCarrera(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener planes:', error);
      setPlanesCarrera([]);
    }
  };

  const eliminar = async () => {
    if (!grupoEliminando) return;
    setGuardando(true);
    try {
      await api.delete(`/grupos/${grupoEliminando.id}`);
      setModalEliminarAbierto(false);
      setGrupoEliminando(null);
      setGrupoSeleccionado(null);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
    } finally {
      setGuardando(false);
    }
  };

  const gruposFiltrados = grupos.filter(grupo => {
    if (!consultaBusqueda) return true;
    const busqueda = consultaBusqueda.toLowerCase();
    return (
      grupo.paralelo.toLowerCase().includes(busqueda) ||
      grupo.turno?.nombre?.toLowerCase().includes(busqueda) ||
      grupo.carrera?.nombre?.toLowerCase().includes(busqueda)
    );
  });

  const obtenerSemestres = () => Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `${i + 1}° Semestre`,
  }));

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Grupos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
        <div className="flex gap-2">
          <Boton variante="contorno" onClick={() => setModalGenerarAbierto(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Generar Grupos
          </Boton>
          <Boton onClick={() => setModalAbierto(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Grupo
          </Boton>
        </div>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Grupos</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar grupo..."
                  className="pl-10"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>
              <Selector
                value={filtroGestion}
                onChange={(e) => setFiltroGestion(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las gestiones' },
                  ...gestiones.map(gestion => ({ value: gestion.anio, etiqueta: gestion.anio }))
                ]}
              />
              <Selector
                value={filtroCarrera}
                onChange={(e) => setFiltroCarrera(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las carreras' },
                  ...carreras.map(carrera => ({ value: carrera.id.toString(), etiqueta: carrera.nombre }))
                ]}
              />
              <Selector
                value={filtroSemestre}
                onChange={(e) => setFiltroSemestre(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos los semestres' },
                  ...obtenerSemestres()
                ]}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Código</CeldaEncabezado>
                  <CeldaEncabezado>Materia</CeldaEncabezado>
                  <CeldaEncabezado>Sem</CeldaEncabezado>
                  <CeldaEncabezado>Cap</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {gruposFiltrados.length === 0 ? (
                  <FilaTabla>
                    <CeldaTabla colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron grupos
                    </CeldaTabla>
                  </FilaTabla>
                ) : (
                  gruposFiltrados.map((grupo) => (
                    <FilaTabla
                      key={grupo.id}
                      className={grupoSeleccionado?.id === grupo.id ? 'bg-primary-50' : ''}
                    >
                      <CeldaTabla className="font-medium">
                        <button
                          onClick={() => obtenerDetallesGrupo(grupo)}
                          className="text-primary-600 hover:underline text-left"
                        >
                          <div className="font-bold">{grupo.codigo}</div>
                        </button>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="text-sm font-medium">{grupo.materia?.codigo || '-'}</div>
                        <div className="text-xs text-gray-500">{grupo.materia?.nombre || '-'}</div>
                      </CeldaTabla>
                      <CeldaTabla>{grupo.semestre}°</CeldaTabla>
                      <CeldaTabla>{grupo.capacidad}</CeldaTabla>
                      <CeldaTabla>
                        <div className="flex items-center gap-2">
                          <Boton variante="fantasma" tamano="icono" onClick={() => router.push(`/grupos/${grupo.id}`)}>
                            <Edit2 className="w-4 h-4" />
                          </Boton>
                          <Boton variante="fantasma" tamano="icono" onClick={() => {
                            setGrupoEliminando(grupo);
                            setModalEliminarAbierto(true);
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Boton>
                        </div>
                      </CeldaTabla>
                    </FilaTabla>
                  ))
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {grupoSeleccionado && (
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <div className="flex items-center justify-between">
              <TituloTarjeta className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalles del Grupo: {grupoSeleccionado.paralelo} - {grupoSeleccionado.turno?.nombre}
              </TituloTarjeta>
              <Boton variante="fantasma" tamano="icono" onClick={() => setGrupoSeleccionado(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Boton>
            </div>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            {cargandoDetalles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Estudiantes ({estudiantesGrupo.length}/{grupoSeleccionado.capacidad})
                  </h4>
                  {estudiantesGrupo.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay estudiantes en este grupo</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {estudiantesGrupo.map((estudianteGrupo) => (
                        <div key={estudianteGrupo.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {estudianteGrupo.estudiante?.persona?.nombres} {estudianteGrupo.estudiante?.persona?.apellidoPaterno}
                          </p>
                          <p className="text-xs text-gray-500">
                            {estudianteGrupo.estudiante?.persona?.ci} · {estudianteGrupo.estudiante?.codigoInscripcion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Docentes Asignados
                  </h4>
                  {asignacionesGrupo.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay docentes asignados</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {asignacionesGrupo.map((asignacion) => (
                        <div key={asignacion.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {asignacion.docente?.persona?.nombres} {asignacion.docente?.persona?.apellidoPaterno}
                          </p>
                          <p className="text-xs text-gray-500">
                            {asignacion.materia?.codigo} - {asignacion.materia?.nombre}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>
      )}

      <Modal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} titulo="Nuevo Grupo" tamano="grande">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Entrada
                value={formularioNuevo.gestion}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, gestion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={formularioNuevo.periodo}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, periodo: e.target.value })}
              >
                <option value="I">I (Primer Semestre)</option>
                <option value="II">II (Segundo Semestre)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paralelo *</label>
              <Entrada
                value={formularioNuevo.paralelo}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, paralelo: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={formularioNuevo.semestre}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, semestre: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {obtenerSemestres().map(semestre => (
                  <option key={semestre.value} value={semestre.value}>{semestre.etiqueta}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <Entrada
                type="number"
                value={formularioNuevo.capacidad}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, capacidad: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={formularioNuevo.carreraId}
              onChange={(e) => setFormularioNuevo({ ...formularioNuevo, carreraId: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(carrera => (
                <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={crear} disabled={guardando || !formularioNuevo.carreraId || !formularioNuevo.semestre || !formularioNuevo.paralelo}>
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Grupo'}
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        alCerrar={() => { setModalEliminarAbierto(false); setGrupoEliminando(null); }}
        alConfirmar={eliminar}
        titulo="Eliminar Grupo"
        mensaje={`¿Estás seguro de eliminar el grupo "${grupoEliminando?.paralelo}"?`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />

      <Modal
        abierto={modalGenerarAbierto}
        alCerrar={() => { setModalGenerarAbierto(false); setResultadoGenerar(null); setPlanesCarrera([]); }}
        titulo="Generar Grupos"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Genera grupos automáticamente para las materias de un plan de estudios.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Entrada
                value={formularioGenerar.gestion}
                onChange={(e) => setFormularioGenerar({ ...formularioGenerar, gestion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={formularioGenerar.periodo}
                onChange={(e) => setFormularioGenerar({ ...formularioGenerar, periodo: e.target.value })}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={formularioGenerar.carreraId}
              onChange={(e) => {
                setFormularioGenerar({ ...formularioGenerar, carreraId: e.target.value, planEstudioId: '' });
                obtenerPlanesPorCarrera(e.target.value);
              }}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(carrera => (
                <option key={carrera.id} value={carrera.id}>{carrera.codigo} - {carrera.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Estudios *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={formularioGenerar.planEstudioId}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, planEstudioId: e.target.value })}
              disabled={!formularioGenerar.carreraId}
            >
              <option value="">Seleccionar...</option>
              {planesCarrera.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.numeroRm}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turnos *</label>
            <div className="flex flex-wrap gap-2">
              {turnos.map(turno => (
                <label key={turno.id} className="flex items-center gap-1 px-3 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formularioGenerar.turnoIds.includes(turno.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormularioGenerar({ ...formularioGenerar, turnoIds: [...formularioGenerar.turnoIds, turno.id] });
                      } else {
                        setFormularioGenerar({ ...formularioGenerar, turnoIds: formularioGenerar.turnoIds.filter(id => id !== turno.id) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{turno.codigo}</span>
                  <span className="text-xs text-gray-500">({turno.nombre})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paralelos *</label>
            <div className="flex flex-wrap gap-2">
              {['A', 'B', 'C'].map(paralelo => (
                <label key={paralelo} className="flex items-center gap-1 px-3 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formularioGenerar.paralelos.includes(paralelo)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormularioGenerar({ ...formularioGenerar, paralelos: [...formularioGenerar.paralelos, paralelo] });
                      } else {
                        setFormularioGenerar({ ...formularioGenerar, paralelos: formularioGenerar.paralelos.filter(p => p !== paralelo) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{paralelo}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad por grupo</label>
            <Entrada
              type="number"
              value={formularioGenerar.capacidad}
              onChange={(e) => setFormularioGenerar({ ...formularioGenerar, capacidad: e.target.value })}
              placeholder="30"
            />
          </div>

          {resultadoGenerar && (
            <div className={`p-3 rounded-lg ${resultadoGenerar.creados > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {resultadoGenerar.mensaje}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => { setModalGenerarAbierto(false); setResultadoGenerar(null); setPlanesCarrera([]); }}>
              Cerrar
            </Boton>
            <Boton
              onClick={generar}
              disabled={guardando || !formularioGenerar.planEstudioId || formularioGenerar.turnoIds.length === 0 || formularioGenerar.paralelos.length === 0}
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Grupos'}
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
