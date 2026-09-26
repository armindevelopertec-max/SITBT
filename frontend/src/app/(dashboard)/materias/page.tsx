'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2, ArrowLeft } from 'lucide-react';

interface Materia {
  id: number;
  code: string;
  name: string;
  area: string | null;
  created_at: string;
  updated_at: string;
}

export default function MateriasPage() {
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingMateria, setDeletingMateria] = useState<Materia | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      const response = await api.get('/materias/all');
      setMaterias(response.data || []);
    } catch (error) {
      console.error('Error fetching materias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMateria) return;

    setSaving(true);
    try {
      console.log('Deleting materia with id:', deletingMateria.id);
      await api.delete(`/materias/${deletingMateria.id}`);
      setDeleteModalOpen(false);
      setDeletingMateria(null);
      fetchMaterias();
    } catch (error) {
      console.error('Error deleting materia:', error);
      alert('Error al eliminar la materia');
    } finally {
      setSaving(false);
    }
  };

  const filteredMaterias = materias.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase())
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
      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Materias' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
        <Button onClick={() => router.push('/materias/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Materias</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o código..."
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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No se encontraron materias
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterias.map((materia) => (
                  <TableRow key={materia.id}>
                    <TableCell className="font-medium">{materia.code}</TableCell>
                    <TableCell>{materia.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/materias/${materia.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { console.log('Click delete', materia); setDeletingMateria(materia); setDeleteModalOpen(true); }}>
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
        onClose={() => { setDeleteModalOpen(false); setDeletingMateria(null); }}
        onConfirm={handleDelete}
        title="Eliminar Materia"
        message={`¿Estás seguro de eliminar la materia "${deletingMateria?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmVariant="danger"
        loading={saving}
      />
    </div>
  );
}
