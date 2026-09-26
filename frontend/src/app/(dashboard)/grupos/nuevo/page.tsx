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

interface Turno {
  id: number;
  code: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface PlanEstudio {
  id: number;
  career_id: number;
  rm_number: string;
}

export default function NuevoGrupoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    career_id: '',
    study_plan_id: '',
    semester: '',
    shift_id: '',
    parallel: '',
    gestion: new Date().getFullYear().toString(),
    capacity: '30',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.career_id) {
      fetchPlanesEstudio(Number(formData.career_id));
    }
  }, [formData.career_id]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [carrerasRes, turnosRes] = await Promise.all([
        api.get('/carreras/active'),
        api.get('/turnos/all'),
      ]);
      setCarreras(carrerasRes.data || []);
      setTurnos(turnosRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPlanesEstudio = async (careerId: number) => {
    try {
      const response = await api.get(`/planes-estudio/current/${careerId}`);
      setPlanesEstudio(response.data || []);
      if (!response.data || response.data.length === 0) {
        const allResponse = await api.get(`/planes-estudio?careerId=${careerId}`);
        setPlanesEstudio(allResponse.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching planes:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.career_id) newErrors.career_id = 'Carrera es requerida';
    if (!formData.study_plan_id) newErrors.study_plan_id = 'Plan de estudio es requerido';
    if (!formData.semester) newErrors.semester = 'Semestre es requerido';
    if (!formData.shift_id) newErrors.shift_id = 'Turno es requerido';
    if (!formData.parallel.trim()) newErrors.parallel = 'Paralelo es requerido';
    if (!formData.gestion.trim()) newErrors.gestion = 'Gestión es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/grupos', {
        career_id: parseInt(formData.career_id),
        study_plan_id: parseInt(formData.study_plan_id),
        semester: parseInt(formData.semester),
        shift_id: parseInt(formData.shift_id),
        parallel: formData.parallel.toUpperCase(),
        gestion: formData.gestion,
        capacity: parseInt(formData.capacity) || 30,
      });

      router.push('/grupos');
    } catch (error: any) {
      console.error('Error creating grupo:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al crear el grupo' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getSemesters = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
      label: `Semestre ${i + 1}`,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Grupos', href: '/grupos' },
          { label: 'Nuevo Grupo' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Grupo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos del Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Carrera *"
                  value={formData.career_id}
                  onChange={(e) => setFormData({ ...formData, career_id: e.target.value, study_plan_id: '' })}
                  error={errors.career_id}
                  options={carreras.map(c => ({ value: c.id.toString(), label: c.name }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Select
                  label="Plan de Estudio *"
                  value={formData.study_plan_id}
                  onChange={(e) => setFormData({ ...formData, study_plan_id: e.target.value })}
                  error={errors.study_plan_id}
                  options={planesEstudio.map(p => ({ value: p.id.toString(), label: `RM ${p.rm_number}` }))}
                  placeholder={!formData.career_id ? 'Primero seleccione carrera' : planesEstudio.length ? 'Seleccionar plan...' : 'No hay planes'}
                  disabled={!formData.career_id || loadingData}
                />
              </div>
              <div>
                <Select
                  label="Semestre *"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  error={errors.semester}
                  options={getSemesters()}
                  placeholder="Seleccionar semestre..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Turno *"
                  value={formData.shift_id}
                  onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                  error={errors.shift_id}
                  options={turnos.map(t => ({ value: t.id.toString(), label: `${t.name} (${t.start_time}-${t.end_time})` }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar turno...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Input
                  label="Paralelo *"
                  value={formData.parallel}
                  onChange={(e) => setFormData({ ...formData, parallel: e.target.value.toUpperCase() })}
                  error={errors.parallel}
                  placeholder="A"
                />
              </div>
              <div>
                <Input
                  label="Gestión *"
                  value={formData.gestion}
                  onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
                  error={errors.gestion}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="md:w-1/3">
              <Input
                label="Capacidad"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="30"
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
                Guardar Grupo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
