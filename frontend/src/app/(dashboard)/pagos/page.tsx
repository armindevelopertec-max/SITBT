'use client';

import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada, AreaTexto } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import {
  BarraFiltros,
  BuscadorFiltro,
  CampoFiltro,
} from '@/componentes/iu/barra-filtros';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { cn, formatearFecha, formatearMoneda, mensajeDeError, obtenerIniciales } from '@/libreria/utilidades';
import {
  Search,
  Plus,
  Trash2,
  Loader2,
  Wallet,
  Receipt,
  Clock,
  Ban,
  Users,
  Filter,
  X,
} from 'lucide-react';

interface Pago {
  id: number;
  estudianteId: number;
  conceptoId: number;
  gestion: string;
  periodo?: string;
  monto: number;
  fechaPago: string;
  metodoPago: string;
  numeroRecibo?: string;
  estado: string;
  notas?: string;
  estudiante?: {
    codigoInscripcion: string;
    persona?: {
      ci: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
  concepto?: {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string;
  };
}

interface ConceptoPago {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  montoPredeterminado: number;
}

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface Gestion {
  id: number;
  anio: string;
}

const variantesEstado: Record<string, 'exito' | 'advertencia' | 'error'> = {
  pagado: 'exito',
  pendiente: 'advertencia',
  anulado: 'error',
};

const etiquetasEstado: Record<string, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  anulado: 'Anulado',
};

const etiquetasMetodo: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  qr: 'QR',
};

const etiquetasTipoConcepto: Record<string, string> = {
  unico: 'Único',
  semestral: 'Semestral',
};

const OPCIONES_PERIODO = [
  { value: 'I', etiqueta: 'Periodo I' },
  { value: 'II', etiqueta: 'Periodo II' },
];

