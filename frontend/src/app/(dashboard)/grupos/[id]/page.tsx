'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
  PieTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { formatearFecha, formatearFechaHora } from '@/libreria/utilidades';
import {
  ArrowLeft,
  Loader2,
  Users,
  BookOpen,
  CalendarClock,
  History,
  Pencil,
  UserPlus,
  Search,
  UserMinus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

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

interface Periodo {
  id: number;
  gestionId: number;
  numero: string;
  nombre?: string | null;
  gestion?: { id: number; anio: string } | null;
}

interface Gestion {
  id: number;
  anio: string;
  periodos?: Periodo[];
}

/** Periodo aplanado con su gestión, listo para el selector. */
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
  carrera?: Carrera;
  plan_estudio?: { id: number; numeroRm: string };
  turno?: Turno;
  materia?: { id: number; codigo: string; nombre: string } | null;
  inscritos: number;
  cuposDisponibles: number;
}

interface EstudianteEnGrupo {
  id: number;
  grupoId: number;
  estudianteId: number;
  inscritoEn: string;
  estudiante: {
    id: number;
    codigoInscripcion: string;
    estado: string;
    estadoMatricula: string;
    persona?: {
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      ci: string;
    };
  };
}

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  carreraId: number;
  estado: string;
  estadoMatricula?: string;
  persona?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
  };
}

interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  semestre: number;
  horasSemanales?: number;
}

interface EntradaHistorial {
  id: number;
  accion: string;
  detalle: string | null;
  creadoEn: string;
  estudiante?: { persona?: { nombres: string; apellidoPaterno: string; apellidoMaterno: string } } | null;
}

type Pestana = 'estudiantes' | 'materias' | 'horario' | 'historial';

const obtenerSemestres = () =>
  Array.from({ length: 6 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `Semestre ${i + 1}`,
  }));

const nombreCompleto = (persona?: { nombres: string; apellidoPaterno: string; apellidoMaterno: string } | null) =>
  persona
    ? `${persona.apellidoPaterno} ${persona.apellidoMaterno}, ${persona.nombres}`.trim()
    : 'Estudiante';

const varianteAccion = (accion: string) => {
  switch (accion) {
    case 'asignado':
      return 'exito' as const;
    case 'retirado':
      return 'error' as const;
    case 'trasladado':
      return 'advertencia' as const;
    default:
      return 'predeterminado' as const;
  }
};

