'use client';

import { useEffect, useState } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Modal } from '@/components/ui/modal';
import { Loader2, Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
  estado: string;
  creadoEn: string;
}

interface CareerFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
}

export default function CarrerasPage() {
  const [careers, setCareers] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Carrera | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Carrera | null>(null);
  const [form, setForm] = useState<CareerFormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    area: '',
  });

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.get('/carreras', { params });
      setCareers(response.data.data || response.data);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [statusFilter]);

  const filteredCareers = careers.filter((career) => {
    const search = searchTerm.toLowerCase();
    return (
      career.nombre.toLowerCase().includes(search) ||
      career.codigo.toLowerCase().includes(search) ||
      career.area.toLowerCase().includes(search)
    );
  });

  const handleOpenModal = (career?: Carrera) => {
    if (career) {
      setEditingCareer(career);
      setForm({
        nombre: career.nombre,
        codigo: career.codigo,
        descripcion: career.descripcion || '',
        area: career.area || '',
      });
    } else {
      setEditingCareer(null);
      setForm({ nombre: '', codigo: '', descripcion: '', area: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCareer(null);
    setForm({ nombre: '', codigo: '', descripcion: '', area: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCareer) {
        await api.patch(`/carreras/${editingCareer.id}`, form);
      } else {
        await api.post('/carreras', form);
      }
      handleCloseModal();
      fetchCareers();
    } catch (error) {
      console.error('Error al guardar la carrera:', error);
      alert('Error al guardar la carrera');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setFormLoading(true);
    try {
      await api.delete(`/carreras/${deleteModal.id}`);
      setDeleteModal(null);
      fetchCareers();
    } catch (error) {
      console.error('Error al eliminar la carrera:', error);
      alert('Error al eliminar la carrera');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = status === 'activo'
      ? { label: 'Activo', color: 'bg-green-100 text-green-800' }
      : { label: 'Inactivo', color: 'bg-red-100 text-red-800' };
    return <Insignia className={config.color}>{config.label}</Insignia>;
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
      <Migas items={[{ label: 'Panel' }, { label: 'Carreras' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Carreras</h1>
        <Boton onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Carrera
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar por nombre, código o área..."
                  className="pl-10 w-64"
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
                <CeldaEncabezado>Código</CeldaEncabezado>
                <CeldaEncabezado>Nombre</CeldaEncabezado>
                <CeldaEncabezado>Área</CeldaEncabezado>
                <CeldaEncabezado>Descripción</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {filteredCareers.map((career) => (
                <FilaTabla key={career.id}>
                  <CeldaTabla className="font-medium">{career.codigo}</CeldaTabla>
                  <CeldaTabla>{career.nombre}</CeldaTabla>
                  <CeldaTabla>{career.area || '-'}</CeldaTabla>
                  <CeldaTabla className="max-w-xs truncate">{career.descripcion || '-'}</CeldaTabla>
                  <CeldaTabla>{getStatusBadge(career.estado)}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon" onClick={() => handleOpenModal(career)}>
                        <Pencil className="w-4 h-4" />
                      </Boton>
                      <Boton variant="ghost" size="icon" onClick={() => setDeleteModal(career)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {filteredCareers.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Crear/Editar */}
      <Modal open={isModalOpen} onClose={handleCloseModal} title={editingCareer ? 'Editar Carrera' : 'Nueva Carrera'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
            <Entrada
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="Ej: ING-SIS"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <Entrada
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Ingeniería de Sistemas"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            >
              <option value="">Seleccionar área</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Salud">Salud</option>
              <option value="Administración">Administración</option>
              <option value="Industrial">Industrial</option>
              <option value="Social">Social</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción de la carrera..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Boton type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={formLoading}>
              {formLoading ? 'Guardando...' : editingCareer ? 'Actualizar' : 'Crear'}
            </Boton>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar Carrera" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de eliminar la carrera <strong>{deleteModal?.nombre}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Boton variant="outline" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Boton>
            <Boton variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Eliminando...' : 'Eliminar'}
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
