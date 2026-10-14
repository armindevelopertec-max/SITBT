'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

interface Turno {
  id: number;
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
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
    carreraId: '',
    planEstudioId: '',
    semestre: '',
    turnoId: '',
    paralelo: '',
    gestion: new Date().getFullYear().toString(),
    capacidad: '30',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.carreraId) {
      fetchPlanesEstudio(Number(formData.carreraId));
    }
  }, [formData.carreraId]);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [carrerasRes, turnosRes] = await Promise.all([
        api.get('/carreras/activos'),
        api.get('/turnos/todos'),
      ]);
      setCarreras(carrerasRes.data || []);
      setTurnos(turnosRes.data || []);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPlanesEstudio = async (careerId: number) => {
    try {
      const response = await api.get(`/planes-estudio/actual/${careerId}`);
      setPlanesEstudio(response.data || []);
      if (!response.data || response.data.length === 0) {
        const allResponse = await api.get(`/planes-estudio?carreraId=${careerId}`);
        setPlanesEstudio(allResponse.data?.data || []);
      }
    } catch (error) {
      console.error('Error al obtener los planes de estudio:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.carreraId) newErrors.carreraId = 'Carrera es requerida';
    if (!formData.planEstudioId) newErrors.planEstudioId = 'Plan de estudio es requerido';
    if (!formData.semestre) newErrors.semestre = 'Semestre es requerido';
    if (!formData.turnoId) newErrors.turnoId = 'Turno es requerido';
    if (!formData.paralelo.trim()) newErrors.paralelo = 'Paralelo es requerido';
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
        carreraId: parseInt(formData.carreraId),
        planEstudioId: parseInt(formData.planEstudioId),
        semestre: parseInt(formData.semestre),
        turnoId: parseInt(formData.turnoId),
        paralelo: formData.paralelo.toUpperCase(),
        gestion: formData.gestion,
        capacidad: parseInt(formData.capacidad) || 30,
      });

      router.push('/grupos');
    } catch (error: any) {
      console.error('Error al crear el grupo:', error);
      if (error.response?.data?.mensaje) {
        setErrors({ submit: error.response.data.mensaje });
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
        <Boton variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Grupos', href: '/grupos' },
          { label: 'Nuevo Grupo' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Grupo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Grupo</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Selector
                  label="Carrera *"
                  value={formData.carreraId}
                  onChange={(e) => setFormData({ ...formData, carreraId: e.target.value, planEstudioId: '' })}
                  error={errors.carreraId}
                  options={carreras.map(c => ({ value: c.id.toString(), label: c.nombre }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Selector
                  label="Plan de Estudio *"
                  value={formData.planEstudioId}
                  onChange={(e) => setFormData({ ...formData, planEstudioId: e.target.value })}
                  error={errors.planEstudioId}
                  options={planesEstudio.map(p => ({ value: p.id.toString(), label: `RM ${p.numeroRm}` }))}
                  placeholder={!formData.carreraId ? 'Primero seleccione carrera' : planesEstudio.length ? 'Seleccionar plan...' : 'No hay planes'}
                  disabled={!formData.carreraId || loadingData}
                />
              </div>
              <div>
                <Selector
                  label="Semestre *"
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  error={errors.semestre}
                  options={getSemesters()}
                  placeholder="Seleccionar semestre..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Selector
                  label="Turno *"
                  value={formData.turnoId}
                  onChange={(e) => setFormData({ ...formData, turnoId: e.target.value })}
                  error={errors.turnoId}
                  options={turnos.map(t => ({ value: t.id.toString(), label: `${t.nombre} (${t.horaInicio}-${t.horaFin})` }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar turno...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Entrada
                  label="Paralelo *"
                  value={formData.paralelo}
                  onChange={(e) => setFormData({ ...formData, paralelo: e.target.value.toUpperCase() })}
                  error={errors.paralelo}
                  placeholder="A"
                />
              </div>
              <div>
                <Entrada
                  label="Gestión *"
                  value={formData.gestion}
                  onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
                  error={errors.gestion}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="md:w-1/3">
              <Entrada
                label="Capacidad"
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                placeholder="30"
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
          <Boton type="submit" disabled={loading}>
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
          </Boton>
        </div>
      </form>
    </div>
  );
}
