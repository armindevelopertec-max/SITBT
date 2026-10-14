'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
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

const statusColors: Record<string, 'exito' | 'advertencia' | 'error'> = {
  pagado: 'exito',
  pendiente: 'advertencia',
  anulado: 'error',
};

const statusLabels: Record<string, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  anulado: 'Anulado',
};

const methodLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  qr: 'QR',
};

export default function PaymentsPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGestion, setFilterGestion] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Pago | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);

  const [formData, setFormData] = useState({
    estudianteId: null as number | null,
    conceptoId: '' as string,
    gestion: '',
    monto: '',
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: 'efectivo',
    numeroRecibo: '',
    notas: '',
  });

  const [searchStudent, setSearchStudent] = useState('');
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);

  useEffect(() => {
    fetchPagos();
    fetchGestiones();
    fetchConceptos();
  }, [filterGestion, filterStatus]);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterGestion) params.gestion = filterGestion;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get('/pagos', { params });
      setPagos(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener los pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      setGestiones(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
    }
  };

  const fetchConceptos = async () => {
    try {
      const response = await api.get('/conceptos-pago/all');
      setConceptos(response.data || []);
    } catch (error) {
      console.error('Error al obtener los conceptos:', error);
    }
  };

  const searchStudents = async () => {
    if (!searchStudent.trim()) return;
    try {
      const response = await api.get('/estudiantes', {
        params: { search: searchStudent, limit: 10 }
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
    }
  };

  const selectStudent = (student: Estudiante) => {
    setSelectedStudent(student);
    setFormData({ ...formData, estudianteId: student.id });
    setSearchStudent('');
    setStudents([]);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setFormData({ ...formData, estudianteId: null });
  };

  const openNewModal = () => {
    const currentYear = new Date().getFullYear().toString();
    setFormData({
      estudianteId: null,
      conceptoId: '',
      gestion: filterGestion || currentYear,
      monto: '',
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: 'efectivo',
      numeroRecibo: '',
      notas: '',
    });
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.estudianteId || !formData.conceptoId || !formData.monto) return;

    setLoadingSave(true);
    try {
      const concepto = conceptos.find(c => c.id.toString() === formData.conceptoId);
      await api.post('/pagos', {
        estudianteId: formData.estudianteId,
        conceptoId: parseInt(formData.conceptoId),
        gestion: formData.gestion,
        monto: parseFloat(formData.monto),
        fechaPago: formData.fechaPago,
        metodoPago: formData.metodoPago,
        numeroRecibo: formData.numeroRecibo || undefined,
        notas: formData.notas || undefined,
        recibidoPor: 1,
        estado: 'pagado',
      });
      setModalOpen(false);
      fetchPagos();
    } catch (error) {
      console.error('Error al crear el pago:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setLoadingSave(true);
    try {
      await api.delete(`/pagos/${deleteModal.id}`);
      setDeleteModal(null);
      fetchPagos();
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleAnnul = async (pago: Pago) => {
    try {
      await api.patch(`/pagos/${pago.id}/annul`);
      fetchPagos();
    } catch (error) {
      console.error('Error al anular el pago:', error);
    }
  };

  const filteredPagos = pagos.filter(pago => {
    if (!searchTerm) return true;
    const person = pago.estudiante?.persona;
    const fullName = `${person?.nombres || ''} ${person?.apellidoPaterno || ''} ${person?.apellidoMaterno || ''}`.toLowerCase();
    const ci = person?.ci?.toLowerCase() || '';
    const code = pago.estudiante?.codigoInscripcion?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || ci.includes(search) || code.includes(search);
  });

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Pagos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
        <Boton onClick={openNewModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pago
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Pagos</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Selector
                value={filterGestion}
                onChange={(e) => setFilterGestion(e.target.value)}
                options={[
                  { value: '', label: 'Todas las gestiones' },
                  ...gestiones.map(g => ({ value: g.anio, label: g.anio }))
                ]}
              />
              <Selector
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'pagado', label: 'Pagado' },
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'anulado', label: 'Anulado' },
                ]}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {loading ? (
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
                {filteredPagos.length === 0 ? (
                  <FilaTabla>
                    <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                      No hay pagos registrados
                    </CeldaTabla>
                  </FilaTabla>
                ) : (
                  filteredPagos.map((pago) => (
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
                      <CeldaTabla>{methodLabels[pago.metodoPago] || pago.metodoPago}</CeldaTabla>
                      <CeldaTabla>
                        <Insignia variant={statusColors[pago.estado] || 'secondary'}>
                          {statusLabels[pago.estado] || pago.estado}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="flex items-center gap-2">
                          {pago.estado === 'pagado' && (
                            <Boton
                              variant="ghost"
                              size="icon"
                              title="Anular"
                              onClick={() => handleAnnul(pago)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Pago" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <p className="font-medium">
                    {selectedStudent.persona?.nombres} {selectedStudent.persona?.apellidoPaterno}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.persona?.ci} · {selectedStudent.codigoInscripcion}
                  </p>
                </div>
                <Boton variant="ghost" size="icon" onClick={clearStudent}>
                  <Trash2 className="w-4 h-4" />
                </Boton>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <Entrada
                    placeholder="Buscar por nombre o CI..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                  />
                  <Boton onClick={searchStudents}>Buscar</Boton>
                </div>
                {students.length > 0 && (
                  <div className="mt-2 border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => selectStudent(student)}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <p className="font-medium text-sm">
                          {student.persona?.nombres} {student.persona?.apellidoPaterno}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.persona?.ci} · {student.codigoInscripcion}
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
                value={formData.conceptoId}
                onChange={(e) => setFormData({ ...formData, conceptoId: e.target.value })}
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
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
              <Entrada
                type="date"
                value={formData.fechaPago}
                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Entrada
                value={formData.gestion}
                onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="qr">QR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Recibo</label>
              <Entrada
                value={formData.numeroRecibo}
                onChange={(e) => setFormData({ ...formData, numeroRecibo: e.target.value })}
                placeholder="R-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Boton>
            <Boton onClick={handleSubmit} disabled={loadingSave || !formData.estudianteId || !formData.conceptoId || !formData.monto}>
              {loadingSave ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Guardar'
              )}
            </Boton>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Eliminar Pago"
        message={`¿Está seguro de eliminar este pago de "${deleteModal?.estudiante?.persona?.nombres}"?`}
        confirmText="Eliminar"
        variant="destructive"
        loading={loadingSave}
      />
    </div>
  );
}
