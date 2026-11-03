'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Loader2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Migas } from '@/componentes/iu/migas';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import {
  ContenidoTarjeta,
  EncabezadoTarjeta,
  Tarjeta,
  TituloTarjeta,
} from '@/componentes/iu/tarjeta';
import { api } from '@/libreria/api';
import type {
  EstadoMateriaMalla,
  MallaEstudiante,
} from '@/tipos/portal-estudiante';

type ConfiguracionEstado = {
  etiqueta: string;
  variante: 'exito' | 'primario' | 'error' | 'contorno';
  icono: LucideIcon;
  color: string;
};

const estados: Record<EstadoMateriaMalla, ConfiguracionEstado> = {
  aprobada: {
    etiqueta: 'Aprobada',
    variante: 'exito',
    icono: CheckCircle2,
    color: 'text-green-700 dark:text-green-300',
  },
  cursando: {
    etiqueta: 'Cursando',
    variante: 'primario',
    icono: Clock,
    color: 'text-primary-700 dark:text-primary-300',
  },
  reprobada: {
    etiqueta: 'Reprobada',
    variante: 'error',
    icono: XCircle,
    color: 'text-red-700 dark:text-red-300',
  },
  pendiente: {
    etiqueta: 'Pendiente',
    variante: 'contorno',
    icono: Circle,
    color: 'text-gray-500 dark:text-gray-400',
  },
};

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return '';
  return `${dia}/${mes}/${anio}`;
};

const nombreCompleto = (malla: MallaEstudiante | null) => {
  if (!malla) return '';
  const { nombres, apellidoPaterno, apellidoMaterno } = malla.estudiante;
  return [nombres, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(' ');
};

export default function PaginaMallaEstudiante() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [malla, setMalla] = useState<MallaEstudiante | null>(null);

  const cargarMalla = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await api.get<MallaEstudiante>('/estudiante/malla');
      setMalla(respuesta.data);
    } catch (errorCarga) {
      console.error('Error al cargar la malla curricular:', errorCarga);
      setError(
        'No se pudo cargar tu malla curricular. Intenta nuevamente en unos momentos.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMalla();
  }, [cargarMalla]);

  const plan = malla?.plan;
  const resumen = malla?.resumen;

  const tarjetas = [
    {
      titulo: 'Aprobadas',
      valor: resumen?.aprobadas ?? 0,
      detalle: 'Materias completadas',
      icono: CheckCircle2,
      colorFondo: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      titulo: 'Cursando',
      valor: resumen?.cursando ?? 0,
      detalle: 'Materias en curso',
      icono: BookOpen,
      colorFondo: 'bg-primary-100 dark:bg-primary-900/30',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      titulo: 'Pendientes',
      valor: resumen?.pendientes ?? 0,
      detalle: 'Aún no inscritas',
      icono: Circle,
      colorFondo: 'bg-gray-100 dark:bg-gray-800',
      color: 'text-gray-600 dark:text-gray-400',
    },
    {
      titulo: 'Reprobadas',
      valor: resumen?.reprobadas ?? 0,
      detalle: 'Requieren repetirse',
      icono: XCircle,
      colorFondo: 'bg-red-100 dark:bg-red-900/30',
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Mi Malla Curricular' }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Mi Malla Curricular
        </h1>
        <p className="text-muted-foreground mt-1">
          Materias de tu plan de estudio y tu avance académico.
        </p>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      ) : error ? (
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Boton variante="contorno" onClick={cargarMalla}>
                Reintentar
              </Boton>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      ) : !malla || malla.semestres.length === 0 ? (
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta>
            <p className="py-10 text-center text-sm text-muted-foreground">
              Tu plan de estudio todavía no tiene materias registradas.
            </p>
          </ContenidoTarjeta>
        </Tarjeta>
      ) : (
        <>
          <Tarjeta variante="conBorde">
            <ContenidoTarjeta>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <p className="text-sm font-semibold text-foreground">
                      {plan?.carrera?.nombre ||
                        malla.estudiante.carrera?.nombre ||
                        'Carrera'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Plan {plan?.numeroRm || 'sin número de RM'}
                    {plan?.estado
                      ? ` · ${plan.estado === 'vigente' ? 'Vigente' : 'Histórico'}`
                      : ''}
                  </p>
                  {plan?.fechaRm ? (
                    <p className="text-xs text-muted-foreground">
                      Aprobado por RM del {formatearFecha(plan.fechaRm)}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {nombreCompleto(malla)} · {malla.estudiante.codigoInscripcion}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-3xl font-bold text-foreground">
                    {resumen?.porcentajeAvance ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avance de la malla
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${resumen?.porcentajeAvance ?? 0}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {resumen?.aprobadas ?? 0} de {resumen?.totalMaterias ?? 0}{' '}
                materias aprobadas
              </p>
            </ContenidoTarjeta>
          </Tarjeta>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tarjetas.map((tarjeta) => (
              <Tarjeta key={tarjeta.titulo} variante="conBorde">
                <ContenidoTarjeta className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {tarjeta.titulo}
                      </p>
                      <p className="text-xl font-bold leading-tight text-foreground">
                        {tarjeta.valor}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tarjeta.detalle}
                      </p>
                    </div>
                    <div
                      className={`shrink-0 rounded-lg p-2 ${tarjeta.colorFondo}`}
                    >
                      <tarjeta.icono className={`h-5 w-5 ${tarjeta.color}`} />
                    </div>
                  </div>
                </ContenidoTarjeta>
              </Tarjeta>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {malla.semestres.map((semestre) => {
              const esActual =
                semestre.semestre === malla.resumen.semestreActual;

              return (
                <Tarjeta
                  key={semestre.semestre}
                  variante="conBorde"
                  className={
                    esActual
                      ? 'border-primary/50 ring-1 ring-primary/20'
                      : undefined
                  }
                >
                  <EncabezadoTarjeta>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <TituloTarjeta>
                          {semestre.semestre}.º semestre
                        </TituloTarjeta>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {semestre.materias.length} materia(s)
                        </p>
                      </div>
                      {esActual ? (
                        <Insignia variante="primario">
                          Semestre actual
                        </Insignia>
                      ) : null}
                    </div>
                  </EncabezadoTarjeta>

                  <ContenidoTarjeta className="divide-y divide-border p-0">
                    {semestre.materias.map((materia) => {
                      const configuracion = estados[materia.estado];
                      const Icono = configuracion.icono;

                      return (
                        <div
                          key={materia.id}
                          className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                            materia.estado === 'pendiente' ? 'opacity-80' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="text-xs font-semibold text-muted-foreground">
                                {materia.codigo}
                              </span>
                              <p className="text-sm font-medium text-foreground">
                                {materia.nombre}
                              </p>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>{materia.horasSemanales} h/semana</span>
                              {materia.prerrequisito ? (
                                <span>
                                  Prerrequisito:{' '}
                                  {materia.prerrequisito.codigo} —{' '}
                                  {materia.prerrequisito.nombre}
                                </span>
                              ) : null}
                              {materia.gestion ? (
                                <span>Gestión {materia.gestion}</span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                            {materia.notaFinal != null ? (
                              <span className="text-sm font-semibold text-foreground">
                                Nota: {materia.notaFinal}
                              </span>
                            ) : null}
                            <Insignia variante={configuracion.variante}>
                              <Icono
                                className={`mr-1 h-3 w-3 ${configuracion.color}`}
                              />
                              {configuracion.etiqueta}
                            </Insignia>
                          </div>
                        </div>
                      );
                    })}
                  </ContenidoTarjeta>
                </Tarjeta>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
