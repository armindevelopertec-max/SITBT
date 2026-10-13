'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2, Star, User, Key } from 'lucide-react';

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

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [careers, setCareers] = useState<Carrera[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [credentialsModal, setCredentialsModal] = useState<{ username: string; password: string } | null>(null);

  const [personData, setPersonData] = useState({
    ci: '',
    names: '',
    lastname_paternal: '',
    lastname_maternal: '',
    birthdate: '',
    birthplace: '',
    birthplace_other: '',
    gender: '',
    marital_estado: '',
    nationality: 'Boliviana',
    nationality_other: '',
    phone: '',
    email: '',
    address: '',
  });

  const [studentData, setStudentData] = useState({

    admission_gestion: new Date().getFullYear().toString(),
    admission_date: '',
    career_id: '',
    study_plan_id: '',
    folder_number: '',
    form01_code: '',
    bachelor_title_number: '',
    bachelor_title_date: '',
  });

  const toUpper = (value: string) => value.toUpperCase();

  useEffect(() => {
    fetchCareers();
    fetchGestiones();
  }, []);

  useEffect(() => {
    if (studentData.career_id) {
      fetchStudyPlans(Number(studentData.career_id));
    } else {
      setStudyPlans([]);
    }
  }, [studentData.career_id]);

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
    if (!personData.birthdate) newErrors.birthdate = 'Fecha de nacimiento es requerida';
    if (!personData.gender) newErrors.gender = 'Género es requerido';

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
      const personPayload = {
        ...personData,
        gender: personData.gender,
        estado: 'activo',
      };

      const personResponse = await api.post('/personas', personPayload);
      const personId = personResponse.data.id;

      const studentPayload = {
        person_id: personId,
        admission_gestion: studentData.admission_gestion,
        admission_date: studentData.admission_date,
        career_id: Number(studentData.career_id),
        study_plan_id: Number(studentData.study_plan_id),
        folder_number: studentData.folder_number || undefined,
        form01_code: studentData.form01_code || undefined,
        bachelor_title_number: studentData.bachelor_title_number || undefined,
        bachelor_title_date: studentData.bachelor_title_date || undefined,
        estado: 'activo',
      };

      const response = await api.post('/estudiantes', studentPayload);

      if (response.data.user) {
        setCredentialsModal(response.data.user);
      } else {
        router.push('/estudiantes');
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al crear el estudiante' });
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
          { label: 'Estudiantes', href: '/estudiantes' },
          { label: 'Nuevo Estudiante' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Estudiante</h1>
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
                  onChange={(e) => setPersonData({ ...personData, ci: toUpper(e.target.value) })}
                  error={errors.ci}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Entrada
                  label="Nombres *"
                  value={personData.names}
                  onChange={(e) => setPersonData({ ...personData, names: toUpper(e.target.value) })}
                  error={errors.names}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Paterno *"
                  value={personData.lastname_paternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_paternal: toUpper(e.target.value) })}
                  error={errors.lastname_paternal}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Materno"
                  value={personData.lastname_maternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_maternal: toUpper(e.target.value) })}
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
                <Selector
                  label="Lugar de Nacimiento"
                  value={personData.birthplace}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPersonData({ ...personData, birthplace: value });
                  }}
                  options={[
                    { value: '', label: 'Seleccionar' },
                    { value: 'La Paz', label: 'La Paz' },
                    { value: 'Cochabamba', label: 'Cochabamba' },
                    { value: 'Santa Cruz', label: 'Santa Cruz' },
                    { value: 'Oruro', label: 'Oruro' },
                    { value: 'Potosí', label: 'Potosí' },
                    { value: 'Tarija', label: 'Tarija' },
                    { value: 'Chuquisaca', label: 'Chuquisaca' },
                    { value: 'Beni', label: 'Beni' },
                    { value: 'Pando', label: 'Pando' },
                    { value: 'Otra', label: 'Otra' },
                  ]}
                />
              </div>
              {personData.birthplace === 'Otra' && (
                <div>
                  <Entrada
                    label="Especificar lugar de nacimiento"
                    value={personData.birthplace_other || ''}
                    onChange={(e) => setPersonData({ ...personData, birthplace_other: toUpper(e.target.value) })}
                    placeholder="Ingrese el lugar de nacimiento"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={personData.gender === 'M'}
                      onChange={(e) => setPersonData({ ...personData, gender: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={personData.gender === 'F'}
                      onChange={(e) => setPersonData({ ...personData, gender: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Femenino</span>
                  </label>
                </div>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_status"
                      value="Soltera(o)"
                      checked={personData.marital_status === 'Soltera(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_status: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_status"
                      value="Casada(o)"
                      checked={personData.marital_status === 'Casada(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_status: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Casado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  label="Nacionalidad"
                  value={personData.nationality}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPersonData({ ...personData, nationality: value });
                  }}
                  options={[
                    { value: 'Boliviana', label: 'Boliviana' },
                    { value: 'Argentina', label: 'Argentina' },
                    { value: 'Peruana', label: 'Peruana' },
                    { value: 'Chilena', label: 'Chilena' },
                    { value: 'Brasileña', label: 'Brasileña' },
                    { value: 'Colombiana', label: 'Colombiana' },
                    { value: 'Venezolana', label: 'Venezolana' },
                    { value: 'Española', label: 'Española' },
                    { value: 'Otra', label: 'Otra' },
                  ]}
                />
              </div>
              {personData.nationality === 'Otra' && (
                <div>
                  <Entrada
                    label="Especificar nacionalidad"
                    value={personData.nationality_other || ''}
                    onChange={(e) => setPersonData({ ...personData, nationality_other: toUpper(e.target.value) })}
                    placeholder="Ingrese su nacionalidad"
                  />
                </div>
              )}
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
                  onChange={(e) => setPersonData({ ...personData, address: toUpper(e.target.value) })}
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
                  value={studentData.career_id}
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
                  value={studentData.study_plan_id}
                  onChange={(e) => setStudentData({ ...studentData, study_plan_id: e.target.value })}
                  error={errors.study_plan_id}
                  options={studyPlans.map(p => ({ value: p.id.toString(), label: `${p.rm_number}` }))}
                  placeholder={loadingPlans ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={loadingPlans || !studentData.career_id}
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
                Guardar Estudiante
              </>
            )}
          </Boton>
        </div>
      </form>

      {credentialsModal && (
        <Modal open={!!credentialsModal} onClose={() => {
          setCredentialsModal(null);
          router.push('/estudiantes');
        }} title="Usuario Creado" size="md">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              El estudiante ha sido registrado exitosamente. A continuación encontrará las credenciales de acceso al sistema:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nombre de usuario</p>
                  <p className="font-mono font-medium">{credentialsModal.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Contraseña temporal</p>
                  <p className="font-mono font-medium">{credentialsModal.password}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ Se recomienda que el estudiante cambie su contraseña después de iniciar sesión.
            </p>
            <div className="flex justify-end">
              <Boton onClick={() => {
                setCredentialsModal(null);
                router.push('/estudiantes');
              }}>
                Entendido
              </Boton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
