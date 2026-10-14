'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2, Search, X } from 'lucide-react';

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  estado: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  carrera?: {
    nombre: string;
  };
}

interface FormData {
  estudianteId: number | null;
  gestion: string;
  gestionId: number | null;
  semestre: number | null;
  fechaEmision: string;
  validoHasta: string;
  fotoUrl: string;
  notas: string;
}

interface Gestion {
  id: number;
  anio: string;
  tipoPeriodo: string;
  estado: string;
  esActual: boolean;
  periodos?: { id: number; numero: string; nombre: string }[];
}

export default function NewCredentialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    estudianteId: null,
    gestion: new Date().getFullYear().toString(),
    gestionId: null,
    semestre: null,
    fechaEmision: new Date().toISOString().split('T')[0],
    validoHasta: `${new Date().getFullYear()}-12-31`,
    fotoUrl: '',
    notas: '',
  });

  const [gestiones, setGestiones] = useState<Gestion[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchGestiones();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get('/estudiantes', { params: { limite: 100 } });
      setStudents(response.data.datos || []);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      const data = response.data.datos || response.data || [];
      setGestiones(data);
      const current = data.find((g: Gestion) => g.esActual);
      if (current) {
        setFormData(prev => ({ ...prev, gestion: current.anio, gestionId: current.id }));
      }
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students.slice(0, 10);
    const q = searchStudent.toLowerCase();
    return students.filter((s) => {
      const person = s.persona;
      if (!person) return false;
      const fullName = `${person.nombres} ${person.apellidoPaterno} ${person.apellidoMaterno}`.toLowerCase();
      return fullName.includes(q) || (person.ci || '').includes(q) || s.codigoInscripcion.toLowerCase().includes(q);
    }).slice(0, 10);
  }, [students, searchStudent]);

  const selectStudent = (student: Estudiante) => {
    setSelectedStudent(student);
    setFormData({ ...formData, estudianteId: student.id });
    setSearchStudent('');
    setErrors({ ...errors, estudianteId: '' });
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setFormData({ ...formData, estudianteId: null });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.estudianteId) newErrors.estudianteId = 'Debe seleccionar un estudiante';
    if (!formData.gestion) newErrors.gestion = 'La gestión es requerida';
    if (!formData.semestre) newErrors.semestre = 'El semestre es requerido';
    if (!formData.fechaEmision) newErrors.fechaEmision = 'La fecha de emisión es requerida';
    if (!formData.validoHasta) newErrors.validoHasta = 'La fecha de validez es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        estudianteId: formData.estudianteId,
        gestion: formData.gestion,
        gestionId: formData.gestionId,
        semestre: formData.semestre,
        fechaEmision: formData.fechaEmision,
        validoHasta: formData.validoHasta,
        fotoUrl: formData.fotoUrl || undefined,
        estado: 'emitida',
        emitidoPor: 1,
        impreso: false,
        notas: formData.notas || undefined,
      };

      await api.post('/credenciales', payload);
      router.push('/credenciales');
    } catch (error: any) {
      console.error('Error al crear la credencial:', error);
      if (error.response?.data?.mensaje) {
        setErrors({ submit: error.response.data.mensaje });
      } else {
        setErrors({ submit: 'Error al crear la credencial' });
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
          { label: 'Credenciales', href: '/credenciales' },
          { label: 'Nueva Credencial' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Credencial</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Seleccionar Estudiante</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            {selectedStudent ? (
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {selectedStudent.persona?.nombres?.charAt(0) || '?'}{selectedStudent.persona?.apellidoPaterno?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.persona?.nombres} {selectedStudent.persona?.apellidoPaterno} {selectedStudent.persona?.apellidoMaterno}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.persona?.ci} · {selectedStudent.codigoInscripcion}
                    </p>
                    <p className="text-sm text-gray-500">{selectedStudent.carrera?.nombre || 'Sin carrera'}</p>
                  </div>
                </div>
                <Boton type="button" variant="ghost" size="icon" onClick={clearStudent}>
                  <X className="w-4 h-4" />
                </Boton>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Entrada
                    placeholder="Buscar estudiante por nombre, CI o código..."
                    className="pl-10"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                  />
                </div>
                {errors.estudianteId && <p className="text-sm text-red-600 mt-1">{errors.estudianteId}</p>}

                {searchStudent && (
                  <div className="mt-2 border rounded-lg overflow-hidden shadow-lg">
                    {loadingStudents ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Buscando...
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No se encontraron estudiantes
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => selectStudent(student)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {student.persona?.nombres?.charAt(0) || '?'}{student.persona?.apellidoPaterno?.charAt(0) || ''}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {student.persona?.nombres} {student.persona?.apellidoPaterno} {student.persona?.apellidoMaterno}
                            </p>
                            <p className="text-xs text-gray-500">{student.codigoInscripcion}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos de la Credencial</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestión *
                </label>
<select
                  className={`w-full h-10 px-3 border rounded-lg text-sm ${errors.gestion ? 'border-red-500' : ''}`}
                  value={formData.gestion ? `${formData.gestion}-${formData.semestre}` : ''}
                  onChange={(e) => {
                    const [anio, sem] = e.target.value.split('-');
                    const semestre = parseInt(sem) || null;
                    setFormData(prev => ({ ...prev, gestion: anio, semestre }));
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {gestiones.flatMap((g) =>
                    (g.periodos || []).map((p: any) => (
                      <option key={`${g.id}-${p.numero}`} value={`${g.anio}-${p.numero === 'I' ? 1 : 2}`}>
                        {p.numero}/{g.anio}
                      </option>
                    ))
                  )}
                </select>
                {errors.gestion && <p className="text-sm text-red-600 mt-1">{errors.gestion}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semestre *
                </label>
                <select
                  className={`w-full h-10 px-3 border rounded-lg text-sm ${errors.semestre ? 'border-red-500' : ''}`}
                  value={formData.semestre || ''}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">1° Semestre</option>
                  <option value="2">2° Semestre</option>
                  <option value="3">3° Semestre</option>
                  <option value="4">4° Semestre</option>
                  <option value="5">5° Semestre</option>
                  <option value="6">6° Semestre</option>
                </select>
                {errors.semestre && <p className="text-sm text-red-600 mt-1">{errors.semestre}</p>}
              </div>
              <div>
                <Entrada
                  label="Fecha de Emisión *"
                  type="date"
                  value={formData.fechaEmision}
                  onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                  error={errors.fechaEmision}
                />
              </div>
              <div>
                <Entrada
                  label="Válida Hasta *"
                  type="date"
                  value={formData.validoHasta}
                  onChange={(e) => setFormData({ ...formData, validoHasta: e.target.value })}
                  error={errors.validoHasta}
                />
              </div>
            </div>

            <div>
              <Entrada
                label="URL de Foto"
                value={formData.fotoUrl}
                onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                Crear Credencial
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
