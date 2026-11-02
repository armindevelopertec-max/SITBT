'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import {
  BarraFiltros,
  BuscadorFiltro,
  CampoFiltro,
} from '@/componentes/iu/barra-filtros';
import {
  Tabla,
  CuerpoTabla,
  CeldaTabla,
  CeldaEncabezado,
  EncabezadoTabla,
  FilaTabla,
} from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import { Search, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  MateriaImpartida,
  EstadoLibro,
  EstadoDocente,
} from '@/tipos';

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

interface Periodo {
  id: number;
  numero: string;
  nombre?: string | null;
}

interface Gestion {
  id: number;
  anio: string;
  esActual: boolean;
  periodos?: Periodo[];
}

interface OpcionPeriodo {
  id: number;
  gestion: string;
  numero: string;
  etiqueta: string;
}

const construirOpcionesPeriodo = (gestiones: Gestion[]): OpcionPeriodo[] =>
  gestiones.flatMap((gestion) =>
    (gestion.periodos || []).map((periodo) => ({
      id: periodo.id,
      gestion: gestion.anio,
      numero: periodo.numero,
      etiqueta: `${gestion.anio} · Periodo ${periodo.numero}`,
    })),
  );

const ETIQUETAS_ESTADO_NOTAS: Record<string, string> = {
  sin_iniciar: 'Sin iniciar',
  borrador: 'Sin iniciar',
  en_registro: 'En registro',
  pendiente_revision: 'Pendiente de revisión',
  cerrado: 'Cerrado',
  reabierto: 'Reabierto',
};

const VARIANTES_ESTADO_NOTAS: Record<string, 'predeterminado' | 'primario' | 'exito' | 'advertencia' | 'error' | 'contorno'> = {
  sin_iniciar: 'contorno',
  borrador: 'contorno',
  en_registro: 'primario',
  pendiente_revision: 'advertencia',
  cerrado: 'exito',
  reabierto: 'error',
};

const ETIQUETAS_ESTADO_DOCENTE: Record<EstadoDocente, string> = {
  pendiente: 'Sin docente',
  asignado: 'Docente asignado',
  requiere_revision: 'Requiere revisión',
};

const VARIANTES_ESTADO_DOCENTE: Record<EstadoDocente, 'exito' | 'contorno' | 'error'> = {
  pendiente: 'contorno',
  asignado: 'exito',
  requiere_revision: 'error',
};

const nombrePersona = (docente?: { persona?: { nombres?: string; apellidoPaterno?: string; apellidoMaterno?: string } } | null) => {
  if (!docente?.persona) return '—';
  const { nombres, apellidoPaterno, apellidoMaterno } = docente.persona;
  return [apellidoPaterno, apellidoMaterno, nombres].filter(Boolean).join(' ');
};

const LIMITE = 20;

