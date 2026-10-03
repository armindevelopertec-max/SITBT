'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Search, Loader2, Eye, CheckCircle, XCircle, UserPlus, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Select } from '@/components/ui/select';

const statusLabels: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  verificado: { label: 'Verificado', color: 'bg-blue-100 text-blue-800' },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  convertido: { label: 'Convertido', color: 'bg-green-100 text-green-800' },
};

const originLabels: Record<string, string> = {
  web: 'Web',
  secretaria: 'Secretaría',
};

interface AdmissionRequest {
  id: string;
  names: string;
  lastname_paternal: string;
  lastname_maternal: string;
  ci: string;
  ci_issued: string;
  birthdate: string;
  phone: string;
  email: string;
  address: string;
  nombreTutor: string;
  ciTutor: string;
  telefonoTutor: string;
  gender: string;
  birthplace: string;
  marital_status: string;
  nationality: string;
  carrera_id: number;
  carrera: { id: number; name: string } | null;
  estado: string;
  observaciones: string;
  verificado_por: number;
  fechaVerificacion: string;
  origen: string;
  converted_student_id: number;
  created_at: string;
}

interface Career {
  id: number;
  name: string;
  code: string;
}

interface StudyPlan {
  id: number;
  career_id: number;
  rm_number: string;
}

interface ConvertFormData {
  admission_gestion: string;
  admission_date: string;
  career_id: number;
  study_plan_id: number;
  folder_number: string;
  form01_code: string;
  bachelor_title_number: string;
  bachelor_title_date: string;
}

