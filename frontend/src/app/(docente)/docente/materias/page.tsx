'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import { Boton } from '@/componentes/iu/boton';
import {
  Tarjeta,
  ContenidoTarjeta,
} from '@/componentes/iu/tarjeta';
import {
  Tabla,
  EncabezadoTabla,
  CuerpoTabla,
  FilaTabla,
  CeldaEncabezado,
  CeldaTabla,
} from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import type { MateriaDocente } from '@/tipos/docente';
import { Loader2 } from 'lucide-react';

export default function PaginaMisMaterias() {
  const [cargando, setCargando] = useState(true);
  const [materias, setMaterias] = useState<MateriaDocente[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;

    api
      .get('/docente/materias')
      .then((respuesta) => {
        if (activo) setMaterias(respuesta.data || []);
      })
      .catch((error) => {
        console.error('Error al cargar las materias del docente:', error);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return materias;
    return materias.filter((materia) => {
      const valores = [
        materia.materia?.nombre,
        materia.materia?.codigo,
        materia.grupo?.codigo,
        materia.grupo?.carrera?.nombre,
        materia.grupo?.turno?.nombre,
      ];
      return valores.some((valor) =>
        (valor || '').toLowerCase().includes(texto),
      );
    });
  }, [busqueda, materias]);

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Mis Materias' }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Materias</h1>
        <p className="text-muted-foreground mt-1">
          Materias que tienes asignadas. Ingresa para ver a tus estudiantes y
          registrar sus notas.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <BuscadorFiltro
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Materia, grupo, carrera o turno"
          className="w-full sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          {cargando
            ? 'Cargando…'
            : `${filtradas.length} de ${materias.length} materia(s)`}
        </p>
      </div>

      <Tarjeta variante="conBorde">
        <ContenidoTarjeta className="p-0">
          {cargando ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : filtradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {materias.length === 0
                ? 'Todavía no tienes materias asignadas.'
                : 'No hay materias que coincidan con la búsqueda.'}
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
                    <CeldaEncabezado>Periodo</CeldaEncabezado>
                    <CeldaEncabezado>Estudiantes</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">
                      Acciones
                    </CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {filtradas.map((materia) => (
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
                          {materia.grupo?.semestre}.º ·{' '}
                          {materia.grupo?.paralelo}
                        </div>
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.carrera?.nombre}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.turno?.nombre}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.grupo?.periodo
                          ? `${materia.grupo.periodo.gestion ?? ''} · Periodo ${materia.grupo.periodo.numero}`
                          : materia.gestion}
                      </CeldaTabla>
                      <CeldaTabla className="text-sm">
                        {materia.inscritos}
                      </CeldaTabla>
                      <CeldaTabla className="text-right">
                        <Link
                          href={`/docente/materias/${materia.materiaImpartidaId}`}
                        >
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
