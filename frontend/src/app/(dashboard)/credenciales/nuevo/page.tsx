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
  inscription_code: string;
  status: string;
  persona?: {
    ci: string;
    names: string;
    lastname_paternal: string;
    lastname_maternal: string;
  };
  carrera?: {
    name: string;
  };
}

interface FormData {
  student_id: number | null;
  gestion: string;
  gestion_id: number | null;
  semester: number | null;
  issued_date: string;
  valid_until: string;
  photo_url: string;
  notes: string;
}

interface Gestion {
  id: number;
  year: string;
  period_type: string;
  status: string;
  is_current: boolean;
  periodos?: { id: number; number: string; name: string }[];
}

export default function NewCredentialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    student_id: null,
    gestion: new Date().getFullYear().toString(),
    gestion_id: null,
    semester: null,
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: `${new Date().getFullYear()}-12-31`,
    photo_url: '',
    notes: '',
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
      const response = await api.get('/estudiantes', { params: { limit: 100 } });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      const data = response.data.data || response.data || [];
      setGestiones(data);
      const current = data.find((g: Gestion) => g.is_current);
      if (current) {
        setFormData(prev => ({ ...prev, gestion: current.year, gestion_id: current.id }));
      }
    } catch (error) {
      console.error('Error fetching gestiones:', error);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students.slice(0, 10);
    const q = searchStudent.toLowerCase();
    return students.filter((s) => {
      const person = s.persona;
      if (!person) return false;
      const fullName = `${person.names} ${person.lastname_paternal} ${person.lastname_maternal}`.toLowerCase();
      return fullName.includes(q) || (person.ci || '').includes(q) || s.inscription_code.toLowerCase().includes(q);
    }).slice(0, 10);
  }, [students, searchStudent]);

  const selectStudent = (student: Estudiante) => {
    setSelectedStudent(student);
    setFormData({ ...formData, student_id: student.id });
    setSearchStudent('');
    setErrors({ ...errors, student_id: '' });
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setFormData({ ...formData, student_id: null });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.student_id) newErrors.student_id = 'Debe seleccionar un estudiante';
    if (!formData.gestion) newErrors.gestion = 'La gestión es requerida';
    if (!formData.semester) newErrors.semester = 'El semestre es requerido';
    if (!formData.issued_date) newErrors.issued_date = 'La fecha de emisión es requerida';
    if (!formData.valid_until) newErrors.valid_until = 'La fecha de validez es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        student_id: formData.student_id,
        gestion: formData.gestion,
        gestion_id: formData.gestion_id,
        semester: formData.semester,
        issued_date: formData.issued_date,
        valid_until: formData.valid_until,
        photo_url: formData.photo_url || undefined,
        status: 'emitida',
        issued_by: 1,
        printed: false,
        notes: formData.notes || undefined,
      };

      await api.post('/credenciales', payload);
      router.push('/credenciales');
    } catch (error: any) {
      console.error('Error creating credential:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
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
                    {selectedStudent.persona?.names?.charAt(0) || '?'}{selectedStudent.persona?.lastname_paternal?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.persona?.names} {selectedStudent.persona?.lastname_paternal} {selectedStudent.persona?.lastname_maternal}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedStudent.persona?.ci} · {selectedStudent.inscription_code}
                    </p>
                    <p className="text-sm text-gray-500">{selectedStudent.carrera?.name || 'Sin carrera'}</p>
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
                {errors.student_id && <p className="text-sm text-red-600 mt-1">{errors.student_id}</p>}

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
                            {student.persona?.names?.charAt(0) || '?'}{student.persona?.lastname_paternal?.charAt(0) || ''}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {student.persona?.names} {student.persona?.lastname_paternal} {student.persona?.lastname_maternal}
                            </p>
                            <p className="text-xs text-gray-500">{student.inscription_code}</p>
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
                  value={formData.gestion ? `${formData.gestion}-${formData.semester}` : ''}
                  onChange={(e) => {
                    const [year, sem] = e.target.value.split('-');
                    const semester = parseInt(sem) || null;
                    setFormData(prev => ({ ...prev, gestion: year, semester }));
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {gestiones.flatMap((g) =>
                    (g.periodos || []).map((p: any) => (
                      <option key={`${g.id}-${p.number}`} value={`${g.year}-${p.number === 'I' ? 1 : 2}`}>
                        {p.number}/{g.year}
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
                  className={`w-full h-10 px-3 border rounded-lg text-sm ${errors.semester ? 'border-red-500' : ''}`}
                  value={formData.semester || ''}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">1° Semestre</option>
                  <option value="2">2° Semestre</option>
                  <option value="3">3° Semestre</option>
                  <option value="4">4° Semestre</option>
                  <option value="5">5° Semestre</option>
                  <option value="6">6° Semestre</option>
                </select>
                {errors.semester && <p className="text-sm text-red-600 mt-1">{errors.semester}</p>}
              </div>
              <div>
                <Entrada
                  label="Fecha de Emisión *"
                  type="date"
                  value={formData.issued_date}
                  onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                  error={errors.issued_date}
                />
              </div>
              <div>
                <Entrada
                  label="Válida Hasta *"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  error={errors.valid_until}
                />
              </div>
            </div>

            <div>
              <Entrada
                label="URL de Foto"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
