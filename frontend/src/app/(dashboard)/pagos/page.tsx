'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Pago {
  id: number;
  estudianteId: number;
  conceptoId: number;
  gestion: string;
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

const coloresEstado: Record<string, 'exito' | 'advertencia' | 'error'> = {
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

export default function PaginaPagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroGestion, setFiltroGestion] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoEliminando, setPagoEliminando] = useState<Pago | null>(null);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    estudianteId: null as number | null,
    conceptoId: '' as string,
    gestion: '',
    monto: '',
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: 'efectivo',
    numeroRecibo: '',
    notas: '',
  });

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  useEffect(() => {
    obtenerPagos();
    obtenerGestiones();
    obtenerConceptos();
  }, [filtroGestion, filtroEstado]);

  const obtenerPagos = async () => {
    try {
      setCargando(true);
      const parametros: any = { limite: 100 };
      if (filtroGestion) parametros.gestion = filtroGestion;
      if (filtroEstado) parametros.status = filtroEstado;

      const respuesta = await api.get('/pagos', { params: parametros });
      setPagos(respuesta.data.datos || []);
    } catch (error) {
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

  const buscarEstudiantes = async () => {
    if (!busquedaEstudiante.trim()) return;
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: busquedaEstudiante, limite: 10 }
      });
      setEstudiantes(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
    }
  };

  const seleccionarEstudiante = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setDatosFormulario({ ...datosFormulario, estudianteId: estudiante.id });
    setBusquedaEstudiante('');
    setEstudiantes([]);
  };

  const limpiarEstudiante = () => {
    setEstudianteSeleccionado(null);
    setDatosFormulario({ ...datosFormulario, estudianteId: null });
  };

  const abrirModalNuevo = () => {
    const anioActual = new Date().getFullYear().toString();
    setDatosFormulario({
      estudianteId: null,
      conceptoId: '',
      gestion: filtroGestion || anioActual,
      monto: '',
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: 'efectivo',
      numeroRecibo: '',
      notas: '',
    });
    setEstudianteSeleccionado(null);
    setModalAbierto(true);
  };

  const crear = async () => {
    if (!datosFormulario.estudianteId || !datosFormulario.conceptoId || !datosFormulario.monto) return;

    setCargandoGuardado(true);
    try {
      const concepto = conceptos.find(c => c.id.toString() === datosFormulario.conceptoId);
      await api.post('/pagos', {
        estudianteId: datosFormulario.estudianteId,
        conceptoId: parseInt(datosFormulario.conceptoId),
        gestion: datosFormulario.gestion,
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
      console.error('Error al crear el pago:', error);
    } finally {
      setCargandoGuardado(false);
    }
  };

  const eliminar = async () => {
    if (!pagoEliminando) return;
    setCargandoGuardado(true);
    try {
      await api.delete(`/pagos/${pagoEliminando.id}`);
      setPagoEliminando(null);
      obtenerPagos();
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar el pago'));
      }).catch(() => {
        alert('Error al eliminar el pago');
      });
    } finally {
      setCargandoGuardado(false);
    }
  };

  const anular = async (pago: Pago) => {
    try {
      await api.patch(`/pagos/${pago.id}/anular`);
      obtenerPagos();
    } catch (error) {
      console.error('Error al anular el pago:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al anular el pago'));
      }).catch(() => {
        alert('Error al anular el pago');
      });
    }
  };

  const pagosFiltrados = pagos.filter(pago => {
    if (!terminoBusqueda) return true;
    const persona = pago.estudiante?.persona;
    const nombreCompleto = `${persona?.nombres || ''} ${persona?.apellidoPaterno || ''} ${persona?.apellidoMaterno || ''}`.toLowerCase();
    const ci = persona?.ci?.toLowerCase() || '';
    const codigo = pago.estudiante?.codigoInscripcion?.toLowerCase() || '';
    const busqueda = terminoBusqueda.toLowerCase();
    return nombreCompleto.includes(busqueda) || ci.includes(busqueda) || codigo.includes(busqueda);
  });

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Pagos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
        <Boton onClick={abrirModalNuevo}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pago
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Pagos</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar..."
                  className="pl-10"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
              </div>
              <Selector
                value={filtroGestion}
                onChange={(e) => setFiltroGestion(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las gestiones' },
                  ...gestiones.map(g => ({ value: g.anio, etiqueta: g.anio }))
                ]}
              />
              <Selector
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos los estados' },
                  { value: 'pagado', etiqueta: 'Pagado' },
                  { value: 'pendiente', etiqueta: 'Pendiente' },
                  { value: 'anulado', etiqueta: 'Anulado' },
                ]}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Estudiante</CeldaEncabezado>
                  <CeldaEncabezado>Concepto</CeldaEncabezado>
                  <CeldaEncabezado>Monto</CeldaEncabezado>
                  <CeldaEncabezado>Fecha</CeldaEncabezado>
                  <CeldaEncabezado>Método</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {pagosFiltrados.length === 0 ? (
                  <FilaTabla>
                    <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                      No hay pagos registrados
                    </CeldaTabla>
                  </FilaTabla>
                ) : (
                  pagosFiltrados.map((pago) => (
                    <FilaTabla key={pago.id}>
                      <CeldaTabla className="font-medium">
                        <div>
                          <p>{pago.estudiante?.persona?.nombres} {pago.estudiante?.persona?.apellidoPaterno}</p>
                          <p className="text-xs text-gray-500">{pago.estudiante?.codigoInscripcion}</p>
                        </div>
                      </CeldaTabla>
                      <CeldaTabla>{pago.concepto?.nombre || '-'}</CeldaTabla>
                      <CeldaTabla>Bs. {pago.monto}</CeldaTabla>
                      <CeldaTabla>{new Date(pago.fechaPago).toLocaleDateString('es-BO')}</CeldaTabla>
                      <CeldaTabla>{etiquetasMetodo[pago.metodoPago] || pago.metodoPago}</CeldaTabla>
                      <CeldaTabla>
                        <Insignia variante={coloresEstado[pago.estado] || 'secundario'}>
                          {etiquetasEstado[pago.estado] || pago.estado}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="flex items-center gap-2">
                          {pago.estado === 'pagado' && (
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Anular"
                              onClick={() => anular(pago)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Boton>
                          )}
                        </div>
                      </CeldaTabla>
                    </FilaTabla>
                  ))
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} titulo="Nuevo Pago" tamano="grande">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            {estudianteSeleccionado ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <p className="font-medium">
                    {estudianteSeleccionado.persona?.nombres} {estudianteSeleccionado.persona?.apellidoPaterno}
                  </p>
                  <p className="text-sm text-gray-500">
                    {estudianteSeleccionado.persona?.ci} · {estudianteSeleccionado.codigoInscripcion}
                  </p>
                </div>
                <Boton variante="fantasma" tamano="icono" onClick={limpiarEstudiante}>
                  <Trash2 className="w-4 h-4" />
                </Boton>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <Entrada
                    placeholder="Buscar por nombre o CI..."
                    value={busquedaEstudiante}
                    onChange={(e) => setBusquedaEstudiante(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarEstudiantes()}
                  />
                  <Boton onClick={buscarEstudiantes}>Buscar</Boton>
                </div>
                {estudiantes.length > 0 && (
                  <div className="mt-2 border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {estudiantes.map((estudiante) => (
                      <div
                        key={estudiante.id}
                        onClick={() => seleccionarEstudiante(estudiante)}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <p className="font-medium text-sm">
                          {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno}
                        </p>
                        <p className="text-xs text-gray-500">
                          {estudiante.persona?.ci} · {estudiante.codigoInscripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={datosFormulario.conceptoId}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, conceptoId: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {conceptos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <Entrada
                type="number"
                value={datosFormulario.monto}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, monto: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
              <Entrada
                type="date"
                value={datosFormulario.fechaPago}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, fechaPago: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Entrada
                value={datosFormulario.gestion}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, gestion: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={datosFormulario.metodoPago}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, metodoPago: e.target.value })}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="qr">QR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Recibo</label>
              <Entrada
                value={datosFormulario.numeroRecibo}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, numeroRecibo: e.target.value })}
                placeholder="R-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
              value={datosFormulario.notas}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={crear} disabled={cargandoGuardado || !datosFormulario.estudianteId || !datosFormulario.conceptoId || !datosFormulario.monto}>
              {cargandoGuardado ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Guardar'
              )}
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={!!pagoEliminando}
        alCerrar={() => setPagoEliminando(null)}
        alConfirmar={eliminar}
        titulo="Eliminar Pago"
        mensaje={`¿Está seguro de eliminar este pago de "${pagoEliminando?.estudiante?.persona?.nombres}"?`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={cargandoGuardado}
      />
    </div>
  );
}
