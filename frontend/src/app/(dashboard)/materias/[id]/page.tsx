'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Materia {
  id: number;
  code: string;
  name: string;
  area: string | null;
}

export default function EditarMateriaPage() {
  const router = useRouter();
  const params = useParams();
  const materiaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });

  useEffect(() => {
    fetchMateria();
  }, [materiaId]);

  const fetchMateria = async () => {
    try {
      const response = await api.get(`/materias/${materiaId}`);
      const materia: Materia = response.data;
      setFormData({
        code: materia.code,
        name: materia.name,
      });
    } catch (error) {
      console.error('Error fetching materia:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);
    try {
      await api.patch(`/materias/${materiaId}`, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
      });

      router.push('/materias');
    } catch (error: any) {
      console.error('Error updating materia:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.response?.data?.error?.code === '23505') {
        setErrors({ submit: 'Ya existe una materia con este código' });
      } else {
        setErrors({ submit: 'Error al actualizar la materia' });
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
            { label: 'Materias', href: '/materias' },
            { label: 'Editar Materia' }
          ]} />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Materia no encontrada
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
          { label: 'Materias', href: '/materias' },
          { label: 'Editar Materia' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Materia</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos de la Materia</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Entrada
                  label="Código *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={errors.code}
                  placeholder="MAT-101"
                />
              </div>
              <div>
                <Entrada
                  label="Nombre *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  placeholder="Matemáticas I"
                />
              </div>
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
                Actualizar Materia
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