export default function AdmisionPage() {
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [origenFilter, setOrigenFilter] = useState<string>('');

  const [detalleModal, setDetalleModal] = useState<DetalleModalData | null>(null);
  const [verificarModal, setVerificarModal] = useState<AdmissionRequest | null>(null);
  const [rechazarModal, setRechazarModal] = useState<AdmissionRequest | null>(null);
  const [convertirModal, setConvertirModal] = useState<AdmissionRequest | null>(null);
  const [deleteModal, setDeleteModal] = useState<AdmissionRequest | null>(null);

  const [observaciones, setObservaciones] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [careers, setCareers] = useState<Career[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [gestiones, setGestiones] = useState<string[]>([]);
  const [convertForm, setConvertForm] = useState<ConvertFormData>({
    admission_gestion: new Date().getFullYear().toString(),
    admission_date: new Date().toISOString().split('T')[0],
    career_id: 0,
    study_plan_id: 0,
    folder_number: '',
    form01_code: '',
    bachelor_title_number: '',
    bachelor_title_date: '',
  });

  useEffect(() => {
    fetchAdmissions();
    fetchCareers();
    fetchGestiones();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const response = await api.get('/admission');
      setAdmissions(response.data.data);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCareers(response.data || []);
    } catch (error) {
      console.error('Error fetching careers:', error);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      const data = response.data;
      if (Array.isArray(data)) {
        setGestiones(data.map((g: any) => g.year || g.gestion || g));
      } else if (data.data) {
        setGestiones(data.data.map((g: any) => g.year || g.gestion || g));
      }
    } catch (error) {
      console.error('Error fetching gestiones:', error);
      setGestiones([new Date().getFullYear().toString()]);
    }
  };

  const fetchStudyPlans = async (careerId: number) => {
    try {
      const response = await api.get(`/planes-estudio/current/${careerId}`);
      setStudyPlans(response.data || []);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      setStudyPlans([]);
    }
  };

  const handleOpenConvert = (request: AdmissionRequest) => {
    setConvertirModal(request);
    setConvertForm({
      admission_gestion: new Date().getFullYear().toString(),
      admission_date: new Date().toISOString().split('T')[0],
      career_id: request.carrera_id || 0,
      study_plan_id: 0,
      folder_number: '',
      form01_code: '',
      bachelor_title_number: '',
      bachelor_title_date: '',
    });
    if (request.carrera_id) {
      fetchStudyPlans(request.carrera_id);
    }
  };

  const handleConvert = async () => {
    if (!convertirModal) return;
    setFormLoading(true);
    try {
      const personaPayload = {
        ci: convertirModal.ci,
        ci_issued: convertirModal.ci_issued,
        names: convertirModal.names,
        lastname_paternal: convertirModal.lastname_paternal,
        lastname_maternal: convertirModal.lastname_maternal,
        birthdate: convertirModal.birthdate,
        birthplace: convertirModal.birthplace,
        gender: convertirModal.gender,
        marital_status: convertirModal.marital_status,
        nationality: convertirModal.nationality,
        phone: convertirModal.phone,
        email: convertirModal.email,
        address: convertirModal.address,
      };
      const personResponse = await api.post('/personas', personaPayload);
      const personId = personResponse.data.id;

      const studentPayload = {
        person_id: personId,
        admission_gestion: convertForm.admission_gestion,
        admission_date: convertForm.admission_date,
        career_id: convertForm.career_id,
        study_plan_id: convertForm.study_plan_id,
        folder_number: convertForm.folder_number || undefined,
        form01_code: convertForm.form01_code || undefined,
        bachelor_title_number: convertForm.bachelor_title_number || undefined,
        bachelor_title_date: convertForm.bachelor_title_date || undefined,
      };

      await api.post('/estudiantes', studentPayload);

      const updatedRequest = { ...convertirModal, estado: 'convertido' };
      await api.patch(`/admission/${convertirModal.id}`, { estado: 'convertido' });

      setConvertirModal(null);
      fetchAdmissions();
    } catch (error: any) {
      console.error('Error converting:', error);
      alert(error.response?.data?.message || 'Error al convertir a estudiante');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAdmissions = admissions.filter((admission) => {
    const fullName = `${admission.nombre} ${admission.apellidoPaterno || ''} ${admission.apellidoMaterno || ''}`.toLowerCase();
    const ci = admission.ci.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || ci.includes(search);
    const matchesEstado = !estadoFilter || admission.estado === estadoFilter;
    const matchesOrigen = !origenFilter || admission.origen === origenFilter;
    return matchesSearch && matchesEstado && matchesOrigen;
  });

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleVerificar = async () => {
    if (!verificarModal) return;
    setFormLoading(true);
    try {
      await api.post(`/admission/${verificarModal.id}/verify`, {
        verificadoPor: 1,
        observaciones,
      });
      setVerificarModal(null);
      setObservaciones('');
      fetchAdmissions();
    } catch (error) {
      console.error('Error verifying:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!rechazarModal) return;
    setFormLoading(true);
    try {
      await api.post(`/admission/${rechazarModal.id}/reject`, {
        verificadoPor: 1,
        observaciones,
      });
      setRechazarModal(null);
      setObservaciones('');
      fetchAdmissions();
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setFormLoading(true);
    try {
      await api.delete(`/admission/${deleteModal.id}`);
      setDeleteModal(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Admisión' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Admisión</h1>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Pre-registros ({filteredAdmissions.length})</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'pendiente', label: 'Pendiente' },
                    { value: 'verificado', label: 'Verificado' },
                    { value: 'rechazado', label: 'Rechazado' },
                    { value: 'convertido', label: 'Convertido' },
                  ]}
                  placeholder="Estado"
                />
                <Select
                  value={origenFilter}
                  onChange={(e) => setOrigenFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'web', label: 'Web' },
                    { value: 'secretaria', label: 'Secretaría' },
                  ]}
                  placeholder="Origen"
                />
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o CI..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.map((admission) => (
                <TableRow key={admission.id}>
                  <TableCell className="font-medium">
                    {admission.ci} {admission.ci_issued && `- ${admission.ci_issued}`}
                  </TableCell>
                  <TableCell>
                    {admission.names} {admission.lastname_paternal} {admission.lastname_maternal}
                  </TableCell>
                  <TableCell>{admission.carrera?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{originLabels[admission.origen] || '-'}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(admission.estado)}</TableCell>
                  <TableCell>{new Date(admission.created_at).toLocaleString('es-BO', { hour12: false })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Ver detalles" onClick={() => setDetalleModal({ request: admission, showConvert: admission.estado === 'verificado' })}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {admission.estado === 'pendiente' && (
                        <>
                          <Button variant="ghost" size="icon" title="Verificar" onClick={() => setVerificarModal(admission)}>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Rechazar" onClick={() => setRechazarModal(admission)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {admission.estado === 'verificado' && (
                        <Button variant="ghost" size="icon" title="Convertir a estudiante" onClick={() => handleOpenConvert(admission)}>
                          <UserPlus className="w-4 h-4 text-blue-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal(admission)}>
                        <FileText className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAdmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || estadoFilter || origenFilter ? 'No se encontraron registros' : 'No hay pre-registros'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Detalle */}
      <Modal open={!!detalleModal} onClose={() => setDetalleModal(null)} title="Detalle del Pre-registro" size="lg">
        {detalleModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="font-medium">{detalleModal.request.names} {detalleModal.request.lastname_paternal} {detalleModal.request.lastname_maternal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CI</p>
                <p className="font-medium">{detalleModal.request.ci} {detalleModal.request.ci_issued && `- ${detalleModal.request.ci_issued}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                <p className="font-medium">{new Date(detalleModal.request.birthdate).toLocaleDateString('es-BO')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lugar de nacimiento</p>
                <p className="font-medium">{detalleModal.request.birthplace || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Género</p>
                <p className="font-medium">{detalleModal.request.gender === 'M' ? 'Masculino' : detalleModal.request.gender === 'F' ? 'Femenino' : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado civil</p>
                <p className="font-medium">{detalleModal.request.marital_status || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nacionalidad</p>
                <p className="font-medium">{detalleModal.request.nationality || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{detalleModal.request.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{detalleModal.request.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{detalleModal.request.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carrera</p>
                <p className="font-medium">{detalleModal.request.carrera?.name || '-'}</p>
              </div>
              {detalleModal.request.nombreTutor && (
                <>
                  <div className="col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm font-semibold text-gray-700">Datos del Tutor</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre del tutor</p>
                    <p className="font-medium">{detalleModal.request.nombreTutor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CI del tutor</p>
                    <p className="font-medium">{detalleModal.request.ciTutor || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono del tutor</p>
                    <p className="font-medium">{detalleModal.request.telefonoTutor || '-'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Verificar */}
      <ConfirmModal
        open={!!verificarModal}
        onClose={() => { setVerificarModal(null); setObservaciones(''); }}
        onConfirm={handleVerificar}
        title="Verificar Pre-registro"
        confirmText="Verificar"
        loading={formLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de verificar el pre-registro de <strong>{verificarModal?.nombre} {verificarModal?.apellidoPaterno}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Observaciones..."
            />
          </div>
        </div>
      </ConfirmModal>

      {/* Modal Rechazar */}
      <ConfirmModal
        open={!!rechazarModal}
        onClose={() => { setRechazarModal(null); setObservaciones(''); }}
        onConfirm={handleRechazar}
        title="Rechazar Pre-registro"
        confirmText="Rechazar"
        variant="destructive"
        loading={formLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de rechazar el pre-registro de <strong>{rechazarModal?.names} {rechazarModal?.lastname_paternal}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del rechazo *</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Motivo del rechazo..."
              required
            />
          </div>
        </div>
      </ConfirmModal>

      {/* Modal Convertir - Formulario completo */}
      <Modal open={!!convertirModal} onClose={() => setConvertirModal(null)} title="Crear Estudiante" size="lg">
        {convertirModal && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Datos del pre-registro:</strong> {convertirModal.names} {convertirModal.lastname_paternal} {convertirModal.lastname_maternal}<br />
                CI: {convertirModal.ci} {convertirModal.ci_issued && `- ${convertirModal.ci_issued}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gestión de ingreso *</label>
                <Select
                  value={convertForm.admission_gestion}
                  onChange={(e) => setConvertForm({ ...convertForm, admission_gestion: e.target.value })}
                  options={gestiones.map(g => ({ value: g, label: g }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso *</label>
                <Input
                  type="date"
                  value={convertForm.admission_date}
                  onChange={(e) => setConvertForm({ ...convertForm, admission_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
                <Select
                  value={convertForm.career_id.toString()}
                  onChange={(e) => {
                    const careerId = parseInt(e.target.value);
                    setConvertForm({ ...convertForm, career_id: careerId, study_plan_id: 0 });
                    fetchStudyPlans(careerId);
                  }}
                  options={careers.map(c => ({ value: c.id.toString(), label: c.name }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan de estudio *</label>
                <Select
                  value={convertForm.study_plan_id.toString()}
                  onChange={(e) => setConvertForm({ ...convertForm, study_plan_id: parseInt(e.target.value) })}
                  options={studyPlans.map(sp => ({ value: sp.id.toString(), label: sp.rm_number }))}
                  placeholder="Seleccionar plan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de carpeta</label>
                <Input
                  value={convertForm.folder_number}
                  onChange={(e) => setConvertForm({ ...convertForm, folder_number: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Formulario 01</label>
                <Input
                  value={convertForm.form01_code}
                  onChange={(e) => setConvertForm({ ...convertForm, form01_code: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Título Bachiller</label>
                <Input
                  value={convertForm.bachelor_title_number}
                  onChange={(e) => setConvertForm({ ...convertForm, bachelor_title_number: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Título Bachiller</label>
                <Input
                  type="date"
                  value={convertForm.bachelor_title_date}
                  onChange={(e) => setConvertForm({ ...convertForm, bachelor_title_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setConvertirModal(null)}>
                Cancelar
              </Button>
              <Button onClick={handleConvert} isLoading={formLoading}>
                Crear Estudiante
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Eliminar */}
      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Eliminar Pre-registro"
        message={`¿Está seguro de eliminar el pre-registro de "${deleteModal?.names} ${deleteModal?.lastname_paternal}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}