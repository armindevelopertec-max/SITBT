'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2, User, Key } from 'lucide-react';

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const [staffData, setStaffData] = useState({
    profession: '',
    position: '',
    hire_date: '',
  });

  const toUpper = (value: string) => value.toUpperCase();

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
      const finalBirthplace = personData.birthplace === 'Otra' && personData.birthplace_other
        ? personData.birthplace_other
        : personData.birthplace;
      const finalNationality = personData.nationality === 'Otra' && personData.nationality_other
        ? personData.nationality_other
        : personData.nationality;

      const personPayload = {
        ci: personData.ci,
        names: personData.names,
        lastname_paternal: personData.lastname_paternal,
        lastname_maternal: personData.lastname_maternal,
        birthdate: personData.birthdate,
        birthplace: finalBirthplace,
        gender: personData.gender,
        marital_estado: personData.marital_estado || undefined,
        nationality: finalNationality,
        phone: personData.phone || undefined,
        email: personData.email || undefined,
        address: personData.address || undefined,
        estado: 'activo',
      };

      const personResponse = await api.post('/personas', personPayload);
      const personId = personResponse.data.id;

      const staffPayload = {
        person_id: personId,
        profession: staffData.profession || undefined,
        position: staffData.position,
        hire_date: staffData.hire_date,
        estado: 'activo',
      };

      const response = await api.post('/personal', staffPayload);

      if (response.data.user) {
        setCredentialsModal(response.data.user);
      } else {
        router.push('/personal');
      }
    } catch (error: any) {
      console.error('Error creating staff:', error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Error al crear el personal' });
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
          { label: 'Personal', href: '/personal' },
          { label: 'Nuevo Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Personal</h1>
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
                  value={personData.birthplace}
                  onChange={(e) => {
                    setPersonData({ ...personData, birthplace: e.target.value, birthplace_other: '' });
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
                    label="Especificar lugar"
                    value={personData.birthplace_other}
                    onChange={(e) => setPersonData({ ...personData, birthplace_other: toUpper(e.target.value) })}
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
                      name="marital_estado"
                      value="Soltera(o)"
                      checked={personData.marital_estado === 'Soltera(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_estado: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_estado"
                      value="Casada(o)"
                      checked={personData.marital_estado === 'Casada(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_estado: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Casado(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_estado"
                      value="Viuda(o)"
                      checked={personData.marital_estado === 'Viuda(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_estado: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Viudo(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="marital_estado"
                      value="Divorciada(o)"
                      checked={personData.marital_estado === 'Divorciada(o)'}
                      onChange={(e) => setPersonData({ ...personData, marital_estado: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Divorciado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  label="Nacionalidad"
                  value={personData.nationality}
                  onChange={(e) => {
                    setPersonData({ ...personData, nationality: e.target.value, nationality_other: '' });
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
                    value={personData.nationality_other}
                    onChange={(e) => setPersonData({ ...personData, nationality_other: toUpper(e.target.value) })}
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
                Guardar Personal
              </>
            )}
          </Boton>
        </div>
      </form>

      {credentialsModal && (
        <Modal open={!!credentialsModal} onClose={() => {
          setCredentialsModal(null);
          router.push('/personal');
        }} title="Usuario Creado" size="md">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              El personal ha sido registrado exitosamente. A continuación encontrará las credenciales de acceso al sistema:
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
              ⚠️ Se recomienda que el usuario cambie su contraseña después de iniciar sesión.
            </p>
            <div className="flex justify-end">
              <Boton onClick={() => {
                setCredentialsModal(null);
                router.push('/personal');
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
