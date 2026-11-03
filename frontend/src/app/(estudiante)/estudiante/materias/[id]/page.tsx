'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import { api } from '@/libreria/api';
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Loader2,
  User,
} from 'lucide-react';
import type { DetalleMateriaEstudiante } from '@/tipos/portal-estudiante';

const ETIQUETAS_REGISTRO: Record<string, string> = {
  sin_registrar: 'Sin registrar',
  registrado: 'Registrado',
  ausente: 'Ausente',
  justificado: 'Justificado',
};

const ETIQUETAS_OBSERVACION: Record<string, string> = {
  aprobo: 'Aprobó',
  reprobo: 'Reprobó',
  no_se_presento: 'No se presentó',
  puede_ir_2t: 'Puede ir a 2.º turno',
  pendiente: 'Pendiente',
};

const ETIQUETAS_ESTADO_2T: Record<string, string> = {
  no_corresponde: 'No corresponde',
  habilitado: 'Habilitado',
  calificado: 'Calificado',
  ausente: 'Ausente',
  justificado: 'Justificado',
};

const ETIQUETAS_LIBRO: Record<string, string> = {
  sin_iniciar: 'Sin iniciar',
  borrador: 'Sin iniciar',
  en_registro: 'En registro',
  pendiente_revision: 'Pendiente de revisión',
  cerrado: 'Cerrado',
  reabierto: 'Reabierto',
};

const textoNota = (nota: number | null, estado: string) => {
  if (nota != null) return String(nota);
  return ETIQUETAS_REGISTRO[estado] || '—';
};

const varianteObservacion = (observacion: string | null) => {
  if (observacion === 'aprobo') return 'exito' as const;
  if (observacion === 'reprobo') return 'error' as const;
  if (observacion === 'no_se_presento') return 'advertencia' as const;
  if (observacion === 'puede_ir_2t') return 'advertencia' as const;
  return 'contorno' as const;
};

