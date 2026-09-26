'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  code: string;
  name: string;
  title: string;
  area: string | null;
  description: string | null;
  load_hours: number;
  status: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}

export default function CarrerasPage() {
  const router = useRouter();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCarrera, setDeletingCarrera] = useState<Carrera | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCarreras();
  }, []);

  const fetchCarreras = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCarreras(response.data || []);
    } catch (error) {
      console.error('Error fetching carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCarrera) return;

    setSaving(true);
    try {
      await api.delete(`/carreras/${deletingCarrera.id}`);
      setDeleteModalOpen(false);
      setDeletingCarrera(null);
      fetchCarreras();
    } catch (error) {
      console.error('Error deleting carrera:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredCarreras = carreras.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.area && c.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Carreras' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Carreras</h1>
        <Button onClick={() => router.push('/carreras/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Carrera
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Carreras</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o área..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarreras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron carreras
                  </TableCell>
                </TableRow>
              ) : (
                filteredCarreras.map((carrera) => (
                  <TableRow key={carrera.id}>
                    <TableCell className="font-medium">{carrera.code}</TableCell>
                    <TableCell>{carrera.name}</TableCell>
                    <TableCell>{carrera.title}</TableCell>
                    <TableCell>{carrera.area || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/carreras/${carrera.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingCarrera(carrera); setDeleteModalOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingCarrera(null); }}
        onConfirm={handleDelete}
        title="Eliminar Carrera"
        message={`¿Estás seguro de eliminar la carrera "${deletingCarrera?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmVariant="danger"
        loading={saving}
      />
    </div>
  );
}
