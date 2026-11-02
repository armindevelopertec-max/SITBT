'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Insignia } from '@/componentes/iu/insignia';
import { api } from '@/libreria/api';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import { cn, formatearMoneda, mensajeDeError, obtenerIniciales } from '@/libreria/utilidades';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  UserRound,
  BookOpen,
  CreditCard,
  FileText,
  Users,
  Check,
  ChevronRight,
  ChevronLeft,
  Printer,
  RotateCcw,
  School,
  CalendarDays,
  CircleCheck,
  GraduationCap,
} from 'lucide-react';

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  gestionAdmision: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  carrera?: {
    id: number;
    nombre: string;
  };
  plan_estudio?: {
    id: number;
    numeroRm: string;
  };
}

interface EstadoPagos {
  puedeInscribir: boolean;
  pagosFaltantes: { tipo: string; concepto: string; monto: number }[];
  pagosRealizados: { tipo: string; concepto: string; monto: number; fechaPago: string }[];
  esEstudianteNuevo: boolean;
}

/** Estado de inscripción del estudiante en la gestión/periodo actual. */
interface EstadoInscripcion {
  yaInscrito: boolean;
  totalInscripciones: number;
  grupos: {
    id: number;
    codigo: string;
    paralelo: string;
    semestre: number;
    turnoId: number;
    turnoNombre: string;
  }[];
  materias: { id: number; materiaId: number; nombre: string; estado: string }[];
}

/** Estudiante ya inscrito en el período actual. */
interface EstudianteInscrito {
  id: number;
  codigoInscripcion: string;
  nombres: string;
  apellidos: string;
  ci: string;
  carrera: string;
  carreraId: number;
  totalMaterias: number;
  grupos: { id: number; codigo: string; paralelo: string; semestre: number }[];
}

/**
 * Resumen legible de los grupos: "paralelo A · S1".
 * Agrupa los grupos por paralelo para no repetir el mismo paralelo.
 */
function descripcionGrupos(
  grupos: { codigo: string; paralelo: string; semestre: number }[],
): string {
  if (grupos.length === 0) return '';

  const semestres = Array.from(new Set(grupos.map((grupo) => grupo.semestre)));
  const paralelos = Array.from(new Set(grupos.map((grupo) => grupo.paralelo)));
  const semestreTexto =
    semestres.length === 1 ? `S${semestres[0]}` : `S${semestres.join(', S')}`;

  return `paralelo ${paralelos.join(', ')} · ${semestreTexto}`;
}

interface MateriaAInscribir {
  materiaPlanId: number;
  materiaId: number;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  esReprobada: boolean;
  notaAnteriorReprobada?: number;
  prerrequisitoBloqueado: boolean;
  nombrePrerrequisito?: string;
}

interface Grupo {
  id: number;
  semestre: number;
  paralelo: string;
  gestion: string;
  carreraId: number;
  turnoId: number;
  capacidad: number;
  turno?: { id: number; codigo: string; nombre: string };
}

interface AsignacionGrupo {
  grupoId: number;
  materias: MateriaAInscribir[];
}

type Paso = 'search' | 'payments' | 'subjects' | 'groups' | 'confirm' | 'success';

const PASOS: { id: Exclude<Paso, 'success'>; etiqueta: string; icono: LucideIcon }[] = [
  { id: 'search', etiqueta: 'Estudiante', icono: UserRound },
  { id: 'payments', etiqueta: 'Pagos', icono: CreditCard },
  { id: 'subjects', etiqueta: 'Materias', icono: BookOpen },
  { id: 'groups', etiqueta: 'Grupos', icono: Users },
  { id: 'confirm', etiqueta: 'Confirmar', icono: FileText },
];

