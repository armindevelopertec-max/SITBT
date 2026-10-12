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
  title: string;
}

interface StudyPlan {
  id: number;
  career_id: number;
  rm_number: string;
}

interface Gestion {
  id: number;
  year: string;
  period_type: string;
  status: string;
  is_current: boolean;
  periodos?: { id: number; number: string; name: string; status: string }[];
}

interface Periodo {
  id: number;
  number: string;
  name: string;
  status: string;
}

interface StudentData {
  id: number;
  person_id: number;
  inscription_code: string;
  admission_gestion: string;
  admission_date: string;
  career_id: number;
  study_plan_id: number;
  folder_number: string;
  form01_code: string;
  bachelor_title_number: string;
  bachelor_title_date: string;
  status: string;
  persona?: {
    id: number;
    ci: string;
    ci_issued: string;
    names: string;
    lastname_paternal: string;
    lastname_maternal: string;
    birthdate: string;
    birthplace: string;
    gender: string;
    marital_status: string;
    nationality: string;
    phone: string;
    email: string;
    address: string;
  };
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [careers, setCareers] = useState<Carrera[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personData, setPersonData] = useState({
    ci: '',
    ci_issued: '',
    names: '',
    lastname_paternal: '',
    lastname_maternal: '',
    birthdate: '',
    birthplace: '',
    gender: '',
    marital_status: '',
    nationality: 'Boliviana',
    phone: '',
    email: '',
    address: '',
  });

  const [studentData, setStudentData] = useState({
    inscription_code: '',
    admission_gestion: '',
    admission_date: '',
    career_id: '' as string | number,
    study_plan_id: '' as string | number,
    folder_number: '',
    form01_code: '',
    bachelor_title_number: '',
    bachelor_title_date: '',
    status: 'activo',
  });