export default function PaginaMateriaEstudiante() {
  const router = useRouter();
  const parametros = useParams();
  const materiaImpartidaId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [materia, setMateria] = useState<DetalleMateriaEstudiante | null>(null);

  useEffect(() => {
    let activo = true;

    api
      .get(`/estudiante/materias/${materiaImpartidaId}`)
      .then((respuesta) => {
        if (!activo) return;
        setMateria(respuesta.data);
        setError(false);
      })
      .catch(() => {
        if (activo) setError(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [materiaImpartidaId]);

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !materia) {
    return (
      <div className="space-y-6">
        <Migas
          elementos={[
            { etiqueta: 'Mis Materias', href: '/estudiante/materias' },
            { etiqueta: 'No disponible' },
          ]}
        />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300">
          No se encontró la materia o no estás inscrito en ella.
        </div>
        <Boton
          variante="contorno"
          onClick={() => router.push('/estudiante/materias')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis materias
        </Boton>
      </div>
    );
  }

  const calificacion = materia.calificacion;
  const grupo = materia.grupo;
  const libroCerrado = materia.libroEstado === 'cerrado';

  const notas = [
    {
      etiqueta: 'Primer parcial',
      valor: calificacion
        ? textoNota(calificacion.parcial1, calificacion.parcial1Estado)
        : '—',
      detalle: calificacion
        ? ETIQUETAS_REGISTRO[calificacion.parcial1Estado] ||
          calificacion.parcial1Estado
        : 'Sin registrar',
    },
    {
      etiqueta: 'Segundo parcial',
      valor: calificacion
        ? textoNota(calificacion.parcial2, calificacion.parcial2Estado)
        : '—',
      detalle: calificacion
        ? ETIQUETAS_REGISTRO[calificacion.parcial2Estado] ||
          calificacion.parcial2Estado
        : 'Sin registrar',
    },
    {
      etiqueta: 'Promedio',
      valor:
        calificacion?.promedioFinal != null
          ? String(calificacion.promedioFinal)
          : '—',
      detalle: 'Promedio semestral',
    },
    {
      etiqueta: '2.º turno',
      valor:
        calificacion?.notaSegundaTurno != null
          ? String(calificacion.notaSegundaTurno)
          : '—',
      detalle: calificacion
        ? ETIQUETAS_ESTADO_2T[calificacion.estado2T] || calificacion.estado2T
        : 'No corresponde',
    },
    {
      etiqueta: 'Nota definitiva',
      valor:
        calificacion?.notaDefinitiva != null
          ? String(calificacion.notaDefinitiva)
          : '—',
      detalle: calificacion?.estadoDefinitivo
        ? calificacion.estadoDefinitivo === 'aprobado'
          ? 'Aprobado'
          : calificacion.estadoDefinitivo === 'reprobado'
            ? 'Reprobado'
            : 'Pendiente'
        : 'Pendiente',
    },
  ];

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Mis Materias', href: '/estudiante/materias' },
          { etiqueta: materia.materia?.nombre || 'Materia' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {materia.materia?.nombre}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {materia.materia?.codigo} · {grupo?.codigo} ·{' '}
            {grupo?.carrera?.nombre} · {grupo?.turno?.nombre}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {grupo?.semestre}.º semestre ·{' '}
            {grupo?.periodo
              ? `${grupo.periodo.nombre || 'Periodo'} · Gestión ${grupo.periodo.gestion ?? '—'}`
              : `Gestión ${materia.gestion}`}
          </p>
        </div>
        <Boton
          variante="contorno"
          onClick={() => router.push('/estudiante/materias')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Boton>
      </div>

      {!calificacion && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-300">
          Tu docente todavía no registró notas en esta materia.
        </div>
      )}

      {libroCerrado && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/30 dark:text-green-300">
          El libro de calificaciones de esta materia está cerrado. Las notas
          mostradas son las definitivas.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {notas.map((nota) => (
          <Tarjeta key={nota.etiqueta} variante="conBorde">
            <ContenidoTarjeta className="px-4 py-3">
              <p className="truncate text-xs font-medium text-muted-foreground">
                {nota.etiqueta}
              </p>
              <p className="text-2xl font-bold leading-tight text-foreground">
                {nota.valor}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {nota.detalle}
              </p>
            </ContenidoTarjeta>
          </Tarjeta>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Estado de la materia</TituloTarjeta>
            <DescripcionTarjeta>
              Información registrada por el docente
            </DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Observación
                </dt>
                <dd className="mt-1">
                  <Insignia
                    variante={varianteObservacion(
                      calificacion?.observacion || 'pendiente',
                    )}
                  >
                    {ETIQUETAS_OBSERVACION[
                      calificacion?.observacion || 'pendiente'
                    ] || 'Pendiente'}
                  </Insignia>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Libro de calificaciones
                </dt>
                <dd className="mt-1">
                  <Insignia variante={libroCerrado ? 'exito' : 'contorno'}>
                    {ETIQUETAS_LIBRO[materia.libroEstado] ||
                      materia.libroEstado}
                  </Insignia>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Inscripción
                </dt>
                <dd className="mt-1 text-sm text-foreground capitalize">
                  {materia.estadoInscripcion}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gestión
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {materia.gestion || '—'}
                </dd>
              </div>
            </dl>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos de la materia</TituloTarjeta>
            <DescripcionTarjeta>
              Docente, grupo y carga horaria
            </DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Docente
                  </p>
                  <p className="text-sm text-foreground">
                    {materia.docente?.nombre || 'Sin docente asignado'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Grupo
                  </p>
                  <p className="text-sm text-foreground">
                    {grupo?.codigo || '—'} · {grupo?.semestre}.º semestre ·{' '}
                    {grupo?.paralelo}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Carga horaria
                  </p>
                  <p className="text-sm text-foreground">
                    {materia.horasSemanales != null
                      ? `${materia.horasSemanales} horas semanales`
                      : '—'}
                  </p>
                </div>
              </li>
            </ul>
            {calificacion?.observacion && (
              <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                Observación registrada: {calificacion.observacion}
              </p>
            )}
          </ContenidoTarjeta>
        </Tarjeta>
      </div>

      <p className="text-xs text-muted-foreground">
        Las notas son registradas únicamente por tus docentes. Si observas un
        error, comunícate con el área académica.
      </p>
    </div>
  );
}