export default function PaginaPreinscripcion() {
  const { usuario } = usarAlmacenAutenticacion();
  const [paso, setPaso] = useState<Paso>('search');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Aviso informativo (por ejemplo: el estudiante ya está inscrito). */
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  const [estadoPagos, setEstadoPagos] = useState<EstadoPagos | null>(null);
  const [estadoInscripcionPorEstudiante, setEstadoInscripcionPorEstudiante] = useState<
    Map<number, EstadoInscripcion | null>
  >(new Map());
  const [estadoInscripcionActual, setEstadoInscripcionActual] = useState<EstadoInscripcion | null>(null);
  /** Grupos en los que el estudiante ya está inscrito (para evitar choques de turno). */
  const [gruposInscritosDelEstudiante, setGruposInscritosDelEstudiante] = useState<
    EstadoInscripcion['grupos']
  >([]);
  /** Estudiantes ya inscritos en el período actual. */
  const [inscritos, setInscritos] = useState<EstudianteInscrito[]>([]);
  const [paginaInscritos, setPaginaInscritos] = useState(1);
  const [totalPaginasInscritos, setTotalPaginasInscritos] = useState(1);
  const [totalInscritos, setTotalInscritos] = useState(0);
  const [cargandoInscritos, setCargandoInscritos] = useState(false);
  const LIMITE_INSCRITOS = 10;
  const [materias, setMaterias] = useState<MateriaAInscribir[]>([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<MateriaAInscribir[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoPorSemestre, setGrupoPorSemestre] = useState<Record<number, number>>({});
  const [periodoActual, setPeriodoActual] = useState<string>('I');
  const [gestionActual, setGestionActual] = useState<string>(new Date().getFullYear().toString());
  const [resultadoInscripcion, setResultadoInscripcion] = useState<any>(null);

  useEffect(() => {
    obtenerGestionActual();
  }, []);

  const obtenerGestionActual = async () => {
    try {
      const respuesta = await api.get('/gestiones/actual');
      if (respuesta.data) {
        setGestionActual(respuesta.data.anio);
        const periodoAbierto = respuesta.data.periodos?.find((periodo: any) => periodo.estado === 'abierta');
        if (periodoAbierto) {
          setPeriodoActual(periodoAbierto.numero);
        }
      }
    } catch (error) {
      console.error('Error al obtener la gestión:', error);
    }
  };

  const cargarInscritos = useCallback(
    async (pagina: number) => {
      if (!gestionActual) return;
      setCargandoInscritos(true);
      try {
        const respuesta = await api.get('/preinscripcion/inscritos', {
          params: {
            gestion: gestionActual,
            pagina,
            limite: LIMITE_INSCRITOS,
          },
        });
        setInscritos(respuesta.data?.datos ?? []);
        setTotalInscritos(respuesta.data?.total ?? 0);
        setTotalPaginasInscritos(respuesta.data?.totalPaginas ?? 1);
      } catch (e) {
        console.error('Error al cargar los estudiantes inscritos:', e);
      } finally {
        setCargandoInscritos(false);
      }
    },
    [gestionActual],
  );

  useEffect(() => {
    void cargarInscritos(1);
  }, [cargarInscritos]);

  const buscarEstudiantes = async (consulta?: string) => {
    const texto = (consulta ?? consultaBusqueda).trim();
    if (!texto) return;
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: texto, limite: 20 },
      });
      const lista = respuesta.data.datos || [];
      setEstudiantes(lista);
      setBusquedaRealizada(true);
      setMensaje(null);

      // Consulta el estado de inscripción de cada estudiante para avisar
      // desde el inicio si ya está inscrito en la gestión/periodo actual.
      const estados = await Promise.all(
        lista.map(async (estudiante: Estudiante) => {
          try {
            const estado = await api.get('/preinscripcion/estado-inscripcion', {
              params: {
                estudianteId: estudiante.id,
                gestion: gestionActual,
                periodo: periodoActual,
              },
            });
            return [estudiante.id, estado.data] as const;
          } catch {
            return [estudiante.id, null] as const;
          }
        }),
      );
      setEstadoInscripcionPorEstudiante(new Map(estados));
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudo buscar estudiantes'));
      console.error('Error al buscar:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarEstudiante = async (estudiante: Estudiante) => {
    setMensaje(null);

    // Estado de inscripción del estudiante en la gestión/período actual.
    // Si no está en caché (por ejemplo, al elegirlo de la lista de inscritos)
    // se consulta antes de decidir si se puede avanzar.
    let estado = estadoInscripcionPorEstudiante.get(estudiante.id) ?? null;

    if (!estado) {
      try {
        const respuesta = await api.get('/preinscripcion/estado-inscripcion', {
          params: {
            estudianteId: estudiante.id,
            gestion: gestionActual,
            periodo: periodoActual,
          },
        });
        estado = respuesta.data ?? null;
        setEstadoInscripcionPorEstudiante((anteriores) => {
          const nuevos = new Map(anteriores);
          nuevos.set(estudiante.id, estado);
          return nuevos;
        });
      } catch (e) {
        console.error('Error al consultar el estado de inscripción:', e);
      }
    }

    setEstadoInscripcionActual(estado);
    setGruposInscritosDelEstudiante(estado?.grupos ?? []);

    // Si ya está inscrito en el período no se avanza al proceso: se muestra
    // el detalle en el paso de Estudiante y se impide continuar.
    if (estado?.yaInscrito) {
      setEstudianteSeleccionado(estudiante);
      setPaso('search');
      setMensaje(
        `Este estudiante ya está inscrito en ${estado.totalInscripciones} ` +
          `materia${estado.totalInscripciones === 1 ? '' : 's'} del período ` +
          `${periodoActual}/${gestionActual}. No se puede volver a inscribir.`,
      );
      return;
    }

    setEstudianteSeleccionado(estudiante);
    setPaso('payments');
    await verificarPagos(estudiante);
  };

  const verificarPagos = async (estudiante: Estudiante) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/preinscripcion/verificar-pagos', {
        estudianteId: estudiante.id,
        gestion: gestionActual,
        periodo: periodoActual,
      });
      setEstadoPagos(respuesta.data);

      // Las materias se calculan siempre: si hay pagos pendientes se puede
      // continuar de todos modos y el pago queda registrado al confirmar la
      // inscripción.
      await calcularMaterias(estudiante);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudo verificar los pagos'));
      console.error('Error al verificar los pagos:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularMaterias = async (estudiante: Estudiante) => {
    try {
      const respuesta = await api.post('/preinscripcion/calcular-materias', {
        estudianteId: estudiante.id,
        gestion: gestionActual,
        periodo: periodoActual,
      });

      const datos = respuesta.data;
      setMaterias(datos.materias || []);
      const seleccionables = datos.materias?.filter((materia: any) => !materia.prerrequisitoBloqueado) || [];
      setMateriasSeleccionadas(seleccionables);
      setGrupoPorSemestre({});

      const semestres = Array.from(
        new Set<number>(seleccionables.map((materia: any) => Number(materia.semestre))),
      ).sort((a, b) => a - b);

      await obtenerGrupos(estudiante, semestres);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudieron calcular las materias'));
      console.error('Error al calcular las materias:', error);
    }
  };

  const obtenerGrupos = async (
    estudiante: Estudiante,
    semestres: number[] = semestresSeleccionados,
  ) => {
    const carreraId = estudiante.carrera?.id;
    if (!carreraId) {
      setGrupos([]);
      return;
    }
    try {
      // Se envían los semestres a cursar y el plan del estudiante: si no hay
      // grupos creados, el backend los genera automáticamente (un grupo por
      // turno con paralelo A).
      const paramSemestres = semestres.join(',');
      const respuesta = await api.get('/preinscripcion/grupos', {
        params: {
          carreraId,
          gestion: gestionActual,
          semestres: paramSemestres || undefined,
          planEstudioId: estudiante.plan_estudio?.id || undefined,
        },
      });
      setGrupos(respuesta.data || []);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudieron obtener los grupos'));
      console.error('Error al obtener los grupos:', error);
    }
  };

  const alternarMateria = (materia: MateriaAInscribir) => {
    setMateriasSeleccionadas((anteriores) => {
      const existe = anteriores.find((materiaSeleccionada) => materiaSeleccionada.materiaId === materia.materiaId);
      if (existe) {
        return anteriores.filter((materiaSeleccionada) => materiaSeleccionada.materiaId !== materia.materiaId);
      }
      return [...anteriores, materia];
    });
  };

  const semestresSeleccionados = Array.from(
    new Set(materiasSeleccionadas.map((materia) => materia.semestre)),
  ).sort((a, b) => a - b);

  const construirAsignaciones = (): AsignacionGrupo[] =>
    semestresSeleccionados
      .filter((semestre) => grupoPorSemestre[semestre])
      .map((semestre) => ({
        grupoId: grupoPorSemestre[semestre],
        materias: materiasSeleccionadas.filter((materia) => materia.semestre === semestre),
      }));

  const todosLosGruposSeleccionados =
    semestresSeleccionados.length > 0 &&
    semestresSeleccionados.every((semestre) => !!grupoPorSemestre[semestre]);

  const confirmarInscripcion = async () => {
    const asignaciones = construirAsignaciones();
    if (!estudianteSeleccionado || asignaciones.length === 0) return;

    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/preinscripcion/inscribir-lote', {
        estudianteId: estudianteSeleccionado.id,
        gestion: gestionActual,
        periodo: periodoActual,
        asignaciones,
        // Usuario que recibe los pagos de la matrícula.
        recibidoPor: usuario?.id,
      });
      setResultadoInscripcion(respuesta.data);
      setPaso('success');
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudo completar la inscripción'));
      console.error('Error al inscribir:', error);
    } finally {
      setCargando(false);
    }
  };

  const reiniciarFlujo = () => {
    setPaso('search');
    setError(null);
    setEstudianteSeleccionado(null);
    setEstadoPagos(null);
    setMaterias([]);
    setMateriasSeleccionadas([]);
    setGrupos([]);
    setGrupoPorSemestre({});
    setResultadoInscripcion(null);
    setConsultaBusqueda('');
    setBusquedaRealizada(false);
    setEstudiantes([]);
  };

  const indiceActual = paso === 'success' ? PASOS.length : PASOS.findIndex((p) => p.id === paso);

  const irAPaso = (id: Exclude<Paso, 'success'>) => {
    if (cargando) return;
    const destino = PASOS.findIndex((p) => p.id === id);
    if (destino <= indiceActual) setPaso(id);
  };

  const aviso = () => {
    if (!error) return null;
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/30 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
      </div>
    );
  };

  const puedeAvanzarPagos = !!estadoPagos;
  const puedeAvanzarMaterias = materiasSeleccionadas.length > 0;

  /* ----------------------------- Paso: Búsqueda ----------------------------- */
  const renderizarBusqueda = () => (
    <TablaPasoTarjeta
      titulo="Seleccionar estudiante"
      descripcion="Busca por nombre, CI o código de inscripción."
    >
      <BuscadorFiltro
        value={consultaBusqueda}
        onChange={(valor) => {
          setConsultaBusqueda(valor);
          // La búsqueda se hace mientras se escribe, sin botón adicional.
          if (valor.trim().length >= 2) {
            void buscarEstudiantes(valor);
          } else {
            setEstudiantes([]);
            setBusquedaRealizada(false);
          }
        }}
        placeholder="Buscar por nombre, CI o código de inscripción..."
        className="max-w-xl"
      />

      {mensaje && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/30 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-300">No se puede preinscribir</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{mensaje}</p>
            {estadoInscripcionActual && estadoInscripcionActual.grupos.length > 0 && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Materias inscritas:{' '}
                {estadoInscripcionActual.materias
                  .map((materia) => materia.nombre)
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {cargando && !estudiantes.length && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      )}

      {!cargando && estudiantes.length > 0 && (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-border">
          {estudiantes.map((estudiante) => {
            const estadoInscripcion = estadoInscripcionPorEstudiante.get(estudiante.id);
            return (
            <button
              key={estudiante.id}
              type="button"
              onClick={() => seleccionarEstudiante(estudiante)}
              className="group flex w-full items-center gap-4 bg-card p-4 text-left transition-colors hover:bg-muted/40"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-100 dark:bg-primary-900/30 font-semibold text-primary-700 dark:text-primary-300">
                {obtenerIniciales(
                  `${estudiante.persona?.nombres || ''} ${estudiante.persona?.apellidoPaterno || ''}`,
                ) || '?'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno}{' '}
                  {estudiante.persona?.apellidoMaterno}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  CI {estudiante.persona?.ci} · {estudiante.codigoInscripcion}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{estudiante.carrera?.nombre}</span>
                {estadoInscripcion?.yaInscrito && (
                  <span className="mt-1 block truncate text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Ya inscrito en {estadoInscripcion.totalInscripciones} materia
                    {estadoInscripcion.totalInscripciones === 1 ? '' : 's'}
                    {estadoInscripcion.grupos.length > 0 &&
                      ` · ${descripcionGrupos(estadoInscripcion.grupos)}`}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                {estadoInscripcion?.yaInscrito && (
                  <Insignia variante="exito">Inscrito</Insignia>
                )}
                <Insignia variante={estudiante.gestionAdmision === gestionActual ? 'exito' : 'secundario'}>
                  {estudiante.gestionAdmision === gestionActual ? 'Nuevo' : 'Antiguo'}
                </Insignia>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-muted-foreground" />
            </button>
            );
          })}
        </div>
      )}

      {!cargando && busquedaRealizada && estudiantes.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <p className="font-medium text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            No se encontraron estudiantes para «{consultaBusqueda}».
          </p>
        </div>
      )}

      {!cargando && !busquedaRealizada && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              Ya inscritos en el período {periodoActual}/{gestionActual}
            </h3>
            {totalInscritos > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalInscritos} estudiante{totalInscritos === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {cargandoInscritos && inscritos.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : inscritos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                <GraduationCap className="h-6 w-6" />
              </div>
              <p className="font-medium text-foreground">Comienza buscando un estudiante</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Ingresa el nombre, carnet de identidad o código de inscripción para iniciar la
                preinscripción.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-border">
                {inscritos.map((estudiante) => (
                  <button
                    key={estudiante.id}
                    type="button"
                    onClick={() =>
                      seleccionarEstudiante({
                        id: estudiante.id,
                        codigoInscripcion: estudiante.codigoInscripcion,
                        gestionAdmision: gestionActual,
                        persona: {
                          ci: estudiante.ci,
                          nombres: estudiante.nombres,
                          apellidoPaterno: estudiante.apellidos.split(' ')[0] ?? '',
                          apellidoMaterno:
                            estudiante.apellidos.split(' ').slice(1).join(' ') || '',
                        },
                        carrera: { id: estudiante.carreraId, nombre: estudiante.carrera },
                      } as Estudiante)
                    }
                    className="group flex w-full items-center gap-4 bg-card p-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 font-semibold text-emerald-700 dark:text-emerald-300">
                      {obtenerIniciales(
                        `${estudiante.nombres} ${estudiante.apellidos}`,
                      ) || '?'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {estudiante.nombres} {estudiante.apellidos}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        CI {estudiante.ci} · {estudiante.codigoInscripcion}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {estudiante.carrera}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Insignia variante="exito">Inscrito</Insignia>
                      <span className="text-xs text-muted-foreground">
                        {estudiante.totalMaterias} materia
                        {estudiante.totalMaterias === 1 ? '' : 's'}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-muted-foreground" />
                  </button>
                ))}
              </div>

              {totalPaginasInscritos > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Boton
                    variante="contorno"
                    tamano="pequeno"
                    disabled={paginaInscritos <= 1 || cargandoInscritos}
                    onClick={() => {
                      const nueva = paginaInscritos - 1;
                      setPaginaInscritos(nueva);
                      void cargarInscritos(nueva);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Boton>

                  {Array.from({ length: totalPaginasInscritos }, (_, indice) => indice + 1).map(
                    (numero) => (
                      <button
                        key={numero}
                        type="button"
                        disabled={cargandoInscritos}
                        onClick={() => {
                          setPaginaInscritos(numero);
                          void cargarInscritos(numero);
                        }}
                        className={cn(
                          'grid h-8 w-8 place-items-center rounded-lg border text-sm font-medium transition-colors',
                          numero === paginaInscritos
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-border bg-card text-foreground hover:bg-muted/40',
                        )}
                      >
                        {numero}
                      </button>
                    ),
                  )}

                  <Boton
                    variante="contorno"
                    tamano="pequeno"
                    disabled={paginaInscritos >= totalPaginasInscritos || cargandoInscritos}
                    onClick={() => {
                      const nueva = paginaInscritos + 1;
                      setPaginaInscritos(nueva);
                      void cargarInscritos(nueva);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Boton>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </TablaPasoTarjeta>
  );

  /* ------------------------------ Paso: Pagos ------------------------------ */
  const renderizarPagos = () => {
    const alDia = estadoPagos?.puedeInscribir;
    return (
      <TablaPasoTarjeta
        titulo="Estado de pagos"
        descripcion={`Conceptos correspondientes al período ${periodoActual}/${gestionActual}.`}
      >
        {cargando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : estadoPagos ? (
          <div className="space-y-6">
            {estadoInscripcionActual?.yaInscrito && (
              <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CircleCheck className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Inscripción registrada</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                    Este estudiante ya está inscrito en {estadoInscripcionActual.totalInscripciones}{' '}
                    materia{estadoInscripcionActual.totalInscripciones === 1 ? '' : 's'} de la gestión{' '}
                    {gestionActual}
                    {estadoInscripcionActual.grupos.length > 0 && (
                      <> · {descripcionGrupos(estadoInscripcionActual.grupos)}</>
                    )}
                    . No es necesario repetir el proceso.
                  </p>
                </div>
              </div>
            )}
            <div
              className={cn(
                'flex items-start gap-4 rounded-xl border p-5',
                alDia ? 'border-green-200 bg-green-50 dark:bg-green-900/30' : 'border-amber-200 bg-amber-50 dark:bg-amber-900/30',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-full',
                  alDia ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                )}
              >
                {alDia ? <CircleCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </span>
              <div>
                <p className={cn('font-semibold', alDia ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300')}>
                  {alDia ? 'Pagos al día' : 'Hay pagos pendientes'}
                </p>
                <p className={cn('text-sm', alDia ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300')}>
                  {alDia
                    ? 'El estudiante cumple con los requisitos de pago para inscribirse.'
                    : 'Al confirmar la inscripción estos pagos se registran automáticamente.'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Pagos realizados ({estadoPagos.pagosRealizados.length})
                </h4>
                {estadoPagos.pagosRealizados.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Sin pagos registrados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {estadoPagos.pagosRealizados.map((pago, indice) => (
                      <div
                        key={indice}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{pago.concepto}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(pago.fechaPago).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {formatearMoneda(pago.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Pendientes ({estadoPagos.pagosFaltantes.length})
                </h4>
                {estadoPagos.pagosFaltantes.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No hay pagos pendientes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {estadoPagos.pagosFaltantes.map((pago, indice) => (
                      <div
                        key={indice}
                        className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/30 p-3"
                      >
                        <p className="min-w-0 truncate text-sm font-medium text-red-800 dark:text-red-300">{pago.concepto}</p>
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300">{formatearMoneda(pago.monto)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <NavegacionPaso
              alVolver={() => setPaso('search')}
              alContinuar={() => {
                if (!estadoPagos.puedeInscribir) {
                  const continuar = window.confirm(
                    'El estudiante tiene ' +
                      estadoPagos.pagosFaltantes.length +
                      ' pago(s) pendiente(s). Al confirmar la inscripción se registrarán ' +
                      'automáticamente. ¿Desea continuar?',
                  );
                  if (!continuar) return;
                }
                setPaso('subjects');
              }}
              deshabilitado={!puedeAvanzarPagos}
              textoContinuar={
                estadoPagos?.puedeInscribir
                  ? 'Continuar'
                  : 'Continuar y registrar pagos'
              }
            />
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No se pudo obtener el estado de pagos.</p>
        )}
      </TablaPasoTarjeta>
    );
  };

  /* ----------------------------- Paso: Materias ---------------------------- */
  const renderizarMaterias = () => {
    const disponibles = materias.filter((materia) => !materia.prerrequisitoBloqueado);
    const bloqueadas = materias.filter((materia) => materia.prerrequisitoBloqueado);
    const semestres = Array.from(new Set(disponibles.map((materia) => materia.semestre))).sort((a, b) => a - b);

    return (
      <TablaPasoTarjeta
        titulo="Materias a cursar"
        descripcion={`Período ${periodoActual}/${gestionActual}. Desmarca las que no correspondan.`}
      >
        <div className="space-y-6">
          {estadoPagos?.esEstudianteNuevo && (
            <Aviso icono={Info} tono="info">
              <strong>Estudiante nuevo:</strong> se cargan las materias del primer semestre según su plan de estudio.
            </Aviso>
          )}

          {bloqueadas.length > 0 && (
            <Aviso icono={AlertTriangle} tono="advertencia">
              <strong>Bloqueadas por prerrequisito:</strong> {bloqueadas.map((m) => m.materiaNombre).join(', ')}.
            </Aviso>
          )}

          {disponibles.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay materias disponibles para inscribir en este período.
            </p>
          ) : (
            semestres.map((semestre) => (
              <div key={semestre}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Semestre {semestre}
                  </span>
                  <span className="h-px flex-1 bg-muted" />
                </div>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-border">
                  {disponibles
                    .filter((materia) => materia.semestre === semestre)
                    .map((materia) => {
                      const seleccionada = !!materiasSeleccionadas.find(
                        (materiaSeleccionada) => materiaSeleccionada.materiaId === materia.materiaId,
                      );
                      return (
                        <button
                          key={materia.materiaId}
                          type="button"
                          onClick={() => alternarMateria(materia)}
                          className={cn(
                            'flex w-full items-center gap-4 p-4 text-left transition-colors',
                            seleccionada ? 'bg-primary-50 dark:bg-primary-900/30/60' : 'bg-card hover:bg-muted/40',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                              seleccionada
                                ? 'border-primary-600 bg-primary-600 text-white'
                                : 'border-border bg-card text-transparent',
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{materia.materiaNombre}</span>
                              {materia.esReprobada && <Insignia variante="advertencia">Reprobada</Insignia>}
                            </span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">{materia.materiaCodigo}</span>
                            {materia.esReprobada && materia.notaAnteriorReprobada != null && (
                              <span className="text-xs text-red-500">
                                Nota anterior: {materia.notaAnteriorReprobada}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}

          <NavegacionPaso
            alVolver={() => setPaso('payments')}
            alContinuar={() => setPaso('groups')}
            deshabilitado={!puedeAvanzarMaterias}
            textoContinuar={`Continuar (${materiasSeleccionadas.length} materia${materiasSeleccionadas.length === 1 ? '' : 's'})`}
          />
        </div>
      </TablaPasoTarjeta>
    );
  };

  /* ------------------------------ Paso: Grupos ----------------------------- */
  const renderizarGrupos = () => (
    <TablaPasoTarjeta
      titulo="Asignar grupo"
      descripcion="Selecciona un grupo (paralelo y turno) por cada semestre a cursar."
    >
      <div className="space-y-6">
        {semestresSeleccionados.map((semestre) => {
          const gruposDelSemestre = grupos.filter((grupo) => grupo.semestre === semestre);
          const cantidadMaterias = materiasSeleccionadas.filter((materia) => materia.semestre === semestre).length;
          return (
            <div key={semestre}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Semestre {semestre}</span>
                <span className="text-xs text-muted-foreground">
                  · {cantidadMaterias} materia{cantidadMaterias === 1 ? '' : 's'}
                </span>
              </div>
              {gruposDelSemestre.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No hay grupos creados para el semestre {semestre}. Se crearán automáticamente al
                  continuar.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gruposDelSemestre.map((grupo) => {
                    const seleccionado = grupoPorSemestre[semestre] === grupo.id;

                    // Un grupo no se puede elegir si el estudiante ya está
                    // inscrito en otro grupo del mismo turno y semestre: las
                    // materias se imparten a la misma hora y se chocarían.
                    const yaInscritoEnEseTurno = gruposInscritosDelEstudiante.some(
                      (otro) =>
                        otro.turnoId === grupo.turnoId &&
                        otro.semestre === grupo.semestre &&
                        otro.id !== grupo.id,
                    );

                    // Tampoco si en otro semestre ya se eligió un grupo de su
                    // mismo turno.
                    const turnoYaElegido = Object.entries(grupoPorSemestre).some(
                      ([semestreElegido, grupoId]) =>
                        Number(semestreElegido) !== semestre &&
                        grupos.find((otro) => otro.id === grupoId)?.turnoId === grupo.turnoId,
                    );

                    const bloqueado = yaInscritoEnEseTurno || turnoYaElegido;

                    return (
                      <button
                        key={grupo.id}
                        type="button"
                        disabled={bloqueado && !seleccionado}
                        onClick={() =>
                          setGrupoPorSemestre((anteriores) => ({ ...anteriores, [semestre]: grupo.id }))
                        }
                        title={
                          bloqueado
                            ? yaInscritoEnEseTurno
                              ? 'Ya estás inscrito en un grupo de este turno y semestre'
                              : 'Ya elegiste un grupo de este turno en otro semestre'
                            : undefined
                        }
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all',
                          seleccionado
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-500'
                            : bloqueado
                              ? 'cursor-not-allowed border-border bg-muted/40 opacity-60'
                              : 'border-border bg-card hover:border-border hover:bg-muted/40',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-foreground">Paralelo {grupo.paralelo}</span>
                          <span className="block text-sm text-muted-foreground">
                            {grupo.turno?.nombre || 'Sin turno'}
                          </span>
                          <span className="block text-xs text-muted-foreground">Capacidad: {grupo.capacidad}</span>
                          {bloqueado && !seleccionado && (
                            <span className="mt-1 block text-xs font-medium text-amber-600 dark:text-amber-400">
                              {yaInscritoEnEseTurno
                                ? 'Ya inscrito en este turno'
                                : 'Turno ya elegido en otro semestre'}
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border',
                            seleccionado
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-border text-transparent',
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <NavegacionPaso
          alVolver={() => setPaso('subjects')}
          alContinuar={() => setPaso('confirm')}
          deshabilitado={!todosLosGruposSeleccionados}
        />
      </div>
    </TablaPasoTarjeta>
  );

  /* ---------------------------- Paso: Confirmar ---------------------------- */
  const renderizarConfirmacion = () => {
    const asignaciones = construirAsignaciones();
    return (
      <TablaPasoTarjeta
        titulo="Confirmar inscripción"
        descripcion="Revisa el resumen antes de registrar la inscripción."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <Dato etiqueta="Estudiante">
              {estudianteSeleccionado?.persona?.nombres} {estudianteSeleccionado?.persona?.apellidoPaterno}
            </Dato>
            <Dato etiqueta="Código">{estudianteSeleccionado?.codigoInscripcion}</Dato>
            <Dato etiqueta="Período">
              {periodoActual}/{gestionActual}
            </Dato>
            <Dato etiqueta="Materias">{materiasSeleccionadas.length}</Dato>
          </div>

          {asignaciones.map((asignacion) => {
            const grupo = grupos.find((grupoEncontrado) => grupoEncontrado.id === asignacion.grupoId);
            return (
              <div key={asignacion.grupoId} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="text-sm font-semibold text-foreground">Semestre {grupo?.semestre}</span>
                  <span className="text-sm text-muted-foreground">
                    Paralelo {grupo?.paralelo} · {grupo?.turno?.nombre || 'Sin turno'}
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {asignacion.materias.map((materia) => (
                    <li key={materia.materiaId} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                      <span className="text-foreground">{materia.materiaNombre}</span>
                      {materia.esReprobada && <Insignia variante="advertencia">Reprobada</Insignia>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <NavegacionPaso
            alVolver={() => setPaso('groups')}
            alContinuar={confirmarInscripcion}
            deshabilitado={cargando}
            textoContinuar="Registrar inscripción"
            iconoContinuar={CheckCircle2}
            cargando={cargando}
          />
        </div>
      </TablaPasoTarjeta>
    );
  };

  /* ------------------------------ Paso: Éxito ------------------------------ */
  const renderizarExito = () => (
    <TablaPasoTarjeta sinCuerpo>
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Inscripción registrada</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {resultadoInscripcion?.mensaje || `Inscripción completada para ${periodoActual}/${gestionActual}.`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {resultadoInscripcion?.inscripciones?.length > 0 && (
            <Insignia variante="primario">{resultadoInscripcion.inscripciones.length} inscripción(es)</Insignia>
          )}
          {resultadoInscripcion?.inscritosLibro > 0 && (
            <Insignia variante="exito">{resultadoInscripcion.inscritosLibro} en libro</Insignia>
          )}
          {resultadoInscripcion?.pagosRegistrados?.length > 0 && (
            <Insignia variante="exito">
              {resultadoInscripcion.pagosRegistrados.length} pago(s) registrado(s)
            </Insignia>
          )}
          {resultadoInscripcion?.boletaNumero && (
            <Insignia variante="contorno">Boleta {resultadoInscripcion.boletaNumero}</Insignia>
          )}
        </div>

        {resultadoInscripcion?.pagosRegistrados?.length > 0 && (
          <div className="mt-6 w-full max-w-md space-y-1 rounded-xl border border-border p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pagos registrados
            </p>
            {resultadoInscripcion.pagosRegistrados.map((pago: any, indice: number) => (
              <div key={indice} className="flex items-center justify-between gap-2 text-sm text-foreground">
                <span className="flex min-w-0 items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="truncate">{pago.concepto}</span>
                </span>
                <span className="shrink-0 font-medium">Bs {pago.monto.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {resultadoInscripcion?.inscripciones?.length > 0 && (
          <div className="mt-6 w-full max-w-md space-y-1 rounded-xl border border-border p-4 text-left">
            {resultadoInscripcion.inscripciones.map((elemento: any) => (
              <div key={elemento.id} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span className="truncate">{elemento.materiaNombre}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Boton variante="contorno" onClick={reiniciarFlujo}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Nueva inscripción
          </Boton>
          <Boton onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir comprobante
          </Boton>
        </div>
      </div>
    </TablaPasoTarjeta>
  );

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Preinscripción' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preinscripción semestral</h1>
          <p className="text-sm text-muted-foreground">Inscribe al estudiante en sus materias y grupo del período.</p>
        </div>
        <Insignia variante="primario" className="w-fit px-3 py-1 text-sm">
          Período {periodoActual} · {gestionActual}
        </Insignia>
      </div>

      {aviso()}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Panel lateral: pasos + perfil */}
        <aside className="lg:w-72 lg:shrink-0">
          <div className="space-y-4 lg:sticky lg:top-6">
            <Tarjeta variante="conBorde" className="rounded-2xl">
              <ContenidoTarjeta className="p-2.5">
                <ol className="space-y-1">
                  {PASOS.map((definicion, indice) => {
                    const completado = indice < indiceActual;
                    const activo = indice === indiceActual;
                    const alcanzable = indice <= indiceActual && !cargando;
                    const Icono = definicion.icono;
                    return (
                      <li key={definicion.id}>
                        <button
                          type="button"
                          disabled={!alcanzable}
                          onClick={() => irAPaso(definicion.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            activo && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                            completado && 'text-foreground hover:bg-muted/40',
                            !activo && !completado && 'text-muted-foreground',
                            alcanzable && !activo && !completado && 'text-muted-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-8 w-8 shrink-0 place-items-center rounded-full border',
                              completado && 'border-primary-600 bg-primary-600 text-white',
                              activo && 'border-primary-600 bg-card text-primary-600 dark:text-primary-400',
                              !activo && !completado && 'border-border bg-card text-muted-foreground',
                            )}
                          >
                            {completado ? <Check className="h-4 w-4" /> : <Icono className="h-4 w-4" />}
                          </span>
                          <span className={cn('font-medium', activo && 'font-semibold')}>{definicion.etiqueta}</span>
                          {activo && <ChevronRight className="ml-auto h-4 w-4" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </ContenidoTarjeta>
            </Tarjeta>

            {estudianteSeleccionado && (
              <Tarjeta variante="conBorde" className="rounded-2xl">
                <ContenidoTarjeta className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-100 dark:bg-primary-900/30 font-semibold text-primary-700 dark:text-primary-300">
                      {obtenerIniciales(
                        `${estudianteSeleccionado.persona?.nombres || ''} ${estudianteSeleccionado.persona?.apellidoPaterno || ''}`,
                      ) || '?'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {estudianteSeleccionado.persona?.nombres} {estudianteSeleccionado.persona?.apellidoPaterno}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        CI {estudianteSeleccionado.persona?.ci}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <School className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{estudianteSeleccionado.carrera?.nombre || 'Sin carrera'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      Ingreso {estudianteSeleccionado.gestionAdmision} · {estudianteSeleccionado.codigoInscripcion}
                    </p>
                  </div>
                </ContenidoTarjeta>
              </Tarjeta>
            )}
          </div>
        </aside>

        {/* Contenido del paso */}
        <section className="min-w-0 flex-1">
          {paso === 'search' && renderizarBusqueda()}
          {paso === 'payments' && renderizarPagos()}
          {paso === 'subjects' && renderizarMaterias()}
          {paso === 'groups' && renderizarGrupos()}
          {paso === 'confirm' && renderizarConfirmacion()}
          {paso === 'success' && renderizarExito()}
        </section>
      </div>
    </div>
  );
}

/* ----------------------------- Subcomponentes ----------------------------- */

function TablaPasoTarjeta({
  titulo,
  descripcion,
  children,
  sinCuerpo = false,
}: {
  titulo?: string;
  descripcion?: string;
  children: React.ReactNode;
  sinCuerpo?: boolean;
}) {
  return (
    <Tarjeta variante="conBorde" className="rounded-2xl">
      {titulo && (
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
        </div>
      )}
      <ContenidoTarjeta className={cn(sinCuerpo ? 'p-0' : 'space-y-6')}>{children}</ContenidoTarjeta>
    </Tarjeta>
  );
}

function NavegacionPaso({
  alVolver,
  alContinuar,
  deshabilitado,
  textoContinuar = 'Continuar',
  iconoContinuar: IconoContinuar,
  cargando = false,
  textoVolver = 'Volver',
}: {
  alVolver: () => void;
  alContinuar: () => void;
  deshabilitado?: boolean;
  textoContinuar?: string;
  iconoContinuar?: LucideIcon;
  cargando?: boolean;
  textoVolver?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-5">
      <Boton variante="contorno" onClick={alVolver} disabled={cargando}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        {textoVolver}
      </Boton>
      <Boton onClick={alContinuar} disabled={deshabilitado} cargando={cargando}>
        {IconoContinuar && !cargando && <IconoContinuar className="mr-2 h-4 w-4" />}
        {textoContinuar}
      </Boton>
    </div>
  );
}

function Aviso({
  icono: Icono,
  tono,
  children,
}: {
  icono: LucideIcon;
  tono: 'info' | 'advertencia';
  children: React.ReactNode;
}) {
  const tonos = {
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    advertencia: 'border-amber-200 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  };
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-sm', tonos[tono])}>
      <Icono className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="font-medium text-foreground">{children}</p>
    </div>
  );
}
