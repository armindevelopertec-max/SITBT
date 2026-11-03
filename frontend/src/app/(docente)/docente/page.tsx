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
import {
  Tabla,
  EncabezadoTabla,
  CuerpoTabla,
  FilaTabla,
  CeldaEncabezado,
  CeldaTabla,
} from '@/componentes/iu/tabla';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { api } from '@/libreria/api';
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  Loader2,
  Users,
} from 'lucide-react';
import type { MateriaDocente, ResumenDocente } from '@/tipos/docente';

export default function PaginaPanelDocente() {
  const { usuario } = usarAlmacenAutenticacion();
  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState<ResumenDocente | null>(null);
  const [materias, setMaterias] = useState<MateriaDocente[]>([]);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [resumenResp, materiasResp] = await Promise.all([
          api.get('/docente/resumen'),
          api.get('/docente/materias'),
        ]);
        if (!activo) return;
        setResumen(resumenResp.data);
        setMaterias(materiasResp.data || []);
      } catch (error) {
        console.error('Error al cargar el panel del docente:', error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const nombreDocente = usuario?.persona
    ? [
        usuario.persona.nombres,
        usuario.persona.apellidoPaterno,
        usuario.persona.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  const tarjetas = [
    {
      titulo: 'Materias que dicto',
      valor: resumen?.totalMaterias ?? 0,
      detalle: 'Asignadas en el periodo',
      icono: BookOpen,
      colorFondo: 'bg-primary-100 dark:bg-primary-900/30',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      titulo: 'Estudiantes',
      valor: resumen?.totalEstudiantes ?? 0,
      detalle: 'Inscritos en mis materias',
      icono: Users,
      colorFondo: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      titulo: 'Grupos',
      valor: resumen?.totalGrupos ?? 0,
      detalle: 'Grupos a mi cargo',
      icono: GraduationCap,
      colorFondo: 'bg-blue-100 dark:bg-blue-900/30',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      titulo: 'Carga horaria',
      valor: `${resumen?.cargaHoraria ?? 0} h`,
      detalle: 'Horas semanales',
      icono: CalendarClock,
      colorFondo: 'bg-amber-100 dark:bg-amber-900/30',
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Mi Panel' }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {nombreDocente || usuario?.nombreUsuario}
        </h1>
        <p className="text-muted-foreground mt-1">
          Desde aquí puedes revisar tus materias, la lista de estudiantes y
          registrar sus calificaciones.
        </p>
      </div>

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
            <Link
              href="/docente/materias"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ver todas
            </Link>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="p-0">
          {cargando ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : materias.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Todavía no tienes materias asignadas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Materia</CeldaEncabezado>
                    <CeldaEncabezado>Grupo</CeldaEncabezado>
                    <CeldaEncabezado>Carrera</CeldaEncabezado>
                    <CeldaEncabezado>Turno</CeldaEncabezado>
                    <CeldaEncabezado>Estudiantes</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">
                      Acciones
                    </CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {materias.map((materia) => (
                    <FilaTabla key={materia.asignacionId}>
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
                          {materia.grupo?.semestre}.º · {materia.grupo?.paralelo}
                        </div>
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.carrera?.nombre}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.turno?.nombre}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.inscritos}
                      </CeldaTabla>
                      <CeldaTabla className="text-right">
                        <Link href={`/docente/materias/${materia.materiaImpartidaId}`}>
                          <Boton variante="contorno" tamano="pequeno">
                            Abrir
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
