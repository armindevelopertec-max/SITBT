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
import { Modal } from '@/componentes/iu/modal';
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
import { Search, Wand2, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const [modalGenerarAbierto, setModalGenerarAbierto] = useState(false);
  const [formularioGenerar, setFormularioGenerar] = useState({ periodoId: '', carreraId: '' });
  const [resultadoGenerar, setResultadoGenerar] = useState<{ creados: number; existentes: number; mensaje: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

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

  const abrirGenerar = () => {
    setResultadoGenerar(null);
    setFormularioGenerar({ periodoId: filtroPeriodo || '', carreraId: filtroCarrera || '' });
    setModalGenerarAbierto(true);
  };

  const generar = async () => {
    if (!formularioGenerar.periodoId) {
      setResultadoGenerar({ creados: 0, existentes: 0, mensaje: 'Selecciona un periodo.' });
      return;
    }
    setGuardando(true);
    try {
      const cuerpo: Record<string, number> = { periodoId: Number(formularioGenerar.periodoId) };
      if (formularioGenerar.carreraId) cuerpo.carreraId = Number(formularioGenerar.carreraId);
      const respuesta = await api.post('/materias-impartidas/generar', cuerpo);
      setResultadoGenerar({
        creados: respuesta.data.creados,
        existentes: respuesta.data.existentes,
        mensaje: respuesta.data.mensaje,
      });
      if (respuesta.data.creados > 0) {
        setFiltroPeriodo(formularioGenerar.periodoId);
        setPagina(1);
        obtenerMaterias();
      }
    } catch (error) {
      console.error('Error al generar materias impartidas:', error);
      setResultadoGenerar({ creados: 0, existentes: 0, mensaje: mensajeDeError(error, 'Error al generar') });
    } finally {
      setGuardando(false);
    }
  };

  const semestres = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    etiqueta: `${i + 1}.º semestre`,
  }));

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Materias Impartidas' }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materias Impartidas</h1>
          <p className="text-sm text-gray-500">
            Asignaturas de la malla que se dictan a cada grupo, con sus docentes y libros de calificaciones.
          </p>
        </div>
        <Boton onClick={abrirGenerar}>
          <Wand2 className="w-4 h-4 mr-2" />
          Generar materias impartidas
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <ContenidoTarjeta className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Selector
              etiqueta="Periodo"
              value={filtroPeriodo}
              onChange={(e) => {
                setPagina(1);
                setFiltroPeriodo(e.target.value);
              }}
              opciones={[{ value: '', etiqueta: 'Todos' }, ...periodos.map((p) => ({ value: p.id, etiqueta: p.etiqueta }))]}
            />
            <Selector
              etiqueta="Carrera"
              value={filtroCarrera}
              onChange={(e) => {
                setPagina(1);
                setFiltroCarrera(e.target.value);
              }}
              opciones={[{ value: '', etiqueta: 'Todas' }, ...carreras.map((c) => ({ value: c.id, etiqueta: c.nombre }))]}
            />
            <Selector
              etiqueta="Semestre"
              value={filtroSemestre}
              onChange={(e) => {
                setPagina(1);
                setFiltroSemestre(e.target.value);
              }}
              opciones={[{ value: '', etiqueta: 'Todos' }, ...semestres]}
            />
            <Entrada
              etiqueta="Paralelo"
              placeholder="A, B, C..."
              value={filtroParalelo}
              onChange={(e) => {
                setPagina(1);
                setFiltroParalelo(e.target.value);
              }}
            />
            <Selector
              etiqueta="Estado de notas"
              value={filtroEstadoNotas}
              onChange={(e) => {
                setPagina(1);
                setFiltroEstadoNotas(e.target.value);
              }}
              opciones={[
                { value: '', etiqueta: 'Todos' },
                { value: 'borrador', etiqueta: 'Sin iniciar' },
                { value: 'en_registro', etiqueta: 'En registro' },
                { value: 'pendiente_revision', etiqueta: 'Pendiente de revisión' },
                { value: 'cerrado', etiqueta: 'Cerrado' },
                { value: 'reabierto', etiqueta: 'Reabierto' },
              ]}
            />
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por materia o código de grupo..."
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta className="flex items-center justify-between">
          <TituloTarjeta>Listado ({total})</TituloTarjeta>
          {cargando && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </EncabezadoTarjeta>
        <div className="overflow-x-auto">
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
                  <CeldaTabla colSpan={8} className="text-center text-gray-500 py-10">
                    No hay materias impartidas con los filtros seleccionados.
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                materias.map((fila) => (
                  <FilaTabla key={fila.id}>
                    <CeldaTabla>
                      <div className="font-medium text-gray-900">{fila.materia?.nombre}</div>
                      <div className="text-xs text-gray-500">{fila.materia?.codigo}</div>
                    </CeldaTabla>
                    <CeldaTabla className="text-gray-700">{fila.grupo?.carrera?.nombre || '—'}</CeldaTabla>
                    <CeldaTabla>
                      <div className="text-gray-700">
                        {fila.grupo?.semestre}.º · {fila.grupo?.paralelo || '—'}
                      </div>
                      <div className="text-xs text-gray-500">{fila.grupo?.turno?.nombre || '—'}</div>
                    </CeldaTabla>
                    <CeldaTabla className="text-gray-700">
                      {fila.gestion} · {fila.grupo?.periodo?.numero ? `Periodo ${fila.grupo.periodo.numero}` : '—'}
                    </CeldaTabla>
                    <CeldaTabla className="text-gray-700">{fila.inscritos ?? 0}</CeldaTabla>
                    <CeldaTabla>
                      <div className="text-gray-700">{nombrePersona(fila.docente)}</div>
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
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <span className="text-sm text-gray-500">
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

      <Modal
        abierto={modalGenerarAbierto}
        alCerrar={() => setModalGenerarAbierto(false)}
        titulo="Generar materias impartidas"
        descripcion="Crea las materias impartidas de los grupos del periodo a partir de la malla curricular."
        tamano="grande"
      >
        <div className="space-y-4 p-4">
          <Selector
            etiqueta="Periodo"
            value={formularioGenerar.periodoId}
            onChange={(e) => setFormularioGenerar((f) => ({ ...f, periodoId: e.target.value }))}
            opciones={[{ value: '', etiqueta: 'Selecciona un periodo' }, ...periodos.map((p) => ({ value: p.id, etiqueta: p.etiqueta }))]}
          />
          <Selector
            etiqueta="Carrera (opcional)"
            value={formularioGenerar.carreraId}
            onChange={(e) => setFormularioGenerar((f) => ({ ...f, carreraId: e.target.value }))}
            opciones={[{ value: '', etiqueta: 'Todas las carreras' }, ...carreras.map((c) => ({ value: c.id, etiqueta: c.nombre }))]}
          />
          {resultadoGenerar && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                resultadoGenerar.creados > 0
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              {resultadoGenerar.mensaje}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Boton variante="contorno" onClick={() => setModalGenerarAbierto(false)}>
              Cerrar
            </Boton>
            <Boton onClick={generar} cargando={guardando}>
              Generar
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
