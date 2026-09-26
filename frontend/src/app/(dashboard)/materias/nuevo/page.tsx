'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function NuevaMateriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Código es requerido';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Código debe tener al menos 3 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nombre debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/materias', {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
      });

      router.push('/materias');
    } catch (error: any) {
      console.error('Error creating materia:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.response?.data?.error?.code === '23505') {
        setErrors({ submit: 'Ya existe una materia con este código' });
      } else {
        setErrors({ submit: 'Error al crear la materia' });
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
          { label: 'Materias', href: '/materias' },
          { label: 'Nueva Materia' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Materia</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos de la Materia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Código *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={errors.code}
                  placeholder="MAT-101"
                />
              </div>
              <div>
                <Input
                  label="Nombre *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  placeholder="Matemáticas I"
                />
              </div>
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
                Guardar Materia
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
