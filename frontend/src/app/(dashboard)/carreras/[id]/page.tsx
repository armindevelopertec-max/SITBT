'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  code: string;
  name: string;
  title: string;
  area: string | null;
  description: string | null;
  load_hours: number;
  status: 'activo' | 'inactivo';
}

export default function EditarCarreraPage() {
  const router = useRouter();
  const params = useParams();
  const carreraId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    title: '',
    area: '',
    description: '',
  });

  useEffect(() => {
    fetchCarrera();
  }, [carreraId]);

  const fetchCarrera = async () => {
    try {
      const response = await api.get(`/carreras/${carreraId}`);
      const carrera: Carrera = response.data;
      setFormData({
        code: carrera.code,
        name: carrera.name,
        title: carrera.title,
        area: carrera.area || '',
        description: carrera.description || '',
      });
    } catch (error) {
      console.error('Error fetching carrera:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Código es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es requerido';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Título es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.patch(`/carreras/${carreraId}`, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        title: formData.title.trim(),
        area: formData.area.trim() || null,
        description: formData.description.trim() || null,
      });

      router.push('/carreras');
    } catch (error: any) {
      console.error('Error updating carrera:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.response?.data?.error?.code === '23505') {
        setErrors({ submit: 'Ya existe una carrera con este código' });
      } else {
        setErrors({ submit: 'Error al actualizar la carrera' });
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Breadcrumb items={[
            { label: 'Configuración', href: '/configuracion' },
            { label: 'Carreras', href: '/carreras' },
            { label: 'Editar Carrera' }
          ]} />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Carrera no encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Carreras', href: '/carreras' },
          { label: 'Editar Carrera' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Carrera</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos de la Carrera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Código *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={errors.code}
                  placeholder="INF"
                />
              </div>
              <div>
                <Input
                  label="Nombre *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  placeholder="Ingeniería Informática"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Título *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                  placeholder="Ingeniero en Informática"
                />
              </div>
              <div>
                <Input
                  label="Área"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Ingeniería y Tecnología"
                />
              </div>
            </div>

            <div>
              <Input
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la carrera..."
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
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Actualizar Carrera
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
