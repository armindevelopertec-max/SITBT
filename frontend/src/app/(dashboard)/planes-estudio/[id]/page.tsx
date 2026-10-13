'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  code: string;
  name: string;
}

interface PlanEstudio {
  id: number;
  career_id: number;
  rm_number: string;
  rm_date: string;
  estado: 'vigente' | 'historico';
  notes: string | null;
}

export default function EditarPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    career_id: '',
    rm_number: '',
    rm_date: '',
    estado: 'vigente',
    notes: '',
  });

  useEffect(() => {
    fetchCarreras();
    fetchPlan();
  }, [planId]);

  const fetchCarreras = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCarreras(response.data || []);
    } catch (error) {
      console.error('Error fetching carreras:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/planes-estudio/${planId}`);
      const plan: PlanEstudio = response.data;
      setFormData({
        career_id: plan.career_id.toString(),
        rm_number: plan.rm_number,
        rm_date: plan.rm_date.split('T')[0],
        status: plan.status,
        notes: plan.notes || '',
      });
    } catch (error) {
      console.error('Error fetching plan:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.career_id) newErrors.career_id = 'Carrera es requerida';
    if (!formData.rm_number.trim()) newErrors.rm_number = 'Número RM es requerido';
    if (!formData.rm_date) newErrors.rm_date = 'Fecha RM es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.patch(`/planes-estudio/${planId}`, {
        career_id: parseInt(formData.career_id),
        rm_number: formData.rm_number.trim().toUpperCase(),
        rm_date: formData.rm_date,
        status: formData.status,
        notes: formData.notes.trim() || null,
      });

      router.push('/planes-estudio');
    } catch (error: any) {
      console.error('Error updating plan:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al actualizar el plan de estudio' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Boton variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Boton>
          <Migas items={[
            { label: 'Configuración', href: '/configuracion' },
            { label: 'Planes de Estudio', href: '/planes-estudio' },
            { label: 'Editar Plan' }
          ]} />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Plan de estudio no encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Planes de Estudio', href: '/planes-estudio' },
          { label: 'Editar Plan' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Plan de Estudio</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Plan de Estudio</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Selector
                  label="Carrera *"
                  value={formData.career_id}
                  onChange={(e) => setFormData({ ...formData, career_id: e.target.value })}
                  error={errors.career_id}
                  options={carreras.map(c => ({ value: c.id.toString(), label: c.name }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Entrada
                  label="Número RM *"
                  value={formData.rm_number}
                  onChange={(e) => setFormData({ ...formData, rm_number: e.target.value.toUpperCase() })}
                  error={errors.rm_number}
                  placeholder="RM 2024/001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Entrada
                  label="Fecha RM *"
                  type="date"
                  value={formData.rm_date}
                  onChange={(e) => setFormData({ ...formData, rm_date: e.target.value })}
                  error={errors.rm_date}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'vigente', label: 'Vigente' },
                    { value: 'historico', label: 'Histórico' },
                  ]}
                />
              </div>
            </div>

            <div>
              <Entrada
                label="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Boton variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Actualizar Plan
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
