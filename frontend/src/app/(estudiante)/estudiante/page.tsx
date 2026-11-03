'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import {
  Tabla,
  EncabezadoTabla,
  CuerpoTabla,
  FilaTabla,
  CeldaEncabezado,
  CeldaTabla,
} from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { BookOpen, ClipboardList, Loader2, TrendingUp } from 'lucide-react';
import type {
  MateriaEstudiante,
  ResumenEstudiante,
} from '@/tipos/portal-estudiante';

const nombreCompleto = (resumen: ResumenEstudiante | null) => {
  if (!resumen) return '';
  const { nombres, apellidoPaterno, apellidoMaterno } = resumen.estudiante;
  return [nombres, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(' ');
};

const textoNota = (materia: MateriaEstudiante) => {
  const nota = materia.calificacion?.notaDefinitiva;
  return nota != null ? String(nota) : '—';
};

export default function PaginaPanelEstudiante() {
  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState<ResumenEstudiante | null>(null);
  const [materias, setMaterias] = useState<MateriaEstudiante[]>([]);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [resumenResp, materiasResp] = await Promise.all([
          api.get('/estudiante/resumen'),
          api.get('/estudiante/materias'),
        ]);
        if (!activo) return;
        setResumen(resumenResp.data);
        setMaterias(materiasResp.data || []);
      } catch (error) {
        console.error('Error al cargar el panel del estudiante:', error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const tarjetas = [
    {
      titulo: 'Materias en curso',
      valor: resumen?.materiasEnCurso ?? 0,
      detalle: 'Inscritas este periodo',
      icono: BookOpen,
      colorFondo: 'bg-primary-100 dark:bg-primary-900/30',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      titulo: 'Notas registradas',
      valor: resumen?.notasRegistradas ?? 0,
      detalle: 'Materias con alguna nota',
      icono: ClipboardList,
      colorFondo: 'bg-blue-100 dark:bg-blue-900/30',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      titulo: 'Promedio general',
      valor:
        resumen?.promedioGeneral != null
          ? resumen.promedioGeneral.toFixed(2)
          : '—',
      detalle: 'Según notas definitivas',
      icono: TrendingUp,
      colorFondo: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-600 dark:text-green-400',
    },
  ];

  const estudiante = resumen?.estudiante;
  const subtitulo = [
    estudiante?.carrera?.nombre,
    estudiante?.semestre ? `${estudiante.semestre}.º semestre` : null,
    estudiante?.codigoInscripcion,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Mi Panel' }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {nombreCompleto(resumen) || 'estudiante'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {subtitulo ||
            'Consulta tus materias y las notas que registran tus docentes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tarjetas.map((tarjeta) => (
          <Tarjeta key={tarjeta.titulo} variante="conBorde">
            <ContenidoTarjeta className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {tarjeta.titulo}
                  </p>
                  <p className="text-xl font-bold leading-tight text-foreground">
                    {cargando ? '—' : tarjeta.valor}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tarjeta.detalle}
                  </p>
                </div>
                <div className={`shrink-0 rounded-lg p-2 ${tarjeta.colorFondo}`}>
                  <tarjeta.icono className={`h-5 w-5 ${tarjeta.color}`} />
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between gap-3">
            <TituloTarjeta>Mis materias</TituloTarjeta>
            <div className="flex items-center gap-3">
              <Link
                href="/estudiante/malla"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Ver malla curricular
              </Link>
              <Link
                href="/estudiante/materias"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Ver todas
              </Link>
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="p-0">
          {cargando ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : materias.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Todavía no tienes materias inscritas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Materia</CeldaEncabezado>
                    <CeldaEncabezado>Grupo</CeldaEncabezado>
                    <CeldaEncabezado>Docente</CeldaEncabezado>
                    <CeldaEncabezado>Periodo</CeldaEncabezado>
                    <CeldaEncabezado>Definitiva</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">
                      Acciones
                    </CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {materias.map((materia) => (
                    <FilaTabla key={materia.inscripcionMateriaId}>
                      <CeldaTabla>
                        <div className="text-sm font-medium text-foreground">
                          {materia.materia?.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {materia.materia?.codigo}
                        </div>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="text-sm">{materia.grupo?.codigo}</div>
                        <div className="text-xs text-muted-foreground">
                          {materia.grupo?.semestre}.º ·{' '}
                          {materia.grupo?.paralelo}
                        </div>
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.docente?.nombre || 'Sin docente asignado'}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.periodo
                          ? `${materia.grupo.periodo.gestion ?? ''} · Periodo ${materia.grupo.periodo.numero}`
                          : materia.gestion}
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia
                          variante={
                            materia.calificacion?.notaDefinitiva != null
                              ? 'primario'
                              : 'contorno'
                          }
                        >
                          {textoNota(materia)}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla className="text-right">
                        <Link
                          href={`/estudiante/materias/${materia.materiaImpartidaId}`}
                        >
                          <Boton variante="contorno" tamano="pequeno">
                            Ver notas
                          </Boton>
                        </Link>
                      </CeldaTabla>
                    </FilaTabla>
                  ))}
                </CuerpoTabla>
              </Tabla>
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}
