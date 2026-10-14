'use client';

import { useEffect, useState } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Search, Loader2, Eye, CheckCircle, XCircle, UserPlus, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Selector } from '@/components/ui/selector';

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

interface SolicitudAdmision {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  ci: string;
  ciExpedido: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreTutor: string;
  ciTutor: string;
  telefonoTutor: string;
  genero: string;
  lugarNacimiento: string;
  estadoCivil: string;
  nacionalidad: string;
  carreraId: number;
  carrera: { id: number; nombre: string } | null;
  estado: string;
  observaciones: string;
  verificadoPor: number;
  fechaVerificacion: string;
  origen: string;
  estudianteConvertidoId: number;
  creadoEn: string;
}

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
}

interface StudyPlan {
  id: number;
  carreraId: number;
  numeroRm: string;
}

interface EditFormData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  ci: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreTutor: string;
  ciTutor: string;
  telefonoTutor: string;
  carreraId: number;
}

interface DetalleModalData {
  request: SolicitudAdmision;
  showConvert: boolean;
  editMode?: boolean;
}

interface ConvertFormData {
  gestionAdmision: string;
  fechaAdmision: string;
  carreraId: number;
  planEstudioId: number;
  numeroFolder: string;
  codigoFormulario01: string;
  numeroTituloBachiller: string;
  fechaTituloBachiller: string;
}

