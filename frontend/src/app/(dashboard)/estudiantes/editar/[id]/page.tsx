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
  codigo: string;
  nombre: string;
  titulo: string;
}

interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
}

interface Gestion {
  id: number;
  anio: string;
  tipoPeriodo: string;
  estado: string;
  esActual: boolean;
  periodos?: { id: number; numero: string; nombre: string; estado: string }[];
}

interface Periodo {
  id: number;
  numero: string;
  nombre: string;
  estado: string;
}

interface StudentData {
  id: number;
  personaId: number;
  codigoInscripcion: string;
  gestionAdmision: string;
  fechaAdmision: string;
  carreraId: number;
  planEstudioId: number;
  numeroFolder: string;
  codigoFormulario01: string;
  numeroTituloBachiller: string;
  fechaTituloBachiller: string;
  estado: string;
  persona?: {
    id: number;
    ci: string;
    ci_issued: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    lugarNacimiento: string;
    genero: string;
    estadoCivil: string;
    nacionalidad: string;
    telefono: string;
    correo: string;
    direccion: string;
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
  const [studyPlans, setStudyPlans] = useState<PlanEstudio[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personData, setPersonData] = useState({
    ci: '',
    ci_issued: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    genero: '',
    estadoCivil: '',
    nacionalidad: 'Boliviana',
    telefono: '',
    correo: '',
    direccion: '',
  });

  const [studentData, setStudentData] = useState({
    codigoInscripcion: '',
    gestionAdmision: '',
    fechaAdmision: '',
    carreraId: '' as string | number,
    planEstudioId: '' as string | number,
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
    estado: 'activo',
  });

  useEffect(() => {
    fetchCareers();
    fetchGestiones();
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  useEffect(() => {
    if (studentData.carreraId) {
      fetchStudyPlans(Number(studentData.carreraId));
    } else {
      setStudyPlans([]);
    }
  }, [studentData.carreraId]);

  const fetchStudent = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/estudiantes/${studentId}`);
      const student: StudentData = response.data;

      if (student.persona) {
        setPersonData({
          ci: student.persona.ci || '',
          ci_issued: student.persona.ci_issued || '',
          nombres: student.persona.nombres || '',
          apellidoPaterno: student.persona.apellidoPaterno || '',
          apellidoMaterno: student.persona.apellidoMaterno || '',
          fechaNacimiento: student.persona.fechaNacimiento || '',
          lugarNacimiento: student.persona.lugarNacimiento || '',
          genero: student.persona.genero || '',
          estadoCivil: student.persona.estadoCivil || '',
          nacionalidad: student.persona.nacionalidad || 'Boliviana',
          telefono: student.persona.telefono || '',
          correo: student.persona.correo || '',
          direccion: student.persona.direccion || '',
        });
      }

      setStudentData({
        codigoInscripcion: student.codigoInscripcion || '',
        gestionAdmision: student.gestionAdmision || '',
        fechaAdmision: student.fechaAdmision || '',
        carreraId: student.carreraId || '',
        planEstudioId: student.planEstudioId || '',
        numeroFolder: student.numeroFolder || '',
        codigoFormulario01: student.codigoFormulario01 || '',
        numeroTituloBachiller: student.numeroTituloBachiller || '',
        fechaTituloBachiller: student.fechaTituloBachiller || '',
        estado: student.estado || 'activo',
      });
    } catch (error) {
      console.error('Error al cargar estudiante:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await api.get('/carreras/active');
      setCareers(response.data || []);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
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
      console.error('Error al cargar planes de estudio:', error);
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
        if (a.gestion.anio !== b.gestion.anio) return b.gestion.anio.localeCompare(a.gestion.anio);
        return a.periodo.numero.localeCompare(b.periodo.numero);
      }));
    } catch (error) {
      console.error('Error al cargar gestiones:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!personData.ci) newErrors.ci = 'CI es requerido';
    if (!personData.nombres) newErrors.nombres = 'Nombres es requerido';
    if (!personData.apellidoPaterno) newErrors.apellidoPaterno = 'Apellido paterno es requerido';
    if (!personData.apellidoMaterno) newErrors.apellidoMaterno = 'Apellido materno es requerido';
    if (!personData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!personData.genero) newErrors.genero = 'Género es requerido';

    if (!studentData.codigoInscripcion) newErrors.codigoInscripcion = 'Código de inscripción es requerido';
    if (!studentData.gestionAdmision) newErrors.gestionAdmision = 'Gestión de ingreso es requerida';
    if (!studentData.fechaAdmision) newErrors.fechaAdmision = 'Fecha de ingreso es requerida';
    if (!studentData.carreraId) newErrors.carreraId = 'Carrera es requerida';
    if (!studentData.planEstudioId) newErrors.planEstudioId = 'Plan de estudio es requerido';

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

      await api.patch(`/personas/${student.personaId}`, {
        ...personData,
        genero: personData.genero,
        estado: 'activo',
      });

      await api.patch(`/estudiantes/${studentId}`, {
        codigoInscripcion: studentData.codigoInscripcion,
        gestionAdmision: studentData.gestionAdmision,
        fechaAdmision: studentData.fechaAdmision,
        carreraId: Number(studentData.carreraId),
        planEstudioId: Number(studentData.planEstudioId),
        numeroFolder: studentData.numeroFolder || undefined,
        codigoFormulario01: studentData.codigoFormulario01 || undefined,
        numeroTituloBachiller: studentData.numeroTituloBachiller || undefined,
        fechaTituloBachiller: studentData.fechaTituloBachiller || undefined,
        estado: studentData.estado,
      });

      router.push('/estudiantes');
    } catch (error: any) {
      console.error('Error al actualizar estudiante:', error);
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
                  value={personData.nombres}
                  onChange={(e) => setPersonData({ ...personData, nombres: e.target.value })}
                  error={errors.nombres}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Paterno *"
                  value={personData.apellidoPaterno}
                  onChange={(e) => setPersonData({ ...personData, apellidoPaterno: e.target.value })}
                  error={errors.apellidoPaterno}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Materno *"
                  value={personData.apellidoMaterno}
                  onChange={(e) => setPersonData({ ...personData, apellidoMaterno: e.target.value })}
                  error={errors.apellidoMaterno}
                  placeholder="Gomez"
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Nacimiento *"
                  type="date"
                  value={personData.fechaNacimiento}
                  onChange={(e) => setPersonData({ ...personData, fechaNacimiento: e.target.value })}
                  error={errors.fechaNacimiento}
                />
              </div>
              <div>
                <Entrada
                  label="Lugar de Nacimiento"
                  value={personData.lugarNacimiento}
                  onChange={(e) => setPersonData({ ...personData, lugarNacimiento: e.target.value })}
                  placeholder="La Paz"
                />
              </div>
              <div>
                <Selector
                  label="Género *"
                  value={personData.genero}
                  onChange={(e) => setPersonData({ ...personData, genero: e.target.value })}
                  error={errors.genero}
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
                  value={personData.estadoCivil}
                  onChange={(e) => setPersonData({ ...personData, estadoCivil: e.target.value })}
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
                  value={personData.nacionalidad}
                  onChange={(e) => setPersonData({ ...personData, nacionalidad: e.target.value })}
                  placeholder="Boliviana"
                />
              </div>
              <div>
                <Entrada
                  label="Teléfono"
                  value={personData.telefono}
                  onChange={(e) => setPersonData({ ...personData, telefono: e.target.value })}
                  placeholder="71234567"
                />
              </div>
              <div>
                <Entrada
                  label="Correo Electrónico"
                  type="email"
                  value={personData.correo}
                  onChange={(e) => setPersonData({ ...personData, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Entrada
                  label="Dirección"
                  value={personData.direccion}
                  onChange={(e) => setPersonData({ ...personData, direccion: e.target.value })}
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
                  value={studentData.codigoInscripcion}
                  error={errors.codigoInscripcion}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Selector
                  label="Gestión de Ingreso *"
                  value={studentData.gestionAdmision}
                  onChange={(e) => setStudentData({ ...studentData, gestionAdmision: e.target.value })}
                  error={errors.gestionAdmision}
                  options={periodos.map(p => ({
                    value: `${p.gestion.anio}-${p.periodo.numero}`,
                    label: `${p.periodo.numero}/${p.gestion.anio}${p.periodo.estado === 'abierta' ? ' ★' : ''}`,
                  }))}
                  placeholder="Seleccionar período..."
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Ingreso *"
                  type="date"
                  value={studentData.fechaAdmision}
                  onChange={(e) => setStudentData({ ...studentData, fechaAdmision: e.target.value })}
                  error={errors.fechaAdmision}
                />
              </div>
              <div>
                <Selector
                  label="Carrera *"
                  value={String(studentData.carreraId)}
                  onChange={(e) => setStudentData({ ...studentData, carreraId: e.target.value, planEstudioId: '' })}
                  error={errors.carreraId}
                  options={careers.map(c => ({ value: c.id.toString(), label: c.nombre }))}
                  placeholder={loadingCareers ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={loadingCareers}
                />
              </div>
              <div>
                <Selector
                  label="Plan de Estudio *"
                  value={String(studentData.planEstudioId)}
                  onChange={(e) => setStudentData({ ...studentData, planEstudioId: e.target.value })}
                  error={errors.planEstudioId}
                  options={studyPlans.map(p => ({ value: p.id.toString(), label: `${p.numeroRm}` }))}
                  placeholder={loadingPlans ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={loadingPlans || !studentData.carreraId}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={studentData.estado}
                  onChange={(e) => setStudentData({ ...studentData, estado: e.target.value })}
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
                  value={studentData.numeroFolder}
                  onChange={(e) => setStudentData({ ...studentData, numeroFolder: e.target.value })}
                  placeholder="F-001"
                />
              </div>
              <div>
                <Entrada
                  label="Código Formulario 01"
                  value={studentData.codigoFormulario01}
                  onChange={(e) => setStudentData({ ...studentData, codigoFormulario01: e.target.value })}
                  placeholder="FORM01-2024-001"
                />
              </div>
              <div>
                <Entrada
                  label="Número de Título de Bachiller"
                  value={studentData.numeroTituloBachiller}
                  onChange={(e) => setStudentData({ ...studentData, numeroTituloBachiller: e.target.value })}
                  placeholder="123456"
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Título de Bachiller"
                  type="date"
                  value={studentData.fechaTituloBachiller}
                  onChange={(e) => setStudentData({ ...studentData, fechaTituloBachiller: e.target.value })}
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