export default function PaginaMateriasImpartidas() {
  const router = useRouter();

  const [materias, setMaterias] = useState<MateriaImpartida[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [periodos, setPeriodos] = useState<OpcionPeriodo[]>([]);
  const [cargando, setCargando] = useState(true);

  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [filtroParalelo, setFiltroParalelo] = useState('');
  const [filtroEstadoNotas, setFiltroEstadoNotas] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');


  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  useEffect(() => {
    obtenerMaterias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroPeriodo, filtroCarrera, filtroSemestre, filtroParalelo, filtroEstadoNotas, busquedaAplicada, pagina]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPagina(1);
      setBusquedaAplicada(busqueda);
    }, 400);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const obtenerDatosIniciales = async () => {
    try {
      const [respuestaCarreras, respuestaGestiones] = await Promise.all([
        api.get('/carreras/activos'),
        api.get('/gestiones'),
      ]);
      setCarreras(respuestaCarreras.data || []);
      const gestiones = respuestaGestiones.data.datos || respuestaGestiones.data || [];
      setPeriodos(construirOpcionesPeriodo(gestiones));
    } catch (error) {
      console.error('Error al obtener datos iniciales:', error);
    }
  };

  const obtenerMaterias = async () => {
    try {
      setCargando(true);
      const parametros: Record<string, string | number> = { pagina, limite: LIMITE };
      if (filtroPeriodo) parametros.periodoId = Number(filtroPeriodo);
      if (filtroCarrera) parametros.carreraId = Number(filtroCarrera);
      if (filtroSemestre) parametros.semestre = Number(filtroSemestre);
      if (filtroParalelo) parametros.paralelo = filtroParalelo.toUpperCase();
      if (filtroEstadoNotas) parametros.estadoNotas = filtroEstadoNotas;
      if (busquedaAplicada.trim()) parametros.busqueda = busquedaAplicada.trim();

      const respuesta = await api.get('/materias-impartidas', { params: parametros });
      setMaterias(respuesta.data.datos || []);
      setTotal(respuesta.data.total || 0);
    } catch (error) {
      console.error('Error al obtener materias impartidas:', error);
      alert(mensajeDeError(error, 'Error al obtener materias impartidas'));
    } finally {
      setCargando(false);
    }
  };

  const semestres = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `${i + 1}.º Semestre`,
  }));
  const paralelosDisponibles = ['A', 'B', 'C', 'D', 'E', 'F'];

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Materias Impartidas' }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materias Impartidas</h1>
          <p className="text-sm text-muted-foreground">
            Asignaturas de la malla que se dictan a cada grupo, con sus docentes y libros de
            calificaciones. Se generan automáticamente al crear los grupos.
          </p>
        </div>
      </div>

      <Tarjeta variante="conBorde">
        <ContenidoTarjeta className="space-y-4">
          <BarraFiltros columnas={5}>
            <CampoFiltro
              etiqueta="Periodo"
              value={filtroPeriodo}
              onChange={(valor) => {
                setPagina(1);
                setFiltroPeriodo(valor);
              }}
              placeholder="Todos"
              opciones={periodos.map((p) => ({ value: p.id, etiqueta: p.etiqueta }))}
            />
            <CampoFiltro
              etiqueta="Carrera"
              value={filtroCarrera}
              onChange={(valor) => {
                setPagina(1);
                setFiltroCarrera(valor);
              }}
              placeholder="Todas"
              opciones={carreras.map((c) => ({ value: c.id, etiqueta: c.nombre }))}
            />
            <CampoFiltro
              etiqueta="Semestre"
              value={filtroSemestre}
              onChange={(valor) => {
                setPagina(1);
                setFiltroSemestre(valor);
              }}
              placeholder="Todos"
              opciones={semestres}
            />
            <CampoFiltro
              etiqueta="Paralelo"
              value={filtroParalelo}
              onChange={(valor) => {
                setPagina(1);
                setFiltroParalelo(valor);
              }}
              placeholder="Todos"
              opciones={paralelosDisponibles.map((p) => ({ value: p, etiqueta: p }))}
            />
            <CampoFiltro
              etiqueta="Estado de notas"
              value={filtroEstadoNotas}
              onChange={(valor) => {
                setPagina(1);
                setFiltroEstadoNotas(valor);
              }}
              placeholder="Todos"
              opciones={[
                { value: 'borrador', etiqueta: 'Sin iniciar' },
                { value: 'en_registro', etiqueta: 'En registro' },
                { value: 'pendiente_revision', etiqueta: 'Pendiente de revisión' },
                { value: 'cerrado', etiqueta: 'Cerrado' },
                { value: 'reabierto', etiqueta: 'Reabierto' },
              ]}
            />
          </BarraFiltros>

          <BuscadorFiltro
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por materia o código de grupo..."
            className="max-w-md"
          />
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta className="flex items-center justify-between">
          <TituloTarjeta>Listado ({total})</TituloTarjeta>
          {cargando && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </EncabezadoTarjeta>
        <div className="overflow-x-auto scrollarea-tema">
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Materia</CeldaEncabezado>
                <CeldaEncabezado>Carrera</CeldaEncabezado>
                <CeldaEncabezado>Grupo</CeldaEncabezado>
                <CeldaEncabezado>Periodo</CeldaEncabezado>
                <CeldaEncabezado>Inscritos</CeldaEncabezado>
                <CeldaEncabezado>Docente</CeldaEncabezado>
                <CeldaEncabezado>Notas</CeldaEncabezado>
                <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {materias.length === 0 && !cargando ? (
                <FilaTabla>
                  <CeldaTabla colSpan={8} className="text-center text-muted-foreground py-10">
                    No hay materias impartidas con los filtros seleccionados.
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                materias.map((fila) => (
                  <FilaTabla key={fila.id}>
                    <CeldaTabla>
                      <div className="font-medium text-foreground">{fila.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground">{fila.materia?.codigo}</div>
                    </CeldaTabla>
                    <CeldaTabla className="text-foreground">{fila.grupo?.carrera?.nombre || '—'}</CeldaTabla>
                    <CeldaTabla>
                      <div className="text-foreground">
                        {fila.grupo?.semestre}.º · {fila.grupo?.paralelo || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">{fila.grupo?.turno?.nombre || '—'}</div>
                    </CeldaTabla>
                    <CeldaTabla className="text-foreground">
                      {fila.gestion} · {fila.grupo?.periodo?.numero ? `Periodo ${fila.grupo.periodo.numero}` : '—'}
                    </CeldaTabla>
                    <CeldaTabla className="text-foreground">{fila.inscritos ?? 0}</CeldaTabla>
                    <CeldaTabla>
                      <div className="text-foreground">{nombrePersona(fila.docente)}</div>
                      <Insignia variante={VARIANTES_ESTADO_DOCENTE[fila.estadoDocente || 'pendiente']}>
                        {ETIQUETAS_ESTADO_DOCENTE[fila.estadoDocente || 'pendiente']}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <Insignia variante={VARIANTES_ESTADO_NOTAS[fila.estadoNotas || 'sin_iniciar']}>
                        {ETIQUETAS_ESTADO_NOTAS[fila.estadoNotas || 'sin_iniciar']}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla className="text-right">
                      <Boton
                        variante="contorno"
                        tamano="pequeno"
                        onClick={() => router.push(`/materias-impartidas/${fila.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Boton>
                    </CeldaTabla>
                  </FilaTabla>
                ))
              )}
            </CuerpoTabla>
          </Tabla>
        </div>
        {total > LIMITE && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <Boton
                variante="contorno"
                tamano="pequeno"
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Boton>
              <Boton
                variante="contorno"
                tamano="pequeno"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Boton>
            </div>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
