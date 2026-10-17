'use client';

import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Insignia } from '@/componentes/iu/insignia';
import { api } from '@/libreria/api';
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
  const [paso, setPaso] = useState<Paso>('search');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  const [estadoPagos, setEstadoPagos] = useState<EstadoPagos | null>(null);
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

  const buscarEstudiantes = async () => {
    if (!consultaBusqueda.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: consultaBusqueda, limite: 20 },
      });
      setEstudiantes(respuesta.data.datos || []);
      setBusquedaRealizada(true);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudo buscar estudiantes'));
      console.error('Error al buscar:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarEstudiante = async (estudiante: Estudiante) => {
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

      if (respuesta.data.puedeInscribir) {
        await calcularMaterias(estudiante);
      }
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
      setMateriasSeleccionadas(datos.materias?.filter((materia: any) => !materia.prerrequisitoBloqueado) || []);
      setGrupoPorSemestre({});

      await obtenerGrupos(estudiante);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudieron calcular las materias'));
      console.error('Error al calcular las materias:', error);
    }
  };

  const obtenerGrupos = async (estudiante: Estudiante) => {
    const carreraId = estudiante.carrera?.id;
    if (!carreraId) {
      setGrupos([]);
      return;
    }
    try {
      const respuesta = await api.get('/preinscripcion/grupos', {
        params: { carreraId, gestion: gestionActual },
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
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="text-sm text-red-800">{error}</div>
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Entrada
            className="pl-9"
            placeholder="Ej.: 12345678, Pérez o 2026-ADM-001"
            value={consultaBusqueda}
            onChange={(e) => setConsultaBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarEstudiantes()}
          />
        </div>
        <Boton onClick={buscarEstudiantes} cargando={cargando && !estudiantes.length}>
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Boton>
      </div>

      {cargando && !estudiantes.length && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      )}

      {!cargando && estudiantes.length > 0 && (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
          {estudiantes.map((estudiante) => (
            <button
              key={estudiante.id}
              type="button"
              onClick={() => seleccionarEstudiante(estudiante)}
              className="group flex w-full items-center gap-4 bg-white p-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-100 font-semibold text-primary-700">
                {obtenerIniciales(
                  `${estudiante.persona?.nombres || ''} ${estudiante.persona?.apellidoPaterno || ''}`,
                ) || '?'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">
                  {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno}{' '}
                  {estudiante.persona?.apellidoMaterno}
                </span>
                <span className="block truncate text-sm text-gray-500">
                  CI {estudiante.persona?.ci} · {estudiante.codigoInscripcion}
                </span>
                <span className="block truncate text-sm text-gray-400">{estudiante.carrera?.nombre}</span>
              </span>
              <Insignia variante={estudiante.gestionAdmision === gestionActual ? 'exito' : 'secundario'}>
                {estudiante.gestionAdmision === gestionActual ? 'Nuevo' : 'Antiguo'}
              </Insignia>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
            </button>
          ))}
        </div>
      )}

      {!cargando && busquedaRealizada && estudiantes.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <p className="font-medium text-gray-700">Sin resultados</p>
          <p className="text-sm text-gray-500">
            No se encontraron estudiantes para «{consultaBusqueda}».
          </p>
        </div>
      )}

      {!cargando && !busquedaRealizada && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-500">
            <GraduationCap className="h-6 w-6" />
          </div>
          <p className="font-medium text-gray-700">Comienza buscando un estudiante</p>
          <p className="max-w-sm text-sm text-gray-500">
            Ingresa el nombre, carnet de identidad o código de inscripción para iniciar la preinscripción.
          </p>
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
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : estadoPagos ? (
          <div className="space-y-6">
            <div
              className={cn(
                'flex items-start gap-4 rounded-xl border p-5',
                alDia ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-full',
                  alDia ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600',
                )}
              >
                {alDia ? <CircleCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </span>
              <div>
                <p className={cn('font-semibold', alDia ? 'text-green-800' : 'text-amber-800')}>
                  {alDia ? 'Pagos al día' : 'Hay pagos pendientes'}
                </p>
                <p className={cn('text-sm', alDia ? 'text-green-700' : 'text-amber-700')}>
                  {alDia
                    ? 'El estudiante cumple con los requisitos de pago para inscribirse.'
                    : 'Puedes continuar con la inscripción, pero se recomienda regularizar los pagos.'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Pagos realizados ({estadoPagos.pagosRealizados.length})
                </h4>
                {estadoPagos.pagosRealizados.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    Sin pagos registrados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {estadoPagos.pagosRealizados.map((pago, indice) => (
                      <div
                        key={indice}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">{pago.concepto}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(pago.fechaPago).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-700">
                          {formatearMoneda(pago.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Pendientes ({estadoPagos.pagosFaltantes.length})
                </h4>
                {estadoPagos.pagosFaltantes.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    No hay pagos pendientes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {estadoPagos.pagosFaltantes.map((pago, indice) => (
                      <div
                        key={indice}
                        className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
                      >
                        <p className="min-w-0 truncate text-sm font-medium text-red-800">{pago.concepto}</p>
                        <span className="text-sm font-semibold text-red-700">{formatearMoneda(pago.monto)}</span>
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
                    'El estudiante tiene pagos pendientes. ¿Desea continuar con la inscripción de todas formas?',
                  );
                  if (!continuar) return;
                }
                setPaso('subjects');
              }}
              deshabilitado={!puedeAvanzarPagos}
            />
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">No se pudo obtener el estado de pagos.</p>
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
            <p className="py-8 text-center text-sm text-gray-500">
              No hay materias disponibles para inscribir en este período.
            </p>
          ) : (
            semestres.map((semestre) => (
              <div key={semestre}>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Semestre {semestre}
                  </span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
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
                            seleccionada ? 'bg-primary-50/60' : 'bg-white hover:bg-gray-50',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                              seleccionada
                                ? 'border-primary-600 bg-primary-600 text-white'
                                : 'border-gray-300 bg-white text-transparent',
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-gray-900">{materia.materiaNombre}</span>
                              {materia.esReprobada && <Insignia variante="advertencia">Reprobada</Insignia>}
                            </span>
                            <span className="mt-0.5 block text-sm text-gray-500">{materia.materiaCodigo}</span>
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
                <span className="text-sm font-semibold text-gray-700">Semestre {semestre}</span>
                <span className="text-xs text-gray-500">
                  · {cantidadMaterias} materia{cantidadMaterias === 1 ? '' : 's'}
                </span>
              </div>
              {gruposDelSemestre.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  No hay grupos creados para el semestre {semestre}.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gruposDelSemestre.map((grupo) => {
                    const seleccionado = grupoPorSemestre[semestre] === grupo.id;
                    return (
                      <button
                        key={grupo.id}
                        type="button"
                        onClick={() =>
                          setGrupoPorSemestre((anteriores) => ({ ...anteriores, [semestre]: grupo.id }))
                        }
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all',
                          seleccionado
                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-gray-900">Paralelo {grupo.paralelo}</span>
                          <span className="block text-sm text-gray-500">
                            {grupo.turno?.nombre || 'Sin turno'}
                          </span>
                          <span className="block text-xs text-gray-400">Capacidad: {grupo.capacidad}</span>
                        </span>
                        <span
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border',
                            seleccionado
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-gray-300 text-transparent',
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
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
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
              <div key={asignacion.grupoId} className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                  <span className="text-sm font-semibold text-gray-700">Semestre {grupo?.semestre}</span>
                  <span className="text-sm text-gray-600">
                    Paralelo {grupo?.paralelo} · {grupo?.turno?.nombre || 'Sin turno'}
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {asignacion.materias.map((materia) => (
                    <li key={materia.materiaId} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-gray-800">{materia.materiaNombre}</span>
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
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Inscripción registrada</h2>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          {resultadoInscripcion?.mensaje || `Inscripción completada para ${periodoActual}/${gestionActual}.`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {resultadoInscripcion?.inscripciones?.length > 0 && (
            <Insignia variante="primario">{resultadoInscripcion.inscripciones.length} inscripción(es)</Insignia>
          )}
          {resultadoInscripcion?.inscritosLibro > 0 && (
            <Insignia variante="exito">{resultadoInscripcion.inscritosLibro} en libro</Insignia>
          )}
          {resultadoInscripcion?.boletaNumero && (
            <Insignia variante="contorno">Boleta {resultadoInscripcion.boletaNumero}</Insignia>
          )}
        </div>

        {resultadoInscripcion?.inscripciones?.length > 0 && (
          <div className="mt-6 w-full max-w-md space-y-1 rounded-xl border border-gray-200 p-4 text-left">
            {resultadoInscripcion.inscripciones.map((elemento: any) => (
              <div key={elemento.id} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
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
          <h1 className="text-2xl font-bold text-gray-900">Preinscripción semestral</h1>
          <p className="text-sm text-gray-500">Inscribe al estudiante en sus materias y grupo del período.</p>
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
                            activo && 'bg-primary-50 text-primary-700',
                            completado && 'text-gray-700 hover:bg-gray-50',
                            !activo && !completado && 'text-gray-400',
                            alcanzable && !activo && !completado && 'text-gray-500',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-8 w-8 shrink-0 place-items-center rounded-full border',
                              completado && 'border-primary-600 bg-primary-600 text-white',
                              activo && 'border-primary-600 bg-white text-primary-600',
                              !activo && !completado && 'border-gray-200 bg-white text-gray-400',
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
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-100 font-semibold text-primary-700">
                      {obtenerIniciales(
                        `${estudianteSeleccionado.persona?.nombres || ''} ${estudianteSeleccionado.persona?.apellidoPaterno || ''}`,
                      ) || '?'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {estudianteSeleccionado.persona?.nombres} {estudianteSeleccionado.persona?.apellidoPaterno}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        CI {estudianteSeleccionado.persona?.ci}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p className="flex items-center gap-2">
                      <School className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{estudianteSeleccionado.carrera?.nombre || 'Sin carrera'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
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
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-gray-500">{descripcion}</p>}
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
    <div className="flex items-center justify-between border-t border-gray-100 pt-5">
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
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    advertencia: 'border-amber-200 bg-amber-50 text-amber-800',
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
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="font-medium text-gray-800">{children}</p>
    </div>
  );
}
