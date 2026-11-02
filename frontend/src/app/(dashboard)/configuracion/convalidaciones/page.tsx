'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { CampoFiltro } from '@/componentes/iu/barra-filtros';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal } from '@/componentes/iu/modal';
import {
  Tabla,
  EncabezadoTabla,
  CuerpoTabla,
  FilaTabla,
  CeldaEncabezado,
  CeldaTabla,
} from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import {
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Save,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListChecks,
  ShieldCheck,
  Info,
  RefreshCw,
} from 'lucide-react';

type ResultadoEquivalencia = 'equivalente' | 'requiere_validacion' | 'sin_correspondencia';
type EstadoProceso = 'borrador' | 'aprobado' | 'archivado';

interface Carrera {
  id: number;
  nombre: string;
}

interface PlanEstudio {
  id: number;
  numeroRm: string;
  fechaRm: string;
  estado: string;
}

interface MateriaPlana {
  id: number;
  materiaId: number;
  codigo: string | null;
  nombre: string | null;
  semestre: number;
  horasSemanales: number;
  prerrequisitoId: number | null;
}

interface GrupoSemestre {
  semestre: number;
  materias: MateriaPlana[];
}

interface EquivalenciaPlana {
  id: number;
  materiaPlanOrigenId: number;
  materiaPlanDestinoId: number | null;
  resultado: ResultadoEquivalencia;
  observacion: string | null;
}

interface Proceso {
  id: number;
  carreraId: number;
  planOrigenId: number;
  planDestinoId: number;
  version: number;
  estado: EstadoProceso;
  numeroResolucion: string | null;
  fechaResolucion: string | null;
  notas: string | null;
  carrera?: { id: number; nombre: string };
  plan_origen?: PlanEstudio;
  plan_destino?: PlanEstudio;
}

interface Comparacion {
  proceso: Proceso;
  planOrigen: PlanEstudio;
  planDestino: PlanEstudio;
  origenPorSemestre: GrupoSemestre[];
  destinoPorSemestre: GrupoSemestre[];
  equivalencias: EquivalenciaPlana[];
  resumen: {
    totalOrigen: number;
    totalDestino: number;
    equivalentes: number;
    requierenValidacion: number;
    sinCorrespondencia: number;
    sinClasificar: number;
    nuevas: number;
  };
}

interface Fila {
  key: string;
  id: number | null;
  materiaPlanOrigenId: number;
  materiaPlanDestinoId: number | null;
  resultado: ResultadoEquivalencia | '';
  observacion: string;
}

const ETIQUETA_ESTADO: Record<EstadoProceso, string> = {
  borrador: 'Borrador',
  aprobado: 'Aprobada',
  archivado: 'Archivada',
};

const VARIANTE_ESTADO: Record<EstadoProceso, 'advertencia' | 'exito' | 'predeterminado'> = {
  borrador: 'advertencia',
  aprobado: 'exito',
  archivado: 'predeterminado',
};

const RESULTADO_LEGIBLE: Record<ResultadoEquivalencia, string> = {
  equivalente: 'Equivalente',
  requiere_validacion: 'Requiere validación',
  sin_correspondencia: 'Sin correspondencia',
};

const etiquetaMateria = (materia: MateriaPlana) =>
  `S${materia.semestre} · ${materia.codigo ?? ''} ${materia.nombre ?? ''}`.trim();

