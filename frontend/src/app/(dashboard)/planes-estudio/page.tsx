'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Insignia } from '@/components/ui/insignia';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2, BookOpen } from 'lucide-react';

interface PlanEstudio {
  id: number;
  career_id: number;
  rm_number: string;
  rm_date: string;
  estado: 'vigente' | 'historico';
  notes: string | null;
  carrera?: { id: number; code: string; name: string };
  created_at: string;
  updated_at: string;
}

interface Carrera {
  id: number;
  code: string;
  name: string;
}

export default function PlanesEstudioPage() {
  const router = useRouter();
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<PlanEstudio | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlanes();
    fetchCarreras();
  }, []);

  const fetchPlanes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCarrera) params.append('careerId', filterCarrera);
      if (filterStatus) params.append('status', filterStatus);

      const response = await api.get(`/planes-estudio?${params.toString()}`);
      setPlanes(response.data.data?.data || response.data.data || []);
    } catch (error) {
      console.error('Error fetching planes:', error);
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
    fetchPlanes();
  }, [filterCarrera, filterStatus]);

  const handleDelete = async () => {
    if (!deletingPlan) return;

    setSaving(true);
    try {
      await api.delete(`/planes-estudio/${deletingPlan.id}`);
      setDeleteModalOpen(false);
      setDeletingPlan(null);
      fetchPlanes();
    } catch (error) {
      console.error('Error deleting plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredPlanes = planes.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.rm_number.toLowerCase().includes(searchLower) ||
      (p.carrera?.name && p.carrera.name.toLowerCase().includes(searchLower)) ||
      (p.carrera?.code && p.carrera.code.toLowerCase().includes(searchLower))
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
      <Migas items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Planes de Estudio' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planes de Estudio</h1>
        <Boton onClick={() => router.push('/planes-estudio/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Planes</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar plan..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Selector
                value={filterCarrera}
                onChange={(e) => setFilterCarrera(e.target.value)}
                options={[
                  { value: '', label: 'Todas las carreras' },
                  ...carreras.map(c => ({ value: c.id.toString(), label: c.name })),
                ]}
                placeholder="Carrera"
              />
              <Selector
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'vigente', label: 'Vigente' },
                  { value: 'historico', label: 'Histórico' },
                ]}
                placeholder="Estado"
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>RM</CeldaEncabezado>
                <CeldaEncabezado>Fecha RM</CeldaEncabezado>
                <CeldaEncabezado>Carrera</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {filteredPlanes.length === 0 ? (
                <FilaTabla>
                  <CeldaTabla colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron planes de estudio
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                filteredPlanes.map((plan) => (
                  <FilaTabla key={plan.id}>
                    <CeldaTabla className="font-medium">{plan.rm_number}</CeldaTabla>
                    <CeldaTabla>{new Date(plan.rm_date).toLocaleDateString()}</CeldaTabla>
                    <CeldaTabla>{plan.carrera?.name || '-'}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variant={plan.status === 'vigente' ? 'exito' : 'secondary'}>
                        {plan.status}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <div className="flex items-center gap-2">
                        <Boton variant="ghost" size="icon" onClick={() => router.push(`/planes-estudio/${plan.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Boton>
                        <Boton variant="ghost" size="icon" onClick={() => router.push(`/planes-estudio/${plan.id}/materias`)}>
                          <BookOpen className="w-4 h-4" />
                        </Boton>
                        <Boton variant="ghost" size="icon" onClick={() => { setDeletingPlan(plan); setDeleteModalOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Boton>
                      </div>
                    </CeldaTabla>
                  </FilaTabla>
                ))
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingPlan(null); }}
        onConfirm={handleDelete}
        title="Eliminar Plan de Estudio"
        message={`¿Estás seguro de eliminar el plan "${deletingPlan?.rm_number}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />
    </div>
  );
}
