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
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Grupo {
  id: number;
  career_id: number;
  study_plan_id: number;
  semester: number;
  shift_id: number;
  parallel: string;
  gestion: string;
  capacity: number;
  carrera?: { code: string; name: string };
  turno?: { code: string; name: string };
  plan_estudio?: { rm_number: string };
  created_at: string;
  updated_at: string;
}

interface Carrera {
  id: number;
  code: string;
  name: string;
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGestion, setFilterGestion] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGrupo, setDeletingGrupo] = useState<Grupo | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGrupos();
    fetchCarreras();
  }, []);

  const fetchGrupos = async () => {
    try {
      const params = new URLSearchParams();
      if (filterGestion) params.append('gestion', filterGestion);
      if (filterCarrera) params.append('careerId', filterCarrera);

      const response = await api.get(`/grupos?${params.toString()}`);
      setGrupos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarreras = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCarreras(response.data || []);
    } catch (error) {
      console.error('Error fetching carreras:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, [filterGestion, filterCarrera]);

  const handleDelete = async () => {
    if (!deletingGrupo) return;

    setSaving(true);
    try {
      await api.delete(`/grupos/${deletingGrupo.id}`);
      setDeleteModalOpen(false);
      setDeletingGrupo(null);
      fetchGrupos();
    } catch (error) {
      console.error('Error deleting grupo:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredGrupos = grupos.filter(g => {
    const searchLower = searchQuery.toLowerCase();
    return (
      g.parallel.toLowerCase().includes(searchLower) ||
      g.gestion.includes(searchLower) ||
      (g.carrera?.name && g.carrera.name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Grupos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
        <Button onClick={() => router.push('/grupos/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle>Lista de Grupos</CardTitle>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar grupo..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterGestion}
                onChange={(e) => setFilterGestion(e.target.value)}
                options={[
                  { value: '', label: 'Todas las gestiones' },
                ]}
                placeholder="Gestión"
              />
              <Select
                value={filterCarrera}
                onChange={(e) => setFilterCarrera(e.target.value)}
                options={[
                  { value: '', label: 'Todas las carreras' },
                  ...carreras.map(c => ({ value: c.id.toString(), label: c.name })),
                ]}
                placeholder="Carrera"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paralelo</TableHead>
                <TableHead>Gestión</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrupos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron grupos
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrupos.map((grupo) => (
                  <TableRow key={grupo.id}>
                    <TableCell className="font-medium">{grupo.parallel}</TableCell>
                    <TableCell>{grupo.gestion}</TableCell>
                    <TableCell>{grupo.semester}</TableCell>
                    <TableCell>{grupo.carrera?.name || '-'}</TableCell>
                    <TableCell>{grupo.turno?.name || '-'}</TableCell>
                    <TableCell>{grupo.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/grupos/${grupo.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingGrupo(grupo); setDeleteModalOpen(true); }}>
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
        onClose={() => { setDeleteModalOpen(false); setDeletingGrupo(null); }}
        onConfirm={handleDelete}
        title="Eliminar Grupo"
        message={`¿Estás seguro de eliminar el grupo "${deletingGrupo?.parallel}" de ${deletingGrupo?.gestion}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />
    </div>
  );
}