export default function PaginaDetalleGrupo() {
  const router = useRouter();
  const parametros = useParams();
  const grupoId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [pestana, setPestana] = useState<Pestana>('estudiantes');
  const [procesando, setProcesando] = useState(false);

  // Catálogos para edición y traslados
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [periodos, setPeriodos] = useState<OpcionPeriodo[]>([]);
  const [planesEdit, setPlanesEdit] = useState<PlanEstudio[]>([]);

  // Pestaña estudiantes
  const [estudiantes, setEstudiantes] = useState<EstudianteEnGrupo[]>([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);

  // Pestaña materias
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargandoMaterias, setCargandoMaterias] = useState(false);

  // Pestaña historial
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Modal editar
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [erroresEditar, setErroresEditar] = useState<Record<string, string>>({});
  const [datosEditar, setDatosEditar] = useState({
    carreraId: '',
    planEstudioId: '',
    semestre: '',
    turnoId: '',
    paralelo: '',
    periodoId: '',
    capacidad: '30',
  });

  // Modal asignar
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [disponibles, setDisponibles] = useState<Estudiante[]>([]);
  const [cargandoDisponibles, setCargandoDisponibles] = useState(false);

  // Modal retirar
  const [estudianteRetirar, setEstudianteRetirar] = useState<EstudianteEnGrupo | null>(null);

  // Modal trasladar
  const [estudianteTrasladar, setEstudianteTrasladar] = useState<EstudianteEnGrupo | null>(null);
  const [gruposDestino, setGruposDestino] = useState<Grupo[]>([]);
  const [cargandoDestinos, setCargandoDestinos] = useState(false);
  const [grupoDestinoId, setGrupoDestinoId] = useState('');

  // Confirmación de estado
  const [modalEstadoAbierto, setModalEstadoAbierto] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
    cargarGrupo();
    cargarEstudiantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const cargarDatosIniciales = async () => {
    try {
      const [respuestaCarreras, respuestaTurnos, respuestaGestiones] = await Promise.all([
        api.get('/carreras/activos'),
        api.get('/turnos/todos'),
        api.get('/gestiones'),
      ]);
      setCarreras(respuestaCarreras.data || []);
      setTurnos(respuestaTurnos.data.datos || respuestaTurnos.data || []);
      const gestiones: Gestion[] = respuestaGestiones.data.datos || respuestaGestiones.data || [];
      setPeriodos(construirOpcionesPeriodo(gestiones));
    } catch (error) {
      console.error('Error al obtener catálogos:', error);
    }
  };

  const cargarGrupo = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get(`/grupos/${grupoId}`);
      setGrupo(respuesta.data);
      setNoEncontrado(false);
    } catch (error) {
      console.error('Error al obtener el grupo:', error);
      setNoEncontrado(true);
    } finally {
      setCargando(false);
    }
  };

  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    try {
      const respuesta = await api.get(`/grupos/${grupoId}/estudiantes`);
      setEstudiantes(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  const cargarMaterias = async () => {
    setCargandoMaterias(true);
    try {
      const respuesta = await api.get(`/grupos/${grupoId}/materias`);
      setMaterias(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener materias:', error);
    } finally {
      setCargandoMaterias(false);
    }
  };

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const respuesta = await api.get(`/grupos/${grupoId}/historial`);
      setHistorial(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const recargarTodo = async () => {
    await Promise.all([cargarGrupo(), cargarEstudiantes(), cargarHistorial()]);
  };

  const cambiarPestana = (nueva: Pestana) => {
    setPestana(nueva);
    if (nueva === 'materias' && materias.length === 0) cargarMaterias();
    if (nueva === 'historial') cargarHistorial();
  };

  // ---- Edición ----
  const abrirEditar = () => {
    if (!grupo) return;
    setErroresEditar({});
    setPlanesEdit([]);
    setDatosEditar({
      carreraId: grupo.carreraId.toString(),
      planEstudioId: grupo.planEstudioId.toString(),
      semestre: grupo.semestre.toString(),
      turnoId: grupo.turnoId.toString(),
      paralelo: grupo.paralelo,
      periodoId: grupo.periodoId ? grupo.periodoId.toString() : '',
      capacidad: grupo.capacidad.toString(),
    });
    setModalEditarAbierto(true);
    if (grupo.carreraId) obtenerPlanesEdit(grupo.carreraId.toString());
  };

  const obtenerPlanesEdit = async (carreraId: string) => {
    if (!carreraId) {
      setPlanesEdit([]);
      return;
    }
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      setPlanesEdit(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener planes de estudio:', error);
      setPlanesEdit([]);
    }
  };

  const guardarEdicion = async () => {
    const nuevosErrores: Record<string, string> = {};
    if (!datosEditar.carreraId) nuevosErrores.carreraId = 'La carrera es requerida';
    if (!datosEditar.semestre) nuevosErrores.semestre = 'El semestre es requerido';
    if (!datosEditar.turnoId) nuevosErrores.turnoId = 'El turno es requerido';
    if (!datosEditar.paralelo.trim()) nuevosErrores.paralelo = 'El paralelo es requerido';
    if (!datosEditar.periodoId) nuevosErrores.periodoId = 'El periodo es requerido';
    setErroresEditar(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setProcesando(true);
    try {
      await api.patch(`/grupos/${grupoId}`, {
        carreraId: Number(datosEditar.carreraId),
        planEstudioId: datosEditar.planEstudioId ? Number(datosEditar.planEstudioId) : undefined,
        semestre: Number(datosEditar.semestre),
        turnoId: Number(datosEditar.turnoId),
        paralelo: datosEditar.paralelo.toUpperCase(),
        periodoId: Number(datosEditar.periodoId),
        capacidad: Number(datosEditar.capacidad) || 30,
      });
      setModalEditarAbierto(false);
      await Promise.all([cargarGrupo(), cargarHistorial()]);
    } catch (error) {
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        setErroresEditar({ submit: mensajeDeError(error, 'Error al actualizar el grupo') }),
      );
    } finally {
      setProcesando(false);
    }
  };

  // ---- Cambio de estado ----
  const confirmarCambioEstado = async () => {
    if (!grupo) return;
    setProcesando(true);
    try {
      const nuevoEstado = grupo.estado === 'activo' ? 'cerrado' : 'activo';
      await api.patch(`/grupos/${grupoId}/estado`, { estado: nuevoEstado });
      setModalEstadoAbierto(false);
      await Promise.all([cargarGrupo(), cargarHistorial()]);
    } catch (error) {
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al cambiar el estado del grupo')),
      );
    } finally {
      setProcesando(false);
    }
  };

  // ---- Asignar estudiantes ----
  const abrirAsignar = async () => {
    setModalAsignarAbierto(true);
    setBusquedaEstudiante('');
    setCargandoDisponibles(true);
    try {
      const respuesta = await api.get('/estudiantes', { params: { limite: 300 } });
      const lista: Estudiante[] = respuesta.data.datos || [];
      const idsAsignados = new Set(estudiantes.map((e) => e.estudianteId));
      const filtrados = lista.filter(
        (estudiante) =>
          estudiante.carreraId === grupo?.carreraId &&
          estudiante.estado === 'activo' &&
          !idsAsignados.has(estudiante.id),
      );
      setDisponibles(filtrados);
    } catch (error) {
      console.error('Error al obtener estudiantes disponibles:', error);
      setDisponibles([]);
    } finally {
      setCargandoDisponibles(false);
    }
  };

  const asignarEstudiante = async (estudianteId: number) => {
    setProcesando(true);
    try {
      await api.post(`/grupos/${grupoId}/estudiantes/${estudianteId}`);
      setModalAsignarAbierto(false);
      await recargarTodo();
    } catch (error) {
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al asignar al estudiante')),
      );
    } finally {
      setProcesando(false);
    }
  };

  // ---- Retirar ----
  const confirmarRetirar = async () => {
    if (!estudianteRetirar) return;
    setProcesando(true);
    try {
      await api.delete(`/grupos/${grupoId}/estudiantes/${estudianteRetirar.estudianteId}`);
      setEstudianteRetirar(null);
      await recargarTodo();
    } catch (error) {
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al retirar al estudiante')),
      );
    } finally {
      setProcesando(false);
    }
  };

  // ---- Trasladar ----
  const abrirTrasladar = async (estudiante: EstudianteEnGrupo) => {
    setEstudianteTrasladar(estudiante);
    setGrupoDestinoId('');
    setGruposDestino([]);
    setCargandoDestinos(true);
    try {
      const respuesta = await api.get('/grupos', {
        params: { carreraId: grupo?.carreraId, limite: 100 },
      });
      const destinos: Grupo[] = (respuesta.data.datos || []).filter(
        (destino: Grupo) => destino.id !== Number(grupoId),
      );
      setGruposDestino(destinos);
    } catch (error) {
      console.error('Error al obtener grupos de destino:', error);
      setGruposDestino([]);
    } finally {
      setCargandoDestinos(false);
    }
  };

  const confirmarTrasladar = async () => {
    if (!estudianteTrasladar || !grupoDestinoId) return;
    setProcesando(true);
    try {
      await api.post(`/grupos/${grupoId}/estudiantes/${estudianteTrasladar.estudianteId}/trasladar`, {
        grupoDestinoId: Number(grupoDestinoId),
      });
      setEstudianteTrasladar(null);
      await recargarTodo();
    } catch (error) {
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al trasladar al estudiante')),
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (noEncontrado || !grupo) {
    return (
      <div className="space-y-6">
        <Migas elementos={[{ etiqueta: 'Grupos', href: '/grupos' }, { etiqueta: 'Grupo no encontrado' }]} />
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          No se encontró el grupo solicitado.
        </div>
        <Boton variante="contorno" onClick={() => router.push('/grupos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a grupos
        </Boton>
      </div>
    );
  }

  const sinCupo = (grupo.cuposDisponibles ?? 0) <= 0;

  const estudiantesDisponibles = disponibles.filter((estudiante) => {
    if (!busquedaEstudiante.trim()) return true;
    const texto = busquedaEstudiante.toLowerCase();
    const persona = estudiante.persona;
    const nombre = persona
      ? `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase()
      : '';
    const ci = persona?.ci?.toLowerCase() || '';
    return nombre.includes(texto) || ci.includes(texto);
  });

  const pestanas: { clave: Pestana; etiqueta: string; icono: React.ReactNode }[] = [
    { clave: 'estudiantes', etiqueta: 'Estudiantes', icono: <Users className="w-4 h-4" /> },
    { clave: 'materias', etiqueta: 'Materias', icono: <BookOpen className="w-4 h-4" /> },
    { clave: 'horario', etiqueta: 'Horario', icono: <CalendarClock className="w-4 h-4" /> },
    { clave: 'historial', etiqueta: 'Historial', icono: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Grupos', href: '/grupos' }, { etiqueta: grupo.codigo }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{grupo.codigo}</h1>
          <Insignia variante={grupo.estado === 'activo' ? 'exito' : 'secundario'}>
            {grupo.estado === 'activo' ? 'Activo' : 'Cerrado'}
          </Insignia>
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="contorno" onClick={abrirEditar}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Boton>
          <Boton
            variante={grupo.estado === 'activo' ? 'destructivo' : 'primario'}
            onClick={() => setModalEstadoAbierto(true)}
          >
            {grupo.estado === 'activo' ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Cerrar grupo
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Reactivar
              </>
            )}
          </Boton>
          <Boton variante="fantasma" onClick={() => router.push('/grupos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Boton>
        </div>
      </div>

      {/* Tarjeta resumen */}
      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Resumen del grupo</TituloTarjeta>
          <DescripcionTarjeta>Datos generales y disponibilidad de cupos.</DescripcionTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DatoResumen etiqueta="Gestión" valor={grupo.periodo?.gestion?.anio || grupo.gestion || '-'} />
            <DatoResumen etiqueta="Carrera" valor={grupo.carrera?.nombre || '-'} />
            <DatoResumen etiqueta="Nivel" valor="Técnico Superior" />
            <DatoResumen etiqueta="Semestre" valor={`${grupo.semestre}.º semestre`} />
            <DatoResumen etiqueta="Periodo" valor={grupo.periodo ? `Periodo ${grupo.periodo.numero}` : '-'} />
            <DatoResumen etiqueta="Turno" valor={grupo.turno?.nombre || '-'} />
            <DatoResumen etiqueta="Paralelo" valor={grupo.paralelo} />
            <DatoResumen etiqueta="Código" valor={grupo.codigo} />
            <DatoResumen etiqueta="Capacidad" valor={grupo.capacidad.toString()} />
            <DatoResumen etiqueta="Inscritos" valor={(grupo.inscritos ?? 0).toString()} />
            <DatoResumen
              etiqueta="Cupos disponibles"
              valor={(grupo.cuposDisponibles ?? Math.max(grupo.capacidad - (grupo.inscritos ?? 0), 0)).toString()}
            />
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Pestañas */}
      <Tarjeta variante="conBorde">
        <div className="border-b border-border px-2">
          <nav className="flex flex-wrap gap-1">
            {pestanas.map((item) => (
              <button
                key={item.clave}
                onClick={() => cambiarPestana(item.clave)}
                className={
                  'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ' +
                  (pestana === item.clave
                    ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')
                }
              >
                {item.icono}
                {item.etiqueta}
              </button>
            ))}
          </nav>
        </div>

        <ContenidoTarjeta>
          {/* Pestaña Estudiantes */}
          {pestana === 'estudiantes' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Estudiantes del grupo</h3>
                  <p className="text-sm text-muted-foreground">
                    {grupo.inscritos ?? estudiantes.length} de {grupo.capacidad} cupos ocupados
                  </p>
                </div>
                <Boton onClick={abrirAsignar} disabled={sinCupo} title={sinCupo ? 'El grupo no tiene cupos disponibles' : undefined}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Asignar estudiante
                </Boton>
              </div>

              {sinCupo && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg text-sm">
                  El grupo alcanzó su capacidad máxima. No hay cupos disponibles.
                </div>
              )}

              {cargandoEstudiantes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>CI / Código</CeldaEncabezado>
                      <CeldaEncabezado>Nombre completo</CeldaEncabezado>
                      <CeldaEncabezado>Estado de inscripción</CeldaEncabezado>
                      <CeldaEncabezado>Asignado el</CeldaEncabezado>
                      <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {estudiantes.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay estudiantes asignados a este grupo.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      estudiantes.map((registro) => (
                        <FilaTabla key={registro.id}>
                          <CeldaTabla>
                            <div className="text-sm font-medium">{registro.estudiante?.persona?.ci || '-'}</div>
                            <div className="text-xs text-muted-foreground">
                              {registro.estudiante?.codigoInscripcion || ''}
                            </div>
                          </CeldaTabla>
                          <CeldaTabla>{nombreCompleto(registro.estudiante?.persona)}</CeldaTabla>
                          <CeldaTabla>
                            <Insignia variante="primario">
                              {registro.estudiante?.estadoMatricula || registro.estudiante?.estado || '-'}
                            </Insignia>
                          </CeldaTabla>
                          <CeldaTabla>{formatearFecha(registro.inscritoEn)}</CeldaTabla>
                          <CeldaTabla>
                            <div className="flex items-center justify-end gap-1">
                              <Boton
                                variante="fantasma"
                                tamano="icono"
                                title="Trasladar a otro grupo"
                                onClick={() => abrirTrasladar(registro)}
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </Boton>
                              <Boton
                                variante="fantasma"
                                tamano="icono"
                                title="Retirar del grupo"
                                onClick={() => setEstudianteRetirar(registro)}
                              >
                                <UserMinus className="w-4 h-4 text-red-500" />
                              </Boton>
                            </div>
                          </CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}

          {/* Pestaña Materias */}
          {pestana === 'materias' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Materias del semestre</h3>
                <p className="text-sm text-muted-foreground">
                  Materias correspondientes al semestre {grupo.semestre} del plan de estudios.
                </p>
              </div>
              {cargandoMaterias ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>Código</CeldaEncabezado>
                      <CeldaEncabezado>Materia</CeldaEncabezado>
                      <CeldaEncabezado>Semestre</CeldaEncabezado>
                      <CeldaEncabezado>Horas semanales</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {materias.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={4} className="text-center py-8 text-muted-foreground">
                          No hay materias registradas para este semestre.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      materias.map((materia) => (
                        <FilaTabla key={materia.id}>
                          <CeldaTabla className="font-medium">{materia.codigo}</CeldaTabla>
                          <CeldaTabla>{materia.nombre}</CeldaTabla>
                          <CeldaTabla>{materia.semestre}.º</CeldaTabla>
                          <CeldaTabla>{materia.horasSemanales ?? '-'}</CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}

          {/* Pestaña Horario */}
          {pestana === 'horario' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Horario del turno</h3>
                <p className="text-sm text-muted-foreground">Franja horaria correspondiente al turno del grupo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <DatoResumen etiqueta="Turno" valor={grupo.turno?.nombre || '-'} />
                <DatoResumen etiqueta="Hora de inicio" valor={grupo.turno?.horaInicio || '-'} />
                <DatoResumen etiqueta="Hora de fin" valor={grupo.turno?.horaFin || '-'} />
              </div>
              <div className="bg-muted/40 border border-border text-muted-foreground px-4 py-3 rounded-lg text-sm">
                Programación detallada de horarios próximamente.
              </div>
            </div>
          )}

          {/* Pestaña Historial */}
          {pestana === 'historial' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Historial de movimientos</h3>
                <p className="text-sm text-muted-foreground">Registro de asignaciones, retiros y cambios de estado.</p>
              </div>
              {cargandoHistorial ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>Fecha</CeldaEncabezado>
                      <CeldaEncabezado>Acción</CeldaEncabezado>
                      <CeldaEncabezado>Estudiante</CeldaEncabezado>
                      <CeldaEncabezado>Detalle</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {historial.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={4} className="text-center py-8 text-muted-foreground">
                          No hay movimientos registrados.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      historial.map((registro) => (
                        <FilaTabla key={registro.id}>
                          <CeldaTabla className="text-sm whitespace-nowrap">
                            {formatearFechaHora(registro.creadoEn)}
                          </CeldaTabla>
                          <CeldaTabla>
                            <Insignia variante={varianteAccion(registro.accion)}>{registro.accion}</Insignia>
                          </CeldaTabla>
                          <CeldaTabla className="text-sm">
                            {registro.estudiante?.persona ? nombreCompleto(registro.estudiante.persona) : '-'}
                          </CeldaTabla>
                          <CeldaTabla className="text-sm text-muted-foreground">{registro.detalle || '-'}</CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Editar */}
      <Modal
        abierto={modalEditarAbierto}
        alCerrar={() => setModalEditarAbierto(false)}
        titulo="Editar grupo"
        tamano="grande"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Selector
              etiqueta="Carrera *"
              value={datosEditar.carreraId}
              onChange={(e) => {
                setDatosEditar({ ...datosEditar, carreraId: e.target.value, planEstudioId: '' });
                obtenerPlanesEdit(e.target.value);
              }}
              error={erroresEditar.carreraId}
              opciones={[
                { value: '', etiqueta: 'Seleccionar carrera...' },
                ...carreras.map((carrera) => ({ value: carrera.id.toString(), etiqueta: carrera.nombre })),
              ]}
            />
            <Selector
              etiqueta="Plan de estudios"
              value={datosEditar.planEstudioId}
              onChange={(e) => setDatosEditar({ ...datosEditar, planEstudioId: e.target.value })}
              disabled={!datosEditar.carreraId}
              opciones={[
                { value: '', etiqueta: 'Seleccionar plan...' },
                ...planesEdit.map((plan) => ({ value: plan.id.toString(), etiqueta: `RM ${plan.numeroRm}` })),
              ]}
            />
            <Selector
              etiqueta="Semestre *"
              value={datosEditar.semestre}
              onChange={(e) => setDatosEditar({ ...datosEditar, semestre: e.target.value })}
              error={erroresEditar.semestre}
              opciones={[{ value: '', etiqueta: 'Seleccionar semestre...' }, ...obtenerSemestres()]}
            />
            <Selector
              etiqueta="Turno *"
              value={datosEditar.turnoId}
              onChange={(e) => setDatosEditar({ ...datosEditar, turnoId: e.target.value })}
              error={erroresEditar.turnoId}
              opciones={[
                { value: '', etiqueta: 'Seleccionar turno...' },
                ...turnos.map((turno) => ({
                  value: turno.id.toString(),
                  etiqueta: `${turno.nombre} (${turno.horaInicio}-${turno.horaFin})`,
                })),
              ]}
            />
            <Entrada
              etiqueta="Paralelo *"
              value={datosEditar.paralelo}
              onChange={(e) => setDatosEditar({ ...datosEditar, paralelo: e.target.value.toUpperCase() })}
              error={erroresEditar.paralelo}
              placeholder="A"
              maxLength={5}
            />
            <Selector
              etiqueta="Periodo *"
              value={datosEditar.periodoId}
              onChange={(e) => setDatosEditar({ ...datosEditar, periodoId: e.target.value })}
              error={erroresEditar.periodoId}
              opciones={[
                { value: '', etiqueta: 'Seleccionar periodo...' },
                ...periodos.map((periodo) => ({ value: periodo.id.toString(), etiqueta: periodo.etiqueta })),
              ]}
            />
            <Entrada
              etiqueta="Capacidad"
              type="number"
              min={1}
              value={datosEditar.capacidad}
              onChange={(e) => setDatosEditar({ ...datosEditar, capacidad: e.target.value })}
              placeholder="30"
            />
          </div>

          {erroresEditar.submit && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {erroresEditar.submit}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalEditarAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={guardarEdicion} cargando={procesando}>
              Guardar cambios
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal Asignar estudiante */}
      <Modal
        abierto={modalAsignarAbierto}
        alCerrar={() => setModalAsignarAbierto(false)}
        titulo="Asignar estudiante"
        descripcion={`Estudiantes activos de la carrera ${grupo.carrera?.nombre || ''} no asignados aún.`}
        tamano="grande"
      >
        <div className="space-y-4">
          <BuscadorFiltro
            placeholder="Buscar por nombre o CI..."
            value={busquedaEstudiante}
            onChange={setBusquedaEstudiante}
          />

          {cargandoDisponibles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : estudiantesDisponibles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No hay estudiantes disponibles para asignar.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto scrollarea-tema divide-y divide-gray-100">
              {estudiantesDisponibles.map((estudiante) => (
                <div key={estudiante.id} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {estudiante.persona
                        ? `${estudiante.persona.nombres} ${estudiante.persona.apellidoPaterno} ${estudiante.persona.apellidoMaterno}`
                        : 'Estudiante'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CI: {estudiante.persona?.ci || '-'} · {estudiante.codigoInscripcion}
                    </p>
                  </div>
                  <Boton tamano="pequeno" onClick={() => asignarEstudiante(estudiante.id)} disabled={procesando}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Asignar
                  </Boton>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Boton variante="contorno" onClick={() => setModalAsignarAbierto(false)}>
              Cerrar
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal Trasladar */}
      <Modal
        abierto={!!estudianteTrasladar}
        alCerrar={() => setEstudianteTrasladar(null)}
        titulo="Trasladar estudiante"
        descripcion={
          estudianteTrasladar
            ? `Trasladar a ${nombreCompleto(estudianteTrasladar.estudiante?.persona)} a otro grupo.`
            : undefined
        }
        tamano="mediano"
      >
        <div className="space-y-4">
          {cargandoDestinos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : (
            <Selector
              etiqueta="Grupo de destino *"
              value={grupoDestinoId}
              onChange={(e) => setGrupoDestinoId(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Seleccionar grupo...' },
                ...gruposDestino.map((destino) => ({
                  value: destino.id.toString(),
                  etiqueta: `${destino.codigo} · ${destino.turno?.nombre || ''} · ${destino.paralelo} (${destino.cuposDisponibles ?? destino.capacidad} cupos)`,
                })),
              ]}
            />
          )}
          {!cargandoDestinos && gruposDestino.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay otros grupos de la misma carrera disponibles.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Boton variante="contorno" onClick={() => setEstudianteTrasladar(null)}>
              Cancelar
            </Boton>
            <Boton onClick={confirmarTrasladar} disabled={!grupoDestinoId} cargando={procesando}>
              Trasladar
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Confirmar retirar */}
      <ModalConfirmacion
        abierto={!!estudianteRetirar}
        alCerrar={() => setEstudianteRetirar(null)}
        alConfirmar={confirmarRetirar}
        titulo="Retirar estudiante"
        mensaje={
          estudianteRetirar
            ? `¿Retirar a ${nombreCompleto(estudianteRetirar.estudiante?.persona)} del grupo?`
            : undefined
        }
        textoConfirmar="Retirar"
        variante="destructivo"
        cargando={procesando}
      />

      {/* Confirmar cambio de estado */}
      <ModalConfirmacion
        abierto={modalEstadoAbierto}
        alCerrar={() => setModalEstadoAbierto(false)}
        alConfirmar={confirmarCambioEstado}
        titulo={grupo.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar grupo'}
        mensaje={
          grupo.estado === 'activo'
            ? `El grupo "${grupo.codigo}" pasará a estado cerrado.`
            : `El grupo "${grupo.codigo}" volverá a estar activo.`
        }
        textoConfirmar={grupo.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar'}
        cargando={procesando}
      />

      {/* Pie con código */}
      <PieTarjeta className="rounded-lg border border-border text-sm text-muted-foreground">
        Código de grupo: <span className="font-medium text-foreground">{grupo.codigo}</span>
      </PieTarjeta>
    </div>
  );
}

function DatoResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{valor}</p>
    </div>
  );
}