export default function PaginaPagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroGestion, setFiltroGestion] = useState<string>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoAnulando, setPagoAnulando] = useState<Pago | null>(null);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [datosFormulario, setDatosFormulario] = useState({
    estudianteId: null as number | null,
    conceptoId: '' as string,
    gestion: '',
    periodo: 'I',
    monto: '',
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: 'efectivo',
    numeroRecibo: '',
    notas: '',
  });

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [buscandoEstudiante, setBuscandoEstudiante] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  useEffect(() => {
    obtenerGestiones();
    obtenerConceptos();
  }, []);

  useEffect(() => {
    obtenerPagos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroGestion, filtroPeriodo]);

  const obtenerPagos = async () => {
    try {
      setCargando(true);
      setError(null);
      const parametros: any = { limite: 500 };
      if (filtroGestion) parametros.gestion = filtroGestion;
      if (filtroPeriodo) parametros.periodo = filtroPeriodo;

      const respuesta = await api.get('/pagos', { params: parametros });
      setPagos(respuesta.data.datos || []);
    } catch (error) {
      setError(mensajeDeError(error, 'No se pudieron obtener los pagos'));
      console.error('Error al obtener los pagos:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerGestiones = async () => {
    try {
      const respuesta = await api.get('/gestiones');
      setGestiones(respuesta.data.datos || respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
    }
  };

  const obtenerConceptos = async () => {
    try {
      const respuesta = await api.get('/conceptos-pago/todos');
      setConceptos(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener los conceptos:', error);
    }
  };

  const buscarEstudiantes = async (consulta?: string) => {
    const texto = (consulta ?? busquedaEstudiante).trim();
    if (!texto) return;
    setBuscandoEstudiante(true);
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: texto, limite: 10 },
      });
      setEstudiantes(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
    } finally {
      setBuscandoEstudiante(false);
    }
  };

  const seleccionarEstudiante = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setDatosFormulario((actual) => ({ ...actual, estudianteId: estudiante.id }));
    setBusquedaEstudiante('');
    setEstudiantes([]);
  };

  const limpiarEstudiante = () => {
    setEstudianteSeleccionado(null);
    setDatosFormulario((actual) => ({ ...actual, estudianteId: null }));
  };

  const seleccionarConcepto = (valor: string) => {
    const concepto = conceptos.find((c) => c.id.toString() === valor);
    setDatosFormulario((actual) => ({
      ...actual,
      conceptoId: valor,
      monto: concepto ? String(concepto.montoPredeterminado ?? '') : actual.monto,
    }));
  };

  const abrirModalNuevo = () => {
    const anioActual = new Date().getFullYear().toString();
    setDatosFormulario({
      estudianteId: null,
      conceptoId: '',
      gestion: filtroGestion || anioActual,
      periodo: filtroPeriodo || 'I',
      monto: '',
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: 'efectivo',
      numeroRecibo: '',
      notas: '',
    });
    setEstudianteSeleccionado(null);
    setBusquedaEstudiante('');
    setEstudiantes([]);
    setErrorModal(null);
    setModalAbierto(true);
  };

  const crear = async () => {
    if (!datosFormulario.estudianteId || !datosFormulario.conceptoId || !datosFormulario.monto) {
      setErrorModal('Completa el estudiante, el concepto y el monto.');
      return;
    }

    setCargandoGuardado(true);
    setErrorModal(null);
    try {
      await api.post('/pagos', {
        estudianteId: datosFormulario.estudianteId,
        conceptoId: parseInt(datosFormulario.conceptoId),
        gestion: datosFormulario.gestion,
        periodo: datosFormulario.periodo || undefined,
        monto: parseFloat(datosFormulario.monto),
        fechaPago: datosFormulario.fechaPago,
        metodoPago: datosFormulario.metodoPago,
        numeroRecibo: datosFormulario.numeroRecibo || undefined,
        notas: datosFormulario.notas || undefined,
        recibidoPor: 1,
        estado: 'pagado',
      });
      setModalAbierto(false);
      obtenerPagos();
    } catch (error) {
      setErrorModal(mensajeDeError(error, 'No se pudo registrar el pago'));
      console.error('Error al crear el pago:', error);
    } finally {
      setCargandoGuardado(false);
    }
  };

  const anular = async () => {
    if (!pagoAnulando) return;
    setCargandoGuardado(true);
    try {
      await api.patch(`/pagos/${pagoAnulando.id}/anular`);
      setPagoAnulando(null);
      obtenerPagos();
    } catch (error) {
      alert(mensajeDeError(error, 'Error al anular el pago'));
      console.error('Error al anular el pago:', error);
    } finally {
      setCargandoGuardado(false);
    }
  };

  const pagosFiltrados = pagos.filter((pago) => {
    if (filtroEstado && pago.estado !== filtroEstado) return false;
    if (!terminoBusqueda) return true;
    const persona = pago.estudiante?.persona;
    const nombreCompleto =
      `${persona?.nombres || ''} ${persona?.apellidoPaterno || ''} ${persona?.apellidoMaterno || ''}`.toLowerCase();
    const ci = persona?.ci?.toLowerCase() || '';
    const codigo = pago.estudiante?.codigoInscripcion?.toLowerCase() || '';
    const busqueda = terminoBusqueda.toLowerCase();
    return nombreCompleto.includes(busqueda) || ci.includes(busqueda) || codigo.includes(busqueda);
  });

  const totalRecaudado = pagos
    .filter((pago) => pago.estado === 'pagado')
    .reduce((suma, pago) => suma + Number(pago.monto || 0), 0);
  const cantidadPagados = pagos.filter((pago) => pago.estado === 'pagado').length;
  const cantidadPendientes = pagos.filter((pago) => pago.estado === 'pendiente').length;
  const cantidadAnulados = pagos.filter((pago) => pago.estado === 'anulado').length;

  const resumen: { etiqueta: string; valor: string; icono: LucideIcon; tono: string }[] = [
    {
      etiqueta: 'Total recaudado',
      valor: formatearMoneda(totalRecaudado),
      icono: Wallet,
      tono: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      etiqueta: 'Pagos registrados',
      valor: String(cantidadPagados),
      icono: Receipt,
      tono: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    },
    {
      etiqueta: 'Pendientes',
      valor: String(cantidadPendientes),
      icono: Clock,
      tono: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      etiqueta: 'Anulados',
      valor: String(cantidadAnulados),
      icono: Ban,
      tono: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    },
  ];

  const hayFiltros = !!(terminoBusqueda || filtroGestion || filtroPeriodo || filtroEstado);

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Pagos' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de pagos</h1>
          <p className="text-sm text-muted-foreground">Registra y controla los pagos de matrícula y semestrales.</p>
        </div>
        <Boton onClick={abrirModalNuevo}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo pago
        </Boton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((item) => {
          const Icono = item.icono;
          return (
            <Tarjeta key={item.etiqueta} variante="conBorde" className="rounded-2xl">
              <ContenidoTarjeta className="flex items-center gap-4">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', item.tono)}>
                  <Icono className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p
                    className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    title={item.etiqueta}
                  >
                    {item.etiqueta}
                  </p>
                  <p className="truncate text-xl font-bold text-foreground">{item.valor}</p>
                </div>
              </ContenidoTarjeta>
            </Tarjeta>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <Tarjeta variante="conBorde" className="rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-end">
          <BuscadorFiltro
            value={terminoBusqueda}
            onChange={setTerminoBusqueda}
            placeholder="Buscar por estudiante, CI o código..."
            className="flex-1"
          />
          <div className="flex flex-wrap items-end gap-3">
            <CampoFiltro
              etiqueta="Gestión"
              value={filtroGestion}
              onChange={setFiltroGestion}
              placeholder="Todas las gestiones"
              className="w-full sm:w-40"
              opciones={gestiones.map((g) => ({ value: g.anio, etiqueta: g.anio }))}
            />
            <CampoFiltro
              etiqueta="Período"
              value={filtroPeriodo}
              onChange={setFiltroPeriodo}
              placeholder="Todos los períodos"
              className="w-full sm:w-36"
              opciones={OPCIONES_PERIODO}
            />
            <CampoFiltro
              etiqueta="Estado"
              value={filtroEstado}
              onChange={setFiltroEstado}
              placeholder="Todos los estados"
              className="w-full sm:w-40"
              opciones={[
                { value: 'pagado', etiqueta: 'Pagado' },
                { value: 'pendiente', etiqueta: 'Pendiente' },
                { value: 'anulado', etiqueta: 'Anulado' },
              ]}
            />
            {hayFiltros && (
              <Boton
                variante="fantasma"
                tamano="icono"
                title="Limpiar filtros"
                onClick={() => {
                  setTerminoBusqueda('');
                  setFiltroGestion('');
                  setFiltroPeriodo('');
                  setFiltroEstado('');
                }}
              >
                <X className="h-4 w-4" />
              </Boton>
            )}
          </div>
        </div>

        <ContenidoTarjeta className="p-0">
          {cargando ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Receipt className="h-5 w-5" />
              </div>
              <p className="font-medium text-foreground">
                {hayFiltros ? 'Sin resultados' : 'Aún no hay pagos registrados'}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {hayFiltros
                  ? 'Prueba con otro término de búsqueda o ajusta los filtros.'
                  : 'Registra el primer pago con el botón «Nuevo pago».'}
              </p>
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Estudiante</CeldaEncabezado>
                  <CeldaEncabezado>Concepto</CeldaEncabezado>
                  <CeldaEncabezado>Período</CeldaEncabezado>
                  <CeldaEncabezado className="text-right">Monto</CeldaEncabezado>
                  <CeldaEncabezado>Fecha</CeldaEncabezado>
                  <CeldaEncabezado>Método</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {pagosFiltrados.map((pago) => {
                  const persona = pago.estudiante?.persona;
                  return (
                    <FilaTabla key={pago.id}>
                      <CeldaTabla>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xs font-semibold text-primary-700 dark:text-primary-300">
                            {obtenerIniciales(
                              `${persona?.nombres || ''} ${persona?.apellidoPaterno || ''}`,
                            ) || '?'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {persona?.nombres} {persona?.apellidoPaterno}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {pago.estudiante?.codigoInscripcion}
                            </p>
                          </div>
                        </div>
                      </CeldaTabla>
                      <CeldaTabla>
                        <p className="text-foreground">{pago.concepto?.nombre || '-'}</p>
                        {pago.concepto?.tipo && (
                          <p className="text-xs text-muted-foreground">
                            {etiquetasTipoConcepto[pago.concepto.tipo] || pago.concepto.tipo}
                          </p>
                        )}
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia variante="contorno">
                          {pago.periodo ? `${pago.periodo}/${pago.gestion}` : pago.gestion}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla className="text-right font-semibold text-foreground">
                        {formatearMoneda(Number(pago.monto))}
                      </CeldaTabla>
                      <CeldaTabla className="text-muted-foreground">{formatearFecha(pago.fechaPago)}</CeldaTabla>
                      <CeldaTabla>
                        <Insignia variante="contorno">
                          {etiquetasMetodo[pago.metodoPago] || pago.metodoPago}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia variante={variantesEstado[pago.estado] || 'secundario'}>
                          {etiquetasEstado[pago.estado] || pago.estado}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla className="text-right">
                        {pago.estado === 'pagado' ? (
                          <Boton
                            variante="fantasma"
                            tamano="icono"
                            title="Anular pago"
                            onClick={() => setPagoAnulando(pago)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Boton>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </CeldaTabla>
                    </FilaTabla>
                  );
                })}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Registrar pago"
        descripcion="Los campos marcados con * son obligatorios."
        tamano="grande"
      >
        <div className="space-y-5">
          {/* Estudiante */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Estudiante *</label>
            {estudianteSeleccionado ? (
              <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 dark:bg-primary-900/30 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {obtenerIniciales(
                      `${estudianteSeleccionado.persona?.nombres || ''} ${estudianteSeleccionado.persona?.apellidoPaterno || ''}`,
                    ) || '?'}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {estudianteSeleccionado.persona?.nombres} {estudianteSeleccionado.persona?.apellidoPaterno}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CI {estudianteSeleccionado.persona?.ci} · {estudianteSeleccionado.codigoInscripcion}
                    </p>
                  </div>
                </div>
                <Boton variante="fantasma" tamano="icono" onClick={limpiarEstudiante} title="Cambiar estudiante">
                  <X className="h-4 w-4" />
                </Boton>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <BuscadorFiltro
                    placeholder="Buscar por nombre o CI..."
                    value={busquedaEstudiante}
                    onChange={(valor) => {
                      setBusquedaEstudiante(valor);
                      // La búsqueda se hace mientras se escribe, sin botón.
                      if (valor.trim().length >= 2) {
                        void buscarEstudiantes(valor);
                      } else {
                        setEstudiantes([]);
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                {estudiantes.length > 0 && (
                  <div className="mt-2 max-h-44 divide-y divide-gray-100 overflow-y-auto scrollarea-tema rounded-xl border border-border">
                    {estudiantes.map((estudiante) => (
                      <button
                        key={estudiante.id}
                        type="button"
                        onClick={() => seleccionarEstudiante(estudiante)}
                        className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {obtenerIniciales(
                            `${estudiante.persona?.nombres || ''} ${estudiante.persona?.apellidoPaterno || ''}`,
                          ) || '?'}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            CI {estudiante.persona?.ci} · {estudiante.codigoInscripcion}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Concepto y monto */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Concepto *"
              placeholder="Seleccionar..."
              value={datosFormulario.conceptoId}
              onChange={(e) => seleccionarConcepto(e.target.value)}
              opciones={conceptos.map((c) => ({
                value: c.id,
                etiqueta: `${c.nombre} · ${etiquetasTipoConcepto[c.tipo] || c.tipo}`,
              }))}
            />
            <Entrada
              etiqueta="Monto (Bs.) *"
              type="number"
              value={datosFormulario.monto}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, monto: e.target.value })}
              placeholder="0.00"
            />
          </div>

          {/* Fecha, gestión y período */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Entrada
              etiqueta="Fecha de pago *"
              type="date"
              value={datosFormulario.fechaPago}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, fechaPago: e.target.value })}
            />
            <Entrada
              etiqueta="Gestión *"
              value={datosFormulario.gestion}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, gestion: e.target.value })}
              placeholder="2026"
            />
            <Selector
              etiqueta="Período *"
              value={datosFormulario.periodo}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, periodo: e.target.value })}
              opciones={OPCIONES_PERIODO}
            />
          </div>

          {/* Método y recibo */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Método de pago"
              value={datosFormulario.metodoPago}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, metodoPago: e.target.value })}
              opciones={[
                { value: 'efectivo', etiqueta: 'Efectivo' },
                { value: 'transferencia', etiqueta: 'Transferencia' },
                { value: 'qr', etiqueta: 'QR' },
              ]}
            />
            <Entrada
              etiqueta="Número de recibo"
              value={datosFormulario.numeroRecibo}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, numeroRecibo: e.target.value })}
              placeholder="R-001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notas</label>
            <AreaTexto
              className="h-20"
              value={datosFormulario.notas}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
              placeholder="Observaciones..."
            />
          </div>

          {errorModal && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-800 dark:text-red-300">{errorModal}</div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Boton variante="contorno" onClick={() => setModalAbierto(false)} disabled={cargandoGuardado}>
              Cancelar
            </Boton>
            <Boton onClick={crear} cargando={cargandoGuardado}>
              Guardar pago
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={!!pagoAnulando}
        alCerrar={() => setPagoAnulando(null)}
        alConfirmar={anular}
        titulo="Anular pago"
        mensaje={`¿Anular el pago de "${pagoAnulando?.estudiante?.persona?.nombres} ${pagoAnulando?.estudiante?.persona?.apellidoPaterno}"? El registro quedará marcado como anulado.`}
        textoConfirmar="Anular"
        variante="destructivo"
        cargando={cargandoGuardado}
      />
    </div>
  );
}
