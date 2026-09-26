'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  code: string;
  name: string;
}

export default function NuevoPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    career_id: '',
    rm_number: '',
    rm_date: '',
    status: 'vigente',
    notes: '',
  });

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
      setLoadingData(false);
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

    setLoading(true);
    try {
      await api.post('/planes-estudio', {
        career_id: parseInt(formData.career_id),
        rm_number: formData.rm_number.trim().toUpperCase(),
        rm_date: formData.rm_date,
        status: formData.status,
        notes: formData.notes.trim() || null,
      });

      router.push('/planes-estudio');
    } catch (error: any) {
      console.error('Error creating plan:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al crear el plan de estudio' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Planes de Estudio', href: '/planes-estudio' },
          { label: 'Nuevo Plan' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Plan de Estudio</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos del Plan de Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
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
                <Input
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
                <Input
                  label="Fecha RM *"
                  type="date"
                  value={formData.rm_date}
                  onChange={(e) => setFormData({ ...formData, rm_date: e.target.value })}
                  error={errors.rm_date}
                />
              </div>
              <div>
                <Select
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
              <Input
                label="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
          </CardContent>
        </Card>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Plan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