  useEffect(() => {
    fetchCareers();
    fetchGestiones();
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  useEffect(() => {
    if (studentData.career_id) {
      fetchStudyPlans(Number(studentData.career_id));
    } else {
      setStudyPlans([]);
    }
  }, [studentData.career_id]);

  const fetchStudent = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/estudiantes/${studentId}`);
      const student: StudentData = response.data;

      if (student.persona) {
        setPersonData({
          ci: student.persona.ci || '',
          ci_issued: student.persona.ci_issued || '',
          names: student.persona.names || '',
          lastname_paternal: student.persona.lastname_paternal || '',
          lastname_maternal: student.persona.lastname_maternal || '',
          birthdate: student.persona.birthdate || '',
          birthplace: student.persona.birthplace || '',
          gender: student.persona.gender || '',
          marital_status: student.persona.marital_status || '',
          nationality: student.persona.nationality || 'Boliviana',
          phone: student.persona.phone || '',
          email: student.persona.email || '',
          address: student.persona.address || '',
        });
      }

      setStudentData({
        inscription_code: student.inscription_code || '',
        admission_gestion: student.admission_gestion || '',
        admission_date: student.admission_date || '',
        career_id: student.career_id || '',
        study_plan_id: student.study_plan_id || '',
        folder_number: student.folder_number || '',
        form01_code: student.form01_code || '',
        bachelor_title_number: student.bachelor_title_number || '',
        bachelor_title_date: student.bachelor_title_date || '',
        status: student.status || 'activo',
      });
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCareers(response.data || []);
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoadingCareers(false);
    }
  };

  const fetchStudyPlans = async (careerId: number) => {
    setLoadingPlans(true);
    try {
      const response = await api.get(`/planes-estudio/current/${careerId}`);
      setStudyPlans(response.data || []);
    } catch (error) {
      console.error('Error fetching study plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones/active');
      const allGestiones: Gestion[] = response.data || [];
      const allPeriodos: { gestion: Gestion; periodo: Periodo }[] = [];

      allGestiones.forEach((gestion) => {
        if (gestion.periodos && gestion.periodos.length > 0) {
          gestion.periodos.forEach((periodo: any) => {
            allPeriodos.push({ gestion, periodo });
          });
        }
      });

      setPeriodos(allPeriodos.sort((a, b) => {
        if (a.gestion.year !== b.gestion.year) return b.gestion.year.localeCompare(a.gestion.year);
        return a.periodo.number.localeCompare(b.periodo.number);
      }));
    } catch (error) {
      console.error('Error fetching gestiones:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!personData.ci) newErrors.ci = 'CI es requerido';
    if (!personData.names) newErrors.names = 'Nombres es requerido';
    if (!personData.lastname_paternal) newErrors.lastname_paternal = 'Apellido paterno es requerido';
    if (!personData.lastname_maternal) newErrors.lastname_maternal = 'Apellido materno es requerido';
    if (!personData.birthdate) newErrors.birthdate = 'Fecha de nacimiento es requerida';
    if (!personData.gender) newErrors.gender = 'Género es requerido';

    if (!studentData.inscription_code) newErrors.inscription_code = 'Código de inscripción es requerido';
    if (!studentData.admission_gestion) newErrors.admission_gestion = 'Gestión de ingreso es requerida';
    if (!studentData.admission_date) newErrors.admission_date = 'Fecha de ingreso es requerida';
    if (!studentData.career_id) newErrors.career_id = 'Carrera es requerida';
    if (!studentData.study_plan_id) newErrors.study_plan_id = 'Plan de estudio es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const studentResponse = await api.get(`/estudiantes/${studentId}`);
      const student: StudentData = studentResponse.data;

      await api.patch(`/personas/${student.person_id}`, {
        ...personData,
        gender: personData.gender,
        status: 'activo',
      });

      await api.patch(`/estudiantes/${studentId}`, {
        inscription_code: studentData.inscription_code,
        admission_gestion: studentData.admission_gestion,
        admission_date: studentData.admission_date,
        career_id: Number(studentData.career_id),
        study_plan_id: Number(studentData.study_plan_id),
        folder_number: studentData.folder_number || undefined,
        form01_code: studentData.form01_code || undefined,
        bachelor_title_number: studentData.bachelor_title_number || undefined,
        bachelor_title_date: studentData.bachelor_title_date || undefined,
        status: studentData.status,
      });

      router.push('/estudiantes');
    } catch (error: any) {
      console.error('Error updating student:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al actualizar el estudiante' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
          { label: 'Estudiantes', href: '/estudiantes' },
          { label: 'Editar Estudiante' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Estudiante</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos Personales</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  label="Cédula de Identidad *"
                  value={personData.ci}
                  onChange={(e) => setPersonData({ ...personData, ci: e.target.value })}
                  error={errors.ci}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Entrada
                  label="Extensión CI"
                  value={personData.ci_issued}
                  onChange={(e) => setPersonData({ ...personData, ci_issued: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Entrada
                  label="Nombres *"
                  value={personData.names}
                  onChange={(e) => setPersonData({ ...personData, names: e.target.value })}
                  error={errors.names}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Paterno *"
                  value={personData.lastname_paternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_paternal: e.target.value })}
                  error={errors.lastname_paternal}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Materno *"
                  value={personData.lastname_maternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_maternal: e.target.value })}
                  error={errors.lastname_maternal}
                  placeholder="Gomez"
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Nacimiento *"
                  type="date"
                  value={personData.birthdate}
                  onChange={(e) => setPersonData({ ...personData, birthdate: e.target.value })}
                  error={errors.birthdate}
                />
              </div>
              <div>
                <Entrada
                  label="Lugar de Nacimiento"
                  value={personData.birthplace}
                  onChange={(e) => setPersonData({ ...personData, birthplace: e.target.value })}
                  placeholder="La Paz"
                />
              </div>
              <div>
                <Selector
                  label="Género *"
                  value={personData.gender}
                  onChange={(e) => setPersonData({ ...personData, gender: e.target.value })}
                  error={errors.gender}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                  ]}
                  placeholder="Seleccionar..."
                />
              </div>
              <div>
                <Selector
                  label="Estado Civil"
                  value={personData.marital_status}
                  onChange={(e) => setPersonData({ ...personData, marital_status: e.target.value })}
                  options={[
                    { value: 'Soltera(o)', label: 'Soltero(a)' },
                    { value: 'Casada(o)', label: 'Casado(a)' },
                    { value: 'Viuda(o)', label: 'Viudo(a)' },
                    { value: 'Divorciada(o)', label: 'Divorciado(a)' },
                  ]}
                  placeholder="Seleccionar..."
                />
              </div>
              <div>
                <Entrada
                  label="Nacionalidad"
                  value={personData.nationality}
                  onChange={(e) => setPersonData({ ...personData, nationality: e.target.value })}
                  placeholder="Boliviana"
                />
              </div>
              <div>
                <Entrada
                  label="Teléfono"
                  value={personData.phone}
                  onChange={(e) => setPersonData({ ...personData, phone: e.target.value })}
                  placeholder="71234567"
                />
              </div>
              <div>
                <Entrada
                  label="Correo Electrónico"
                  type="email"
                  value={personData.email}
                  onChange={(e) => setPersonData({ ...personData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Entrada
                  label="Dirección"
                  value={personData.address}
                  onChange={(e) => setPersonData({ ...personData, address: e.target.value })}
                  placeholder="Av. 16 de Julio, La Paz"
                />
              </div>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Estudiante</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  label="Código de Inscripción *"
                  value={studentData.inscription_code}
                  error={errors.inscription_code}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Selector
                  label="Gestión de Ingreso *"
                  value={studentData.admission_gestion}
                  onChange={(e) => setStudentData({ ...studentData, admission_gestion: e.target.value })}
                  error={errors.admission_gestion}
                  options={periodos.map(p => ({
                    value: `${p.gestion.year}-${p.periodo.number}`,
                    label: `${p.periodo.number}/${p.gestion.year}${p.periodo.status === 'abierta' ? ' ★' : ''}`,
                  }))}
                  placeholder="Seleccionar período..."
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Ingreso *"
                  type="date"
                  value={studentData.admission_date}
                  onChange={(e) => setStudentData({ ...studentData, admission_date: e.target.value })}
                  error={errors.admission_date}
                />
              </div>
              <div>
                <Selector
                  label="Carrera *"
                  value={String(studentData.career_id)}
                  onChange={(e) => setStudentData({ ...studentData, career_id: e.target.value, study_plan_id: '' })}
                  error={errors.career_id}
                  options={careers.map(c => ({ value: c.id.toString(), label: c.name }))}
                  placeholder={loadingCareers ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingCareers}
                />
              </div>
              <div>
                <Selector
                  label="Plan de Estudio *"
                  value={String(studentData.study_plan_id)}
                  onChange={(e) => setStudentData({ ...studentData, study_plan_id: e.target.value })}
                  error={errors.study_plan_id}
                  options={studyPlans.map(p => ({ value: p.id.toString(), label: `${p.rm_number}` }))}
                  placeholder={loadingPlans ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={loadingPlans || !studentData.career_id}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={studentData.status}
                  onChange={(e) => setStudentData({ ...studentData, status: e.target.value })}
                  options={[
                    { value: 'activo', label: 'Activo' },
                    { value: 'inactivo', label: 'Inactivo' },
                    { value: 'egresado', label: 'Egresado' },
                    { value: 'suspendido', label: 'Suspendido' },
                    { value: 'congelado', label: 'Congelado' },
                  ]}
                  placeholder="Seleccionar estado..."
                />
              </div>
              <div>
                <Entrada
                  label="Número de Folder"
                  value={studentData.folder_number}
                  onChange={(e) => setStudentData({ ...studentData, folder_number: e.target.value })}
                  placeholder="F-001"
                />
              </div>
              <div>
                <Entrada
                  label="Código Formulario 01"
                  value={studentData.form01_code}
                  onChange={(e) => setStudentData({ ...studentData, form01_code: e.target.value })}
                  placeholder="FORM01-2024-001"
                />
              </div>
              <div>
                <Entrada
                  label="Número de Título de Bachiller"
                  value={studentData.bachelor_title_number}
                  onChange={(e) => setStudentData({ ...studentData, bachelor_title_number: e.target.value })}
                  placeholder="123456"
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Título de Bachiller"
                  type="date"
                  value={studentData.bachelor_title_date}
                  onChange={(e) => setStudentData({ ...studentData, bachelor_title_date: e.target.value })}
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
          <Boton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