export default function AdmisionPage() {
  const [admissions, setAdmissions] = useState<SolicitudAdmision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [origenFilter, setOrigenFilter] = useState<string>('');

  const [detalleModal, setDetalleModal] = useState<DetalleModalData | null>(null);
  const [verificarModal, setVerificarModal] = useState<SolicitudAdmision | null>(null);
  const [rechazarModal, setRechazarModal] = useState<SolicitudAdmision | null>(null);
  const [convertirModal, setConvertirModal] = useState<SolicitudAdmision | null>(null);
  const [deleteModal, setDeleteModal] = useState<SolicitudAdmision | null>(null);

  const [observaciones, setObservaciones] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);

  const [careers, setCareers] = useState<Carrera[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [gestiones, setGestiones] = useState<string[]>([]);
  const [convertForm, setConvertForm] = useState<ConvertFormData>({
    gestionAdmision: new Date().getFullYear().toString(),
    fechaAdmision: new Date().toISOString().split('T')[0],
    carreraId: 0,
    planEstudioId: 0,
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
  });

  useEffect(() => {
    fetchAdmissions();
    fetchCareers();
    fetchGestiones();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const response = await api.get('/admision');
      setAdmissions(response.data.data);
    } catch (error) {
      console.error('Error al obtener las admisiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCareers(response.data || []);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      const data = response.data;
      if (Array.isArray(data)) {
        setGestiones(data.map((g: any) => g.anio || g.gestion || g));
      } else if (data.data) {
        setGestiones(data.data.map((g: any) => g.anio || g.gestion || g));
      }
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
      setGestiones([new Date().getFullYear().toString()]);
    }
  };

  const fetchStudyPlans = async (careerId: number) => {
    try {
      const response = await api.get(`/planes-estudio/current/${careerId}`);
      setStudyPlans(response.data || []);
    } catch (error) {
      console.error('Error al obtener los planes de estudio:', error);
      setStudyPlans([]);
    }
  };

  const handleOpenConvert = (request: SolicitudAdmision) => {
    setConvertirModal(request);
    setConvertForm({
      gestionAdmision: new Date().getFullYear().toString(),
      fechaAdmision: new Date().toISOString().split('T')[0],
      carreraId: request.carreraId || 0,
      planEstudioId: 0,
      numeroFolder: '',
      codigoFormulario01: '',
      numeroTituloBachiller: '',
      fechaTituloBachiller: '',
    });
    if (request.carreraId) {
      fetchStudyPlans(request.carreraId);
    }
  };

  const handleConvert = async () => {
    if (!convertirModal) return;
    setFormLoading(true);
    try {
      await api.post(`/admision/${convertirModal.id}/convert-to-student`, {
        admissionGestion: convertForm.gestionAdmision,
      });

      setConvertirModal(null);
      fetchAdmissions();
    } catch (error: any) {
      console.error('Error al convertir:', error);
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
    return <Insignia className={config.color}>{config.label}</Insignia>;
  };

  const isMinor = (fechaNacimiento: string): boolean => {
    if (!fechaNacimiento) return false;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    const diaDiff = hoy.getDate() - nacimiento.getDate();
    const edadReal = edad - (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0) ? 1 : 0);
    return edadReal < 18;
  };

  const handleVerificar = async () => {
    if (!verificarModal) return;
    setFormLoading(true);
    try {
      await api.post(`/admision/${verificarModal.id}/verify`, {
        verificadoPor: 1,
        observaciones,
      });
      setVerificarModal(null);
      setObservaciones('');
      fetchAdmissions();
    } catch (error) {
      console.error('Error al verificar:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!rechazarModal) return;
    setFormLoading(true);
    try {
      await api.post(`/admision/${rechazarModal.id}/reject`, {
        verificadoPor: 1,
        observaciones,
      });
      setRechazarModal(null);
      setObservaciones('');
      fetchAdmissions();
    } catch (error) {
      console.error('Error al rechazar:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setFormLoading(true);
    try {
      await api.delete(`/admision/${deleteModal.id}`);
      setDeleteModal(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEnableEdit = (request: SolicitudAdmision) => {
    setEditForm({
      nombre: request.nombre,
      apellidoPaterno: request.apellidoPaterno || '',
      apellidoMaterno: request.apellidoMaterno || '',
      ci: request.ci,
      fechaNacimiento: request.fechaNacimiento,
      lugarNacimiento: request.lugarNacimiento || '',
      genero: request.genero || '',
      estadoCivil: request.estadoCivil || '',
      nacionalidad: request.nacionalidad || '',
      telefono: request.telefono || '',
      correo: request.correo,
      direccion: request.direccion || '',
      nombreTutor: request.nombreTutor || '',
      ciTutor: request.ciTutor || '',
      telefonoTutor: request.telefonoTutor || '',
      carreraId: request.carreraId,
    });
    setDetalleModal({ request, showConvert: request.estado === 'verificado', editMode: true });
  };

  const handleCancelEdit = () => {
    setEditForm(null);
    if (detalleModal) {
      setDetalleModal({ ...detalleModal, editMode: false });
    }
  };

  const handleSaveEdit = async () => {
    if (!detalleModal || !editForm) return;
    setFormLoading(true);
    try {
      await api.patch(`/admision/${detalleModal.request.id}`, editForm);
      setDetalleModal(null);
      setEditForm(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar los datos');
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
      <Migas items={[{ label: 'Admisión' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Admisión</h1>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TituloTarjeta>Pre-registros ({filteredAdmissions.length})</TituloTarjeta>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Selector
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
                <Selector
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
                <Entrada
                  placeholder="Buscar por nombre o CI..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre Completo</CeldaEncabezado>
                <CeldaEncabezado>Carrera</CeldaEncabezado>
                <CeldaEncabezado>Origen</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {filteredAdmissions.map((admission) => (
                <FilaTabla key={admission.id}>
                  <CeldaTabla className="font-medium">
                    {admission.ci} {admission.ciExpedido && `- ${admission.ciExpedido}`}
                  </CeldaTabla>
                  <CeldaTabla>
                    {admission.nombre} {admission.apellidoPaterno} {admission.apellidoMaterno}
                  </CeldaTabla>
                  <CeldaTabla>{admission.carrera?.nombre || '-'}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variant="outline">{originLabels[admission.origen] || '-'}</Insignia>
                  </CeldaTabla>
                  <CeldaTabla>{getStatusBadge(admission.estado)}</CeldaTabla>
                  <CeldaTabla>{new Date(admission.creadoEn).toLocaleString('es-BO', { hour12: false })}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon" title="Ver detalles" onClick={() => setDetalleModal({ request: admission, showConvert: admission.estado === 'verificado' })}>
                        <Eye className="w-4 h-4" />
                      </Boton>
                      {admission.estado === 'pendiente' && (
                        <>
                          <Boton variant="ghost" size="icon" title="Verificar" onClick={() => setVerificarModal(admission)}>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Boton>
                          <Boton variant="ghost" size="icon" title="Rechazar" onClick={() => setRechazarModal(admission)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Boton>
                        </>
                      )}
                      {admission.estado === 'verificado' && (
                        <Boton variant="ghost" size="icon" title="Convertir a estudiante" onClick={() => handleOpenConvert(admission)}>
                          <UserPlus className="w-4 h-4 text-blue-500" />
                        </Boton>
                      )}
                      <Boton variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal(admission)}>
                        <FileText className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {filteredAdmissions.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || estadoFilter || origenFilter ? 'No se encontraron registros' : 'No hay pre-registros'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Detalle */}
      <Modal open={!!detalleModal} onClose={() => { setDetalleModal(null); setEditForm(null); }} title="Detalle del Pre-registro" size="lg">
        {detalleModal && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
              {detalleModal.request.estado !== 'convertido' && !detalleModal.editMode && (
                <Boton variant="outline" size="sm" onClick={() => handleEnableEdit(detalleModal.request)}>
                  Editar datos
                </Boton>
              )}
            </div>
            {detalleModal.editMode && editForm ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Nombres</label>
                  <Entrada value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Apellido Paterno</label>
                  <Entrada value={editForm.apellidoPaterno} onChange={(e) => setEditForm({ ...editForm, apellidoPaterno: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Apellido Materno</label>
                  <Entrada value={editForm.apellidoMaterno} onChange={(e) => setEditForm({ ...editForm, apellidoMaterno: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">CI</label>
                  <Entrada value={editForm.ci} onChange={(e) => setEditForm({ ...editForm, ci: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Fecha de nacimiento</label>
                  <Entrada type="date" value={editForm.fechaNacimiento} onChange={(e) => setEditForm({ ...editForm, fechaNacimiento: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Lugar de nacimiento</label>
                  <Entrada value={editForm.lugarNacimiento} onChange={(e) => setEditForm({ ...editForm, lugarNacimiento: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Género</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="genero" value="M" checked={editForm.genero === 'M'} onChange={(e) => setEditForm({ ...editForm, genero: e.target.value })} />
                      <span className="text-sm">Masculino</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="genero" value="F" checked={editForm.genero === 'F'} onChange={(e) => setEditForm({ ...editForm, genero: e.target.value })} />
                      <span className="text-sm">Femenino</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Estado civil</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="estadoCivil" value="Soltera(o)" checked={editForm.estadoCivil === 'Soltera(o)'} onChange={(e) => setEditForm({ ...editForm, estadoCivil: e.target.value })} />
                      <span className="text-sm">Soltero(a)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="estadoCivil" value="Casada(o)" checked={editForm.estadoCivil === 'Casada(o)'} onChange={(e) => setEditForm({ ...editForm, estadoCivil: e.target.value })} />
                      <span className="text-sm">Casado(a)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Nacionalidad</label>
                  <Entrada value={editForm.nacionalidad} onChange={(e) => setEditForm({ ...editForm, nacionalidad: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Teléfono</label>
                  <Entrada value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Correo</label>
                  <Entrada type="email" value={editForm.correo} onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Dirección</label>
                  <Entrada value={editForm.direccion} onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Carrera</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={editForm.carreraId} onChange={(e) => setEditForm({ ...editForm, carreraId: parseInt(e.target.value) })}>
                    <option value={0}>Seleccionar carrera</option>
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                {isMinor(editForm.fechaNacimiento) && (
                  <>
                    <div className="col-span-2 border-t pt-4 mt-2">
                      <p className="text-sm font-semibold text-gray-700">Datos del Tutor</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Nombre del tutor</label>
                      <Entrada value={editForm.nombreTutor} onChange={(e) => setEditForm({ ...editForm, nombreTutor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">CI del tutor</label>
                      <Entrada value={editForm.ciTutor} onChange={(e) => setEditForm({ ...editForm, ciTutor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Teléfono del tutor</label>
                      <Entrada value={editForm.telefonoTutor} onChange={(e) => setEditForm({ ...editForm, telefonoTutor: e.target.value })} />
                    </div>
                  </>
                )}
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Boton variant="outline" onClick={handleCancelEdit} disabled={formLoading}>Cancelar</Boton>
                  <Boton onClick={handleSaveEdit} disabled={formLoading}>{formLoading ? 'Guardando...' : 'Guardar cambios'}</Boton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{detalleModal.request.nombre} {detalleModal.request.apellidoPaterno} {detalleModal.request.apellidoMaterno}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CI</p>
                  <p className="font-medium">{detalleModal.request.ci} {detalleModal.request.ciExpedido && `- ${detalleModal.request.ciExpedido}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                  <p className="font-medium">{new Date(detalleModal.request.fechaNacimiento).toLocaleDateString('es-BO')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lugar de nacimiento</p>
                  <p className="font-medium">{detalleModal.request.lugarNacimiento || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium">{detalleModal.request.genero === 'M' ? 'Masculino' : detalleModal.request.genero === 'F' ? 'Femenino' : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado civil</p>
                  <p className="font-medium">{detalleModal.request.estadoCivil || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nacionalidad</p>
                  <p className="font-medium">{detalleModal.request.nacionalidad || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{detalleModal.request.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo</p>
                  <p className="font-medium">{detalleModal.request.correo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">{detalleModal.request.direccion || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carrera</p>
                  <p className="font-medium">{detalleModal.request.carrera?.nombre || '-'}</p>
                </div>
                {isMinor(detalleModal.request.fechaNacimiento) && detalleModal.request.nombreTutor && (
                  <>
                    <div className="col-span-2 border-t pt-4 mt-2">
                      <p className="text-sm font-semibold text-gray-700">Datos del Tutor (menor de edad)</p>
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
            )}
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
            ¿Está seguro de rechazar el pre-registro de <strong>{rechazarModal?.nombre} {rechazarModal?.apellidoPaterno}</strong>?
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
                <strong>Datos del pre-registro:</strong> {convertirModal.nombre} {convertirModal.apellidoPaterno} {convertirModal.apellidoMaterno}<br />
                CI: {convertirModal.ci} {convertirModal.ciExpedido && `- ${convertirModal.ciExpedido}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gestión de ingreso *</label>
                <Selector
                  value={convertForm.gestionAdmision}
                  onChange={(e) => setConvertForm({ ...convertForm, gestionAdmision: e.target.value })}
                  options={gestiones.map(g => ({ value: g, label: g }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso *</label>
                <Entrada
                  type="date"
                  value={convertForm.fechaAdmision}
                  onChange={(e) => setConvertForm({ ...convertForm, fechaAdmision: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
                <Selector
                  value={convertForm.carreraId.toString()}
                  onChange={(e) => {
                    const careerId = parseInt(e.target.value);
                    setConvertForm({ ...convertForm, carreraId: careerId, planEstudioId: 0 });
                    fetchStudyPlans(careerId);
                  }}
                  options={careers.map(c => ({ value: c.id.toString(), label: c.nombre }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan de estudio *</label>
                <Selector
                  value={convertForm.planEstudioId.toString()}
                  onChange={(e) => setConvertForm({ ...convertForm, planEstudioId: parseInt(e.target.value) })}
                  options={studyPlans.map(sp => ({ value: sp.id.toString(), label: sp.numeroRm }))}
                  placeholder="Seleccionar plan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de carpeta</label>
                <Entrada
                  value={convertForm.numeroFolder}
                  onChange={(e) => setConvertForm({ ...convertForm, numeroFolder: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Formulario 01</label>
                <Entrada
                  value={convertForm.codigoFormulario01}
                  onChange={(e) => setConvertForm({ ...convertForm, codigoFormulario01: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Título Bachiller</label>
                <Entrada
                  value={convertForm.numeroTituloBachiller}
                  onChange={(e) => setConvertForm({ ...convertForm, numeroTituloBachiller: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Título Bachiller</label>
                <Entrada
                  type="date"
                  value={convertForm.fechaTituloBachiller}
                  onChange={(e) => setConvertForm({ ...convertForm, fechaTituloBachiller: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Boton variant="outline" onClick={() => setConvertirModal(null)}>
                Cancelar
              </Boton>
              <Boton onClick={handleConvert} isLoading={formLoading}>
                Crear Estudiante
              </Boton>
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
        message={`¿Está seguro de eliminar el pre-registro de "${deleteModal?.nombre} ${deleteModal?.apellidoPaterno}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
