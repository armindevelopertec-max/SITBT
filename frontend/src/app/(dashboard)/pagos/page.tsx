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
  student_id: number;
  concept_id: number;
  gestion: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number?: string;
  status: string;
  notes?: string;
  estudiante?: {
    inscription_code: string;
    persona?: {
      ci: string;
      names: string;
      lastname_paternal: string;
      lastname_maternal: string;
    };
  };
  concepto?: {
    id: number;
    code: string;
    name: string;
    type: string;
  };
}

interface ConceptoPago {
  id: number;
  code: string;
  name: string;
  type: string;
  default_amount: number;
}

interface Estudiante {
  id: number;
  inscription_code: string;
  persona?: {
    ci: string;
    names: string;
    lastname_paternal: string;
    lastname_maternal: string;
  };
}

interface Gestion {
  id: number;
  year: string;
}

const statusColors: Record<string, 'exito' | 'advertencia' | 'error'> = {
  PAGADO: 'exito',
  PENDIENTE: 'advertencia',
  ANULADO: 'error',
};

const methodLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  QR: 'QR',
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
    student_id: null as number | null,
    concept_id: '' as string,
    gestion: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'EFECTIVO',
    receipt_number: '',
    notes: '',
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
      console.error('Error fetching pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      setGestiones(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching gestiones:', error);
    }
  };

  const fetchConceptos = async () => {
    try {
      const response = await api.get('/conceptos-pago/all');
      setConceptos(response.data || []);
    } catch (error) {
      console.error('Error fetching conceptos:', error);
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
      console.error('Error searching students:', error);
    }
  };

  const selectStudent = (student: Estudiante) => {
    setSelectedStudent(student);
    setFormData({ ...formData, student_id: student.id });
    setSearchStudent('');
    setStudents([]);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setFormData({ ...formData, student_id: null });
  };

  const openNewModal = () => {
    const currentYear = new Date().getFullYear().toString();
    setFormData({
      student_id: null,
      concept_id: '',
      gestion: filterGestion || currentYear,
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'EFECTIVO',
      receipt_number: '',
      notes: '',
    });
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.concept_id || !formData.amount) return;

    setLoadingSave(true);
    try {
      const concepto = conceptos.find(c => c.id.toString() === formData.concept_id);
      await api.post('/pagos', {
        student_id: formData.student_id,
        concept_id: parseInt(formData.concept_id),
        gestion: formData.gestion,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        receipt_number: formData.receipt_number || undefined,
        notes: formData.notes || undefined,
        received_by: 1,
        estado: 'PAGADO',
      });
      setModalOpen(false);
      fetchPagos();
    } catch (error) {
      console.error('Error creating payment:', error);
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
      console.error('Error deleting payment:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleAnnul = async (pago: Pago) => {
    try {
      await api.patch(`/pagos/${pago.id}/annul`);
      fetchPagos();
    } catch (error) {
      console.error('Error annulling payment:', error);
    }
  };

  const filteredPagos = pagos.filter(pago => {
    if (!searchTerm) return true;
    const person = pago.estudiante?.persona;
    const fullName = `${person?.names || ''} ${person?.lastname_paternal || ''} ${person?.lastname_maternal || ''}`.toLowerCase();
    const ci = person?.ci?.toLowerCase() || '';
    const code = pago.estudiante?.inscription_code?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || ci.includes(search) || code.includes(search);
  });

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Pagos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Pagos</h1>
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
                  ...gestiones.map(g => ({ value: g.year, label: g.year }))
                ]}
              />
              <Selector
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'PAGADO', label: 'Pagado' },
                  { value: 'PENDIENTE', label: 'Pendiente' },
                  { value: 'ANULADO', label: 'Anulado' },
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
                  <CeldaEncabezado>Metodo</CeldaEncabezado>
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
                          <p>{pago.estudiante?.persona?.names} {pago.estudiante?.persona?.lastname_paternal}</p>
                          <p className="text-xs text-gray-500">{pago.estudiante?.inscription_code}</p>
                        </div>
                      </CeldaTabla>
                      <CeldaTabla>{pago.concepto?.name || '-'}</CeldaTabla>
                      <CeldaTabla>Bs. {pago.amount}</CeldaTabla>
                      <CeldaTabla>{new Date(pago.payment_date).toLocaleDateString('es-BO')}</CeldaTabla>
                      <CeldaTabla>{methodLabels[pago.payment_method] || pago.payment_method}</CeldaTabla>
                      <CeldaTabla>
                        <Insignia variant={statusColors[pago.status] || 'secondary'}>
                          {pago.status}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="flex items-center gap-2">
                          {pago.status === 'PAGADO' && (
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
                    {selectedStudent.persona?.names} {selectedStudent.persona?.lastname_paternal}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.persona?.ci} · {selectedStudent.inscription_code}
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
                          {student.persona?.names} {student.persona?.lastname_paternal}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.persona?.ci} · {student.inscription_code}
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
                value={formData.concept_id}
                onChange={(e) => setFormData({ ...formData, concept_id: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {conceptos.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <Entrada
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago *</label>
              <Entrada
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestion *</label>
              <Entrada
                value={formData.gestion}
                onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="QR">QR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Recibo</label>
              <Entrada
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="R-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Boton>
            <Boton onClick={handleSubmit} disabled={loadingSave || !formData.student_id || !formData.concept_id || !formData.amount}>
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
        message={`¿Está seguro de eliminar este pago de "${deleteModal?.estudiante?.persona?.names}"?`}
        confirmText="Eliminar"
        variant="destructive"
        loading={loadingSave}
      />
    </div>
  );
}
