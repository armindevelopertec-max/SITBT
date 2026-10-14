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

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [careers, setCareers] = useState<Carrera[]>([]);
  const [studyPlans, setStudyPlans] = useState<PlanEstudio[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [credentialsModal, setCredentialsModal] = useState<{ nombreUsuario: string; password: string } | null>(null);

  const [personData, setPersonData] = useState({
    ci: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    lugarNacimientoOtro: '',
    genero: '',
    estadoCivil: '',
    nacionalidad: 'Boliviana',
    nacionalidadOtra: '',
    telefono: '',
    correo: '',
    direccion: '',
  });

  const [studentData, setStudentData] = useState({

    gestionAdmision: new Date().getFullYear().toString(),
    fechaAdmision: '',
    carreraId: '',
    planEstudioId: '',
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
  });

  const toUpper = (value: string) => value.toUpperCase();

  useEffect(() => {
    fetchCareers();
    fetchGestiones();
  }, []);

  useEffect(() => {
    if (studentData.carreraId) {
      fetchStudyPlans(Number(studentData.carreraId));
    } else {
      setStudyPlans([]);
    }
  }, [studentData.carreraId]);

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
    if (!personData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!personData.genero) newErrors.genero = 'Género es requerido';

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
      const personPayload = {
        ...personData,
        genero: personData.genero,
        estado: 'activo',
      };

      const personResponse = await api.post('/personas', personPayload);
      const personId = personResponse.data.id;

      const studentPayload = {
        personaId: personId,
        gestionAdmision: studentData.gestionAdmision,
        fechaAdmision: studentData.fechaAdmision,
        carreraId: Number(studentData.carreraId),
        planEstudioId: Number(studentData.planEstudioId),
        numeroFolder: studentData.numeroFolder || undefined,
        codigoFormulario01: studentData.codigoFormulario01 || undefined,
        numeroTituloBachiller: studentData.numeroTituloBachiller || undefined,
        fechaTituloBachiller: studentData.fechaTituloBachiller || undefined,
        estado: 'activo',
      };

      const response = await api.post('/estudiantes', studentPayload);

      if (response.data.user) {
        setCredentialsModal(response.data.user);
      } else {
        router.push('/estudiantes');
      }
    } catch (error: any) {
      console.error('Error al crear estudiante:', error);
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
                  value={personData.nombres}
                  onChange={(e) => setPersonData({ ...personData, nombres: toUpper(e.target.value) })}
                  error={errors.nombres}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Paterno *"
                  value={personData.apellidoPaterno}
                  onChange={(e) => setPersonData({ ...personData, apellidoPaterno: toUpper(e.target.value) })}
                  error={errors.apellidoPaterno}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  label="Apellido Materno"
                  value={personData.apellidoMaterno}
                  onChange={(e) => setPersonData({ ...personData, apellidoMaterno: toUpper(e.target.value) })}
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
                <Selector
                  label="Lugar de Nacimiento"
                  value={personData.lugarNacimiento}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPersonData({ ...personData, lugarNacimiento: value });
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
              {personData.lugarNacimiento === 'Otra' && (
                <div>
                  <Entrada
                    label="Especificar lugar de nacimiento"
                    value={personData.lugarNacimientoOtro || ''}
                    onChange={(e) => setPersonData({ ...personData, lugarNacimientoOtro: toUpper(e.target.value) })}
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
                      name="genero"
                      value="M"
                      checked={personData.genero === 'M'}
                      onChange={(e) => setPersonData({ ...personData, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="F"
                      checked={personData.genero === 'F'}
                      onChange={(e) => setPersonData({ ...personData, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Femenino</span>
                  </label>
                </div>
                {errors.genero && <p className="text-xs text-red-500 mt-1">{errors.genero}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Soltera(o)"
                      checked={personData.estadoCivil === 'Soltera(o)'}
                      onChange={(e) => setPersonData({ ...personData, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Casada(o)"
                      checked={personData.estadoCivil === 'Casada(o)'}
                      onChange={(e) => setPersonData({ ...personData, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Casado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  label="Nacionalidad"
                  value={personData.nacionalidad}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPersonData({ ...personData, nacionalidad: value });
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
              {personData.nacionalidad === 'Otra' && (
                <div>
                  <Entrada
                    label="Especificar nacionalidad"
                    value={personData.nacionalidadOtra || ''}
                    onChange={(e) => setPersonData({ ...personData, nacionalidadOtra: toUpper(e.target.value) })}
                    placeholder="Ingrese su nacionalidad"
                  />
                </div>
              )}
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
                  onChange={(e) => setPersonData({ ...personData, direccion: toUpper(e.target.value) })}
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
                  value={studentData.carreraId}
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
                  value={studentData.planEstudioId}
                  onChange={(e) => setStudentData({ ...studentData, planEstudioId: e.target.value })}
                  error={errors.planEstudioId}
                  options={studyPlans.map(p => ({ value: p.id.toString(), label: `${p.numeroRm}` }))}
                  placeholder={loadingPlans ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={loadingPlans || !studentData.carreraId}
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
                  <p className="font-mono font-medium">{credentialsModal.nombreUsuario}</p>
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
