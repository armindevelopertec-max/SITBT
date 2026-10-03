'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Loader2, Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Career {
  id: number;
  name: string;
  code: string;
  description: string;
  area: string;
  status: string;
  created_at: string;
}

interface CareerFormData {
  name: string;
  code: string;
  description: string;
  area: string;
}

export default function CarrerasPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Career | null>(null);
  const [form, setForm] = useState<CareerFormData>({
    name: '',
    code: '',
    description: '',
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
      console.error('Error fetching careers:', error);
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
      career.name.toLowerCase().includes(search) ||
      career.code.toLowerCase().includes(search) ||
      career.area.toLowerCase().includes(search)
    );
  });

  const handleOpenModal = (career?: Career) => {
    if (career) {
      setEditingCareer(career);
      setForm({
        name: career.name,
        code: career.code,
        description: career.description || '',
        area: career.area || '',
      });
    } else {
      setEditingCareer(null);
      setForm({ name: '', code: '', description: '', area: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCareer(null);
    setForm({ name: '', code: '', description: '', area: '' });
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
      console.error('Error saving career:', error);
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
      console.error('Error deleting career:', error);
      alert('Error al eliminar la carrera');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = status === 'activo'
      ? { label: 'Activo', color: 'bg-green-100 text-green-800' }
      : { label: 'Inactivo', color: 'bg-red-100 text-red-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
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
      <Breadcrumb items={[{ label: 'Panel' }, { label: 'Carreras' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Carreras</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Carrera
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
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
                <Input
                  placeholder="Buscar por nombre, código o área..."
                  className="pl-10 w-64"
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
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCareers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell className="font-medium">{career.code}</TableCell>
                  <TableCell>{career.name}</TableCell>
                  <TableCell>{career.area || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{career.description || '-'}</TableCell>
                  <TableCell>{getStatusBadge(career.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(career)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteModal(career)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCareers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal open={isModalOpen} onClose={handleCloseModal} title={editingCareer ? 'Editar Carrera' : 'Nueva Carrera'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ej: ING-SIS"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción de la carrera..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Guardando...' : editingCareer ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar Carrera" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Está seguro de eliminar la carrera <strong>{deleteModal?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
