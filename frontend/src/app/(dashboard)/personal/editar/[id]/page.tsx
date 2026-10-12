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

interface StaffData {
  id: number;
  person_id: number;
  profession: string;
  position: string;
  hire_date: string;
  status: string;
  persona?: {
    id: number;
    ci: string;
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

const DEPARTMENTS = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Tarija', 'Chuquisaca', 'Beni', 'Pando'];

const NATIONALITIES = [
  'Boliviana', 'Argentina', 'Peruana', 'Chilena', 'Brasileña', 'Colombiana', 'Venezolana', 'Española', 'Otra'
];

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personData, setPersonData] = useState({
    ci: '',
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

  const [staffData, setStaffData] = useState({
    profession: '',
    position: '',
    hire_date: '',
    status: 'activo',
  });

  const toUpper = (value: string) => value.toUpperCase();

  const isOtherDepartment = !DEPARTMENTS.includes(personData.birthplace);
  const isOtherNationality = !NATIONALITIES.includes(personData.nationality);

  useEffect(() => {
    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  const fetchStaff = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/personal/${staffId}`);
      const staff: StaffData = response.data;

      if (staff.persona) {
        setPersonData({
          ci: staff.persona.ci || '',
          names: staff.persona.names || '',
          lastname_paternal: staff.persona.lastname_paternal || '',
          lastname_maternal: staff.persona.lastname_maternal || '',
          birthdate: staff.persona.birthdate || '',
          birthplace: staff.persona.birthplace || '',
          gender: staff.persona.gender || '',
          marital_status: staff.persona.marital_status || '',
          nationality: staff.persona.nationality || 'Boliviana',
          phone: staff.persona.phone || '',
          email: staff.persona.email || '',
          address: staff.persona.address || '',
        });
      }

      setStaffData({
        profession: staff.profession || '',
        position: staff.position || '',
        hire_date: staff.hire_date || '',
        status: staff.status || 'activo',
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!personData.ci) newErrors.ci = 'CI es requerido';
    if (!personData.names) newErrors.names = 'Nombres es requerido';
    if (!personData.lastname_paternal) newErrors.lastname_paternal = 'Apellido paterno es requerido';
    if (!personData.birthdate) newErrors.birthdate = 'Fecha de nacimiento es requerida';
    if (!personData.gender) newErrors.gender = 'Género es requerido';

    if (!staffData.position) newErrors.position = 'Cargo es requerido';
    if (!staffData.hire_date) newErrors.hire_date = 'Fecha de contrato es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const staffResponse = await api.get(`/personal/${staffId}`);
      const staff: StaffData = staffResponse.data;

      const finalBirthplace = isOtherDepartment ? personData.birthplace : personData.birthplace;
      const finalNationality = isOtherNationality ? personData.nationality : personData.nationality;

      await api.patch(`/personas/${staff.person_id}`, {
        ci: personData.ci,
        names: personData.names,
        lastname_paternal: personData.lastname_paternal,
        lastname_maternal: personData.lastname_maternal,
        birthdate: personData.birthdate,
        birthplace: finalBirthplace,
        gender: personData.gender,
        marital_status: personData.marital_status || undefined,
        nationality: finalNationality,
        phone: personData.phone || undefined,
        email: personData.email || undefined,
        address: personData.address || undefined,
        status: 'activo',
      });

      await api.patch(`/personal/${staffId}`, {
        profession: staffData.profession || undefined,
        position: staffData.position,
        hire_date: staffData.hire_date,
        status: staffData.status,
      });

      router.push('/personal');
    } catch (error: any) {
      console.error('Error updating staff:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al actualizar el personal' });
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
          { label: 'Personal', href: '/personal' },
          { label: 'Editar Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Personal</h1>
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
                  value={isOtherDepartment ? 'Otra' : personData.birthplace}
                  onChange={(e) => {
                    setPersonData({
                      ...personData,
                      birthplace: e.target.value === 'Otra' ? '' : e.target.value
                    });
                  }}
                  options={[
                    { value: '', label: 'Seleccionar' },
                    ...DEPARTMENTS.map(d => ({ value: d, label: d })),
                    { value: 'Otra', label: 'Otra' },
                  ]}
                />
              </div>
              {isOtherDepartment && (
                <div>
                  <Entrada
                    label="Especificar lugar"
                    value={personData.birthplace}
                    onChange={(e) => setPersonData({ ...personData, birthplace: toUpper(e.target.value) })}
                    placeholder="Ingrese el lugar"
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
                <div className="flex flex-wrap gap-4">
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_status"
                      value="Viuda(o)"
                      checked={personData.marital_status === 'Viuda(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_status: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Viudo(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_status"
                      value="Divorciada(o)"
                      checked={personData.marital_status === 'Divorciada(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_status: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Divorciado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  label="Nacionalidad"
                  value={isOtherNationality ? 'Otra' : personData.nationality}
                  onChange={(e) => {
                    setPersonData({
                      ...personData,
                      nationality: e.target.value === 'Otra' ? '' : e.target.value
                    });
                  }}
                  options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                />
              </div>
              {isOtherNationality && (
                <div>
                  <Entrada
                    label="Especificar nacionalidad"
                    value={personData.nationality}
                    onChange={(e) => setPersonData({ ...personData, nationality: toUpper(e.target.value) })}
                    placeholder="Ingrese la nacionalidad"
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
            <TituloTarjeta>Datos del Personal</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  label="Profesión"
                  value={staffData.profession}
                  onChange={(e) => setStaffData({ ...staffData, profession: e.target.value })}
                  placeholder="Ingeniero de Sistemas"
                />
              </div>
              <div>
                <Selector
                  label="Cargo *"
                  value={staffData.position}
                  onChange={(e) => setStaffData({ ...staffData, position: e.target.value })}
                  error={errors.position}
                  options={[
                    { value: 'docente', label: 'Docente' },
                    { value: 'secretaria', label: 'Secretaria' },
                    { value: 'director_academico', label: 'Director Académico' },
                    { value: 'rector', label: 'Rector' },
                    { value: 'apoyo', label: 'Personal de Apoyo' },
                    { value: 'bibliotecario', label: 'Bibliotecario' },
                  ]}
                  placeholder="Seleccionar cargo..."
                />
              </div>
              <div>
                <Entrada
                  label="Fecha de Contrato *"
                  type="date"
                  value={staffData.hire_date}
                  onChange={(e) => setStaffData({ ...staffData, hire_date: e.target.value })}
                  error={errors.hire_date}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={staffData.status}
                  onChange={(e) => setStaffData({ ...staffData, status: e.target.value })}
                  options={[
                    { value: 'activo', label: 'Activo' },
                    { value: 'inactivo', label: 'Inactivo' },
                    { value: 'licencia', label: 'Licencia' },
                  ]}
                  placeholder="Seleccionar estado..."
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