export default function PaginaConvalidaciones() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<number | ''>('');
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [cargandoProcesos, setCargandoProcesos] = useState(false);

  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [formNueva, setFormNueva] = useState<{
    planOrigenId: number | '';
    planDestinoId: number | '';
    notas: string;
  }>({ planOrigenId: '', planDestinoId: '', notas: '' });
  const [creando, setCreando] = useState(false);

  const [procesoId, setProcesoId] = useState<number | null>(null);
  const [comparacion, setComparacion] = useState<Comparacion | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [filas, setFilas] = useState<Fila[]>([]);
  const [guardandoKey, setGuardandoKey] = useState<string | null>(null);

  const [modalAprobar, setModalAprobar] = useState(false);
  const [formAprobar, setFormAprobar] = useState({ numeroResolucion: '', fechaResolucion: '' });
  const [aprobando, setAprobando] = useState(false);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // ---------------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const respuesta = await api.get('/carreras/activos');
        const lista = Array.isArray(respuesta.data) ? respuesta.data : respuesta.data?.datos ?? [];
        setCarreras(lista);
      } catch (e) {
        setError(mensajeDeError(e, 'No se pudieron cargar las carreras'));
      }
    })();
  }, []);

  const cargarProcesos = async (idCarrera: number) => {
    setCargandoProcesos(true);
    setError('');
    try {
      const respuesta = await api.get('/convalidaciones-planes', {
        params: { carreraId: idCarrera },
      });
      setProcesos(respuesta.data ?? []);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudieron cargar las matrices de convalidación'));
    } finally {
      setCargandoProcesos(false);
    }
  };

  const cargarPlanes = async (idCarrera: number) => {
    try {
      const respuesta = await api.get(`/planes-estudio/por-carrera/${idCarrera}`);
      setPlanes(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data?.datos ?? []);
    } catch {
      setPlanes([]);
    }
  };

  useEffect(() => {
    if (!carreraId) {
      setProcesos([]);
      return;
    }
    void cargarProcesos(Number(carreraId));
    void cargarPlanes(Number(carreraId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carreraId]);

  const cargarComparacion = async (id: number) => {
    setCargandoDetalle(true);
    setError('');
    try {
      const respuesta = await api.get(`/convalidaciones-planes/${id}`);
      setComparacion(respuesta.data);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo cargar la comparación de planes'));
    } finally {
      setCargandoDetalle(false);
    }
  };

  const abrirProceso = async (id: number) => {
    setProcesoId(id);
    setMensaje('');
    await cargarComparacion(id);
  };

  // Construye las filas editables a partir de la comparación.
  useEffect(() => {
    if (!comparacion) {
      setFilas([]);
      return;
    }
    const nuevas: Fila[] = [];
    for (const grupo of comparacion.origenPorSemestre) {
      for (const materia of grupo.materias) {
        const relaciones = comparacion.equivalencias.filter(
          (equivalencia) => equivalencia.materiaPlanOrigenId === materia.id,
        );
        if (relaciones.length === 0) {
          nuevas.push({
            key: `nueva-${materia.id}`,
            id: null,
            materiaPlanOrigenId: materia.id,
            materiaPlanDestinoId: null,
            resultado: '',
            observacion: '',
          });
        } else {
          for (const relacion of relaciones) {
            nuevas.push({
              key: `eq-${relacion.id}`,
              id: relacion.id,
              materiaPlanOrigenId: relacion.materiaPlanOrigenId,
              materiaPlanDestinoId: relacion.materiaPlanDestinoId,
              resultado: relacion.resultado,
              observacion: relacion.observacion ?? '',
            });
          }
        }
      }
    }
    setFilas(nuevas);
  }, [comparacion]);

  const semestrePorOrigen = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const grupo of comparacion?.origenPorSemestre ?? []) {
      for (const materia of grupo.materias) {
        mapa.set(materia.id, grupo.semestre);
      }
    }
    return mapa;
  }, [comparacion]);

  const materiaOrigenPorId = useMemo(() => {
    const mapa = new Map<number, MateriaPlana>();
    for (const grupo of comparacion?.origenPorSemestre ?? []) {
      for (const materia of grupo.materias) {
        mapa.set(materia.id, materia);
      }
    }
    return mapa;
  }, [comparacion]);

  const materiasDestino = useMemo(
    () => (comparacion?.destinoPorSemestre ?? []).flatMap((grupo) => grupo.materias),
    [comparacion],
  );

  /**
   * Materias de destino agrupadas por semestre.
   *
   * La equivalencia es entre materias del mismo semestre: una materia del
   * semestre 1 del plan de origen solo puede equivaler con una materia del
   * semestre 1 del plan de destino.
   */
  const destinoPorSemestre = useMemo(() => {
    const mapa = new Map<number, MateriaPlana[]>();
    for (const grupo of comparacion?.destinoPorSemestre ?? []) {
      mapa.set(grupo.semestre, grupo.materias);
    }
    return mapa;
  }, [comparacion]);

  /**
   * Opciones de materia de destino para una fila, según el semestre de su
   * materia de origen. Si el origen no tiene semestre conocido, se ofrecen
   * todas las materias del plan de destino.
   */
  const opcionesDestinoParaFila = (materiaPlanOrigenId: number) => {
    const semestre = semestrePorOrigen.get(materiaPlanOrigenId);
    const candidatas =
      semestre !== undefined
        ? (destinoPorSemestre.get(semestre) ?? [])
        : materiasDestino;

    return candidatas.map((materia) => ({
      value: materia.id,
      etiqueta: etiquetaMateria(materia),
    }));
  };

  const esEditable = comparacion?.proceso.estado === 'borrador';

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------

  const abrirModalNueva = () => {
    setError('');
    setFormNueva({ planOrigenId: '', planDestinoId: '', notas: '' });
    setModalNueva(true);
  };

  const crearProceso = async () => {
    if (!carreraId) {
      setError('Selecciona una carrera');
      return;
    }
    if (!formNueva.planOrigenId || !formNueva.planDestinoId) {
      setError('Selecciona el plan de origen y el plan de destino');
      return;
    }
    if (formNueva.planOrigenId === formNueva.planDestinoId) {
      setError('El plan de origen y el de destino deben ser distintos');
      return;
    }
    setCreando(true);
    setError('');
    try {
      const respuesta = await api.post('/convalidaciones-planes', {
        carreraId: Number(carreraId),
        planOrigenId: Number(formNueva.planOrigenId),
        planDestinoId: Number(formNueva.planDestinoId),
        notas: formNueva.notas.trim() || undefined,
      });
      setModalNueva(false);
      await cargarProcesos(Number(carreraId));
      await abrirProceso(respuesta.data.id);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo crear la matriz de convalidación'));
    } finally {
      setCreando(false);
    }
  };

  const actualizarFila = (key: string, cambios: Partial<Fila>) => {
    setFilas((previas) => previas.map((fila) => (fila.key === key ? { ...fila, ...cambios } : fila)));
  };

  const agregarRelacion = (materiaPlanOrigenId: number) => {
    setFilas((previas) => [
      ...previas,
      {
        key: `nueva-${materiaPlanOrigenId}-${Date.now()}`,
        id: null,
        materiaPlanOrigenId,
        materiaPlanDestinoId: null,
        resultado: 'equivalente',
        observacion: '',
      },
    ]);
  };

  const guardarFila = async (fila: Fila) => {
    if (!fila.resultado) {
      setError('Selecciona el resultado de la equivalencia');
      return;
    }
    if (fila.resultado !== 'sin_correspondencia' && !fila.materiaPlanDestinoId) {
      setError('Selecciona la materia de destino');
      return;
    }
    if (!procesoId) return;

    setGuardandoKey(fila.key);
    setError('');
    setMensaje('');
    try {
      const cuerpo: Record<string, unknown> = {
        materiaPlanOrigenId: fila.materiaPlanOrigenId,
        resultado: fila.resultado,
      };
      if (fila.resultado !== 'sin_correspondencia' && fila.materiaPlanDestinoId) {
        cuerpo.materiaPlanDestinoId = fila.materiaPlanDestinoId;
      }
      if (fila.observacion.trim()) {
        cuerpo.observacion = fila.observacion.trim();
      }

      if (fila.id) {
        await api.patch(`/convalidaciones-planes/${procesoId}/equivalencias/${fila.id}`, cuerpo);
      } else {
        await api.post(`/convalidaciones-planes/${procesoId}/equivalencias`, cuerpo);
      }
      setMensaje('Equivalencia guardada');
      await cargarComparacion(procesoId);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo guardar la equivalencia'));
    } finally {
      setGuardandoKey(null);
    }
  };

  const eliminarFila = async (fila: Fila) => {
    if (!fila.id) {
      setFilas((previas) => previas.filter((f) => f.key !== fila.key));
      return;
    }
    if (!procesoId) return;
    setGuardandoKey(fila.key);
    setError('');
    try {
      await api.delete(`/convalidaciones-planes/${procesoId}/equivalencias/${fila.id}`);
      await cargarComparacion(procesoId);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo eliminar la equivalencia'));
    } finally {
      setGuardandoKey(null);
    }
  };

  const aprobarProceso = async () => {
    if (!procesoId) return;
    setAprobando(true);
    setError('');
    try {
      await api.post(`/convalidaciones-planes/${procesoId}/aprobar`, {
        numeroResolucion: formAprobar.numeroResolucion.trim() || undefined,
        fechaResolucion: formAprobar.fechaResolucion || undefined,
      });
      setModalAprobar(false);
      setMensaje('Matriz aprobada');
      if (carreraId) await cargarProcesos(Number(carreraId));
      await cargarComparacion(procesoId);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo aprobar la matriz'));
    } finally {
      setAprobando(false);
    }
  };

  const crearNuevaVersion = async () => {
    if (!comparacion) return;
    setError('');
    try {
      const respuesta = await api.post('/convalidaciones-planes', {
        carreraId: comparacion.proceso.carreraId,
        planOrigenId: comparacion.proceso.planOrigenId,
        planDestinoId: comparacion.proceso.planDestinoId,
      });
      setMensaje(`Se creó la versión ${respuesta.data.version}`);
      if (carreraId) await cargarProcesos(Number(carreraId));
      await abrirProceso(respuesta.data.id);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo crear una nueva versión'));
    }
  };

  const volverALista = () => {
    setProcesoId(null);
    setComparacion(null);
    setFilas([]);
    setMensaje('');
    setError('');
  };

  // ---------------------------------------------------------------------------
  // Editor de matriz
  // ---------------------------------------------------------------------------

  const renderEditor = () => {
    if (!comparacion) return null;
    const { proceso, resumen, planOrigen, planDestino } = comparacion;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Boton variante="contorno" onClick={volverALista}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Boton>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {planOrigen?.numeroRm} → {planDestino?.numeroRm}
                </h2>
                <Insignia variante={VARIANTE_ESTADO[proceso.estado]}>
                  {ETIQUETA_ESTADO[proceso.estado]}
                </Insignia>
                <Insignia variante="contorno">Versión {proceso.version}</Insignia>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {proceso.carrera?.nombre ?? ''}
                {proceso.numeroResolucion ? ` · Resolución ${proceso.numeroResolucion}` : ''}
              </p>
            </div>
          </div>
          {proceso.estado === 'borrador' && (
            <Boton
              onClick={() => {
                setFormAprobar({ numeroResolucion: '', fechaResolucion: '' });
                setModalAprobar(true);
              }}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Revisar y aprobar
            </Boton>
          )}
          {proceso.estado === 'aprobado' && (
            <Boton variante="contorno" onClick={crearNuevaVersion}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Nueva versión
            </Boton>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Resumen
            valor={resumen.totalOrigen}
            etiqueta="Materias de origen"
            color="text-foreground"
            icono={<ListChecks className="w-5 h-5" />}
          />
          <Resumen
            valor={resumen.equivalentes}
            etiqueta="Equivalentes"
            color="text-green-600 dark:text-green-400"
            icono={<CheckCircle2 className="w-5 h-5" />}
          />
          <Resumen
            valor={resumen.requierenValidacion}
            etiqueta="Requieren validación"
            color="text-amber-600 dark:text-amber-400"
            icono={<AlertTriangle className="w-5 h-5" />}
          />
          <Resumen
            valor={resumen.sinCorrespondencia}
            etiqueta="Sin correspondencia"
            color="text-red-600 dark:text-red-400"
            icono={<XCircle className="w-5 h-5" />}
          />
          <Resumen
            valor={resumen.sinClasificar}
            etiqueta="Sin clasificar"
            color="text-muted-foreground"
            icono={<Info className="w-5 h-5" />}
          />
        </div>

        {!esEditable && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Esta matriz está {ETIQUETA_ESTADO[proceso.estado].toLowerCase()}. Para modificarla, crea
              una nueva versión. Las versiones aprobadas se conservan para trazabilidad.
            </span>
          </div>
        )}

        {comparacion.origenPorSemestre.map((grupo) => {
          const filasGrupo = filas.filter(
            (fila) => semestrePorOrigen.get(fila.materiaPlanOrigenId) === grupo.semestre,
          );
          return (
            <Tarjeta key={grupo.semestre} variante="conBorde">
              <EncabezadoTarjeta className="flex items-center justify-between">
                <TituloTarjeta>Semestre {grupo.semestre}</TituloTarjeta>
                <span className="text-sm text-muted-foreground">
                  {grupo.materias.length} materia(s) en el plan de origen
                </span>
              </EncabezadoTarjeta>
              <ContenidoTarjeta className="p-0">
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>Materia de origen</CeldaEncabezado>
                      <CeldaEncabezado>Materia de destino</CeldaEncabezado>
                      <CeldaEncabezado>Resultado</CeldaEncabezado>
                      <CeldaEncabezado>Observación</CeldaEncabezado>
                      <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {filasGrupo.map((fila) => {
                      const materiaOrigen = materiaOrigenPorId.get(fila.materiaPlanOrigenId);
                      const esNueva = fila.id === null;
                      return (
                        <FilaTabla key={fila.key}>
                          <CeldaTabla className="w-64">
                            <div className="font-medium text-foreground">
                              {materiaOrigen?.codigo} {materiaOrigen?.nombre}
                            </div>
                            {esNueva && !fila.resultado && (
                              <span className="text-xs text-muted-foreground">Sin clasificar</span>
                            )}
                          </CeldaTabla>
                          <CeldaTabla className="w-72">
                            <Selector
                              opciones={[
                                { value: '', etiqueta: '— Sin destino —' },
                                ...opcionesDestinoParaFila(fila.materiaPlanOrigenId),
                              ]}
                              value={fila.materiaPlanDestinoId ?? ''}
                              disabled={!esEditable || fila.resultado === 'sin_correspondencia'}
                              onChange={(e) => {
                                const valor = e.target.value ? Number(e.target.value) : null;
                                actualizarFila(fila.key, {
                                  materiaPlanDestinoId: valor,
                                  resultado: valor && !fila.resultado ? 'equivalente' : fila.resultado,
                                });
                              }}
                            />
                          </CeldaTabla>
                          <CeldaTabla className="w-52">
                            <Selector
                              opciones={[
                                { value: '', etiqueta: '— Seleccionar —' },
                                { value: 'equivalente', etiqueta: 'Equivalente' },
                                { value: 'requiere_validacion', etiqueta: 'Requiere validación' },
                                { value: 'sin_correspondencia', etiqueta: 'Sin correspondencia' },
                              ]}
                              value={fila.resultado}
                              disabled={!esEditable}
                              onChange={(e) => {
                                const valor = e.target.value as ResultadoEquivalencia | '';
                                actualizarFila(fila.key, {
                                  resultado: valor,
                                  materiaPlanDestinoId:
                                    valor === 'sin_correspondencia'
                                      ? null
                                      : fila.materiaPlanDestinoId,
                                });
                              }}
                            />
                          </CeldaTabla>
                          <CeldaTabla>
                            <Entrada
                              value={fila.observacion}
                              disabled={!esEditable}
                              placeholder="Observación (opcional)"
                              onChange={(e) => actualizarFila(fila.key, { observacion: e.target.value })}
                            />
                          </CeldaTabla>
                          <CeldaTabla className="text-right">
                            {esEditable ? (
                              <div className="flex items-center justify-end gap-1">
                                <Boton
                                  variante="fantasma"
                                  onClick={() => agregarRelacion(fila.materiaPlanOrigenId)}
                                  title="Agregar otra materia de destino"
                                >
                                  <Plus className="w-4 h-4" />
                                </Boton>
                                <Boton
                                  variante="fantasma"
                                  onClick={() => guardarFila(fila)}
                                  disabled={guardandoKey === fila.key}
                                  title="Guardar"
                                >
                                  {guardandoKey === fila.key ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </Boton>
                                <Boton
                                  variante="fantasma"
                                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300"
                                  onClick={() => eliminarFila(fila)}
                                  disabled={guardandoKey === fila.key}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Boton>
                              </div>
                            ) : (
                              <Insignia
                                variante={
                                  fila.resultado === 'equivalente'
                                    ? 'exito'
                                    : fila.resultado === 'requiere_validacion'
                                      ? 'advertencia'
                                      : 'contorno'
                                }
                              >
                                {fila.resultado ? nombreResultado(fila.resultado) : 'Sin clasificar'}
                              </Insignia>
                            )}
                          </CeldaTabla>
                        </FilaTabla>
                      );
                    })}
                  </CuerpoTabla>
                </Tabla>
              </ContenidoTarjeta>
            </Tarjeta>
          );
        })}

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta className="flex items-center justify-between">
            <div>
              <TituloTarjeta>Materias del plan de destino</TituloTarjeta>
              <DescripcionTarjeta>
                Las materias sin equivalencia son nuevas y deben cursarse.
              </DescripcionTarjeta>
            </div>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="p-0">
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Semestre</CeldaEncabezado>
                  <CeldaEncabezado>Materia</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {materiasDestino.map((materia) => {
                  const referenciada = (comparacion.equivalencias ?? []).some(
                    (equivalencia) => equivalencia.materiaPlanDestinoId === materia.id,
                  );
                  return (
                    <FilaTabla key={materia.id}>
                      <CeldaTabla>{materia.semestre}</CeldaTabla>
                      <CeldaTabla className="font-medium text-foreground">
                        {materia.codigo} {materia.nombre}
                      </CeldaTabla>
                      <CeldaTabla>
                        {referenciada ? (
                          <Insignia variante="exito">Con equivalencia</Insignia>
                        ) : (
                          <Insignia variante="contorno">Nueva · debe cursarse</Insignia>
                        )}
                      </CeldaTabla>
                    </FilaTabla>
                  );
                })}
              </CuerpoTabla>
            </Tabla>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Lista de matrices
  // ---------------------------------------------------------------------------

  const renderLista = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <ContenidoTarjeta>
          <div className="flex flex-wrap items-end gap-4">
            <CampoFiltro
              etiqueta="Carrera"
              value={carreraId}
              onChange={(valor) => setCarreraId(valor ? Number(valor) : '')}
              placeholder="Seleccionar carrera"
              className="w-80"
              opciones={carreras.map((carrera) => ({
                value: carrera.id,
                etiqueta: carrera.nombre,
              }))}
            />
            <Boton onClick={abrirModalNueva} disabled={!carreraId}>
              <GitCompare className="w-4 h-4 mr-2" />
              Nueva comparación de planes
            </Boton>
          </div>
          {carreraId && planes.length < 2 && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Esta carrera tiene {planes.length} plan(es) registrado(s). Necesitas al menos dos planes
              RM para comparar.
            </p>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta className="flex items-center justify-between">
          <div>
            <TituloTarjeta>Matrices de convalidación</TituloTarjeta>
            <DescripcionTarjeta>
              Equivalencias generales entre planes de la carrera, con su versión y estado.
            </DescripcionTarjeta>
          </div>
          <Boton
            variante="fantasma"
            onClick={() => carreraId && cargarProcesos(Number(carreraId))}
            disabled={!carreraId}
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </Boton>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="p-0">
          {cargandoProcesos ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando…
            </div>
          ) : !carreraId ? (
            <div className="py-12 text-center text-muted-foreground">
              Selecciona una carrera para ver sus matrices.
            </div>
          ) : procesos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aún no hay matrices de convalidación para esta carrera.
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Plan de origen</CeldaEncabezado>
                  <CeldaEncabezado>Plan de destino</CeldaEncabezado>
                  <CeldaEncabezado>Versión</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado>Resolución</CeldaEncabezado>
                  <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {procesos.map((proceso) => (
                  <FilaTabla key={proceso.id}>
                    <CeldaTabla className="font-medium text-foreground">
                      {proceso.plan_origen?.numeroRm ?? `Plan ${proceso.planOrigenId}`}
                    </CeldaTabla>
                    <CeldaTabla className="font-medium text-foreground">
                      {proceso.plan_destino?.numeroRm ?? `Plan ${proceso.planDestinoId}`}
                    </CeldaTabla>
                    <CeldaTabla>{proceso.version}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variante={VARIANTE_ESTADO[proceso.estado]}>
                        {ETIQUETA_ESTADO[proceso.estado]}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla className="text-muted-foreground">
                      {proceso.numeroResolucion ?? '—'}
                    </CeldaTabla>
                    <CeldaTabla className="text-right">
                      <Boton variante="contorno" onClick={() => abrirProceso(proceso.id)}>
                        Abrir
                      </Boton>
                    </CeldaTabla>
                  </FilaTabla>
                ))}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Panel', href: '/panel' },
          { etiqueta: 'Convalidaciones entre planes RM' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Convalidaciones entre planes RM</h1>
        <p className="text-muted-foreground mt-1">
          Define la matriz general de equivalencias entre las asignaturas de dos planes de estudio de
          una misma carrera. La matriz se aprueba con su versión y luego se aplica a los estudiantes
          que migran de plan; sus notas e historial originales se conservan intactos.
        </p>
      </div>

      {procesoId ? (
        cargandoDetalle && !comparacion ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Cargando comparación…
          </div>
        ) : (
          renderEditor()
        )
      ) : (
        renderLista()
      )}

      <Modal
        abierto={modalNueva}
        alCerrar={() => setModalNueva(false)}
        titulo="Nueva comparación de planes"
        descripcion="Selecciona el plan de origen (ingreso) y el plan de destino (nuevo)."
      >
        <div className="space-y-4">
          <Selector
            etiqueta="Plan de origen"
            opciones={[
              { value: '', etiqueta: '— Seleccionar plan —' },
              ...planes.map((plan) => ({
                value: plan.id,
                etiqueta: `${plan.numeroRm} (${plan.estado})`,
              })),
            ]}
            value={formNueva.planOrigenId}
            onChange={(e) =>
              setFormNueva((actual) => ({
                ...actual,
                planOrigenId: e.target.value ? Number(e.target.value) : '',
              }))
            }
          />
          <Selector
            etiqueta="Plan de destino"
            opciones={[
              { value: '', etiqueta: '— Seleccionar plan —' },
              ...planes.map((plan) => ({
                value: plan.id,
                etiqueta: `${plan.numeroRm} (${plan.estado})`,
              })),
            ]}
            value={formNueva.planDestinoId}
            onChange={(e) =>
              setFormNueva((actual) => ({
                ...actual,
                planDestinoId: e.target.value ? Number(e.target.value) : '',
              }))
            }
          />
          <Entrada
            etiqueta="Notas (opcional)"
            value={formNueva.notas}
            onChange={(e) => setFormNueva((actual) => ({ ...actual, notas: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Boton variante="contorno" onClick={() => setModalNueva(false)}>
              Cancelar
            </Boton>
            <Boton onClick={crearProceso} disabled={creando}>
              {creando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear matriz
            </Boton>
          </div>
        </div>
      </Modal>

      <Modal
        abierto={modalAprobar}
        alCerrar={() => setModalAprobar(false)}
        titulo="Aprobar matriz de convalidación"
        descripcion="Al aprobar, la matriz queda como versión oficial y no podrá editarse sin crear una nueva versión."
      >
        <div className="space-y-4">
          <Entrada
            etiqueta="Número de resolución (opcional)"
            value={formAprobar.numeroResolucion}
            onChange={(e) =>
              setFormAprobar((actual) => ({ ...actual, numeroResolucion: e.target.value }))
            }
          />
          <Entrada
            etiqueta="Fecha de resolución (opcional)"
            type="date"
            value={formAprobar.fechaResolucion}
            onChange={(e) =>
              setFormAprobar((actual) => ({ ...actual, fechaResolucion: e.target.value }))
            }
          />
          <div className="flex justify-end gap-3 pt-2">
            <Boton variante="contorno" onClick={() => setModalAprobar(false)}>
              Cancelar
            </Boton>
            <Boton onClick={aprobarProceso} disabled={aprobando}>
              {aprobando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Aprobar matriz
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Resumen({
  valor,
  etiqueta,
  color,
  icono,
}: {
  valor: number;
  etiqueta: string;
  color: string;
  icono: ReactNode;
}) {
  return (
    <Tarjeta variante="conBorde">
      <ContenidoTarjeta>
        <div className={`flex items-center gap-2 ${color}`}>{icono}</div>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{valor}</p>
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
      </ContenidoTarjeta>
    </Tarjeta>
  );
}

function nombreResultado(resultado: ResultadoEquivalencia): string {
  switch (resultado) {
    case 'equivalente':
      return 'Equivalente';
    case 'requiere_validacion':
      return 'Requiere validación';
    case 'sin_correspondencia':
      return 'Sin correspondencia';
    default:
      return 'Sin clasificar';
  }
}
