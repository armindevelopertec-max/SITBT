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

export default function NuevoPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    carreraId: '',
    numeroRm: '',
    fechaRm: '',
    estado: 'vigente',
    notas: '',
  });

  useEffect(() => {
    fetchCarreras();
  }, []);

  const fetchCarreras = async () => {
    try {
      const response = await api.get('/carreras/activos');
      setCarreras(response.data || []);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.carreraId) newErrors.carreraId = 'Carrera es requerida';
    if (!formData.numeroRm.trim()) newErrors.numeroRm = 'Número RM es requerido';
    if (!formData.fechaRm) newErrors.fechaRm = 'Fecha RM es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/planes-estudio', {
        carreraId: parseInt(formData.carreraId),
        numeroRm: formData.numeroRm.trim().toUpperCase(),
        fechaRm: formData.fechaRm,
        estado: formData.estado,
        notas: formData.notas.trim() || null,
      });

      router.push('/planes-estudio');
    } catch (error: any) {
      console.error('Error al crear el plan de estudio:', error);
      if (error.response?.data?.mensaje) {
        setErrors({ submit: error.response.data.mensaje });
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
        <Boton variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Planes de Estudio', href: '/planes-estudio' },
          { label: 'Nuevo Plan' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Plan de Estudio</h1>
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
                  value={formData.carreraId}
                  onChange={(e) => setFormData({ ...formData, carreraId: e.target.value })}
                  error={errors.carreraId}
                  options={carreras.map(c => ({ value: c.id.toString(), label: c.nombre }))}
                  placeholder={loadingData ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingData}
                />
              </div>
              <div>
                <Entrada
                  label="Número RM *"
                  value={formData.numeroRm}
                  onChange={(e) => setFormData({ ...formData, numeroRm: e.target.value.toUpperCase() })}
                  error={errors.numeroRm}
                  placeholder="RM 2024/001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Entrada
                  label="Fecha RM *"
                  type="date"
                  value={formData.fechaRm}
                  onChange={(e) => setFormData({ ...formData, fechaRm: e.target.value })}
                  error={errors.fechaRm}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
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
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
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
          <Boton type="submit" disabled={loading}>
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
          </Boton>
        </div>
      </form>
    </div>
  );
}
