'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Materia {
  id: number;
  code: string;
  name: string;
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
    <div className="space-y-4">
      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Materias' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Materias</h1>
        <Button size="sm" onClick={() => router.push('/materias/nuevo')}>
          <Plus className="w-3 h-3 mr-1" />
          Nueva
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        <Input
          placeholder="Buscar..."
          className="pl-7 h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredMaterias.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-8">
          {searchQuery ? 'Sin resultados' : 'Sin materias registradas'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredMaterias.map((materia) => (
            <div
              key={materia.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 group"
            >
              <div className="flex-1 mr-2">
                <p className="text-[10px] text-primary-600 font-medium">{materia.code}</p>
                <p className="text-sm font-medium break-words">{materia.name}</p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => router.push(`/materias/${materia.id}`)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setDeletingMateria(materia); setDeleteModalOpen(true); }}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingMateria(null); }}
        onConfirm={handleDelete}
        title="Eliminar Materia"
        message={`¿Eliminar "${deletingMateria?.name}"?`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />
    </div>
  );
}
