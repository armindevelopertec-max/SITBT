'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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

  const [staffData, setStaffData] = useState({
    profession: '',
    position: '',
    hire_date: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!personData.ci) newErrors.ci = 'CI es requerido';
    if (!personData.names) newErrors.names = 'Nombres es requerido';
    if (!personData.lastname_paternal) newErrors.lastname_paternal = 'Apellido paterno es requerido';
    if (!personData.lastname_maternal) newErrors.lastname_maternal = 'Apellido materno es requerido';
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
      const personPayload = {
        ...personData,
        gender: personData.gender,
        status: 'activo',
      };

      const personResponse = await api.post('/personas', personPayload);
      const personId = personResponse.data.id;

      const staffPayload = {
        person_id: personId,
        profession: staffData.profession || undefined,
        position: staffData.position,
        hire_date: staffData.hire_date,
        status: 'activo',
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Personal', href: '/personal' },
          { label: 'Nuevo Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Personal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Cédula de Identidad *"
                  value={personData.ci}
                  onChange={(e) => setPersonData({ ...personData, ci: e.target.value })}
                  error={errors.ci}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Input
                  label="Extensión CI"
                  value={personData.ci_issued}
                  onChange={(e) => setPersonData({ ...personData, ci_issued: e.target.value })}
                  placeholder="LP, CB, SC..."
                />
              </div>
              <div>
                <Input
                  label="Nombres *"
                  value={personData.names}
                  onChange={(e) => setPersonData({ ...personData, names: e.target.value })}
                  error={errors.names}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Input
                  label="Apellido Paterno *"
                  value={personData.lastname_paternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_paternal: e.target.value })}
                  error={errors.lastname_paternal}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Input
                  label="Apellido Materno *"
                  value={personData.lastname_maternal}
                  onChange={(e) => setPersonData({ ...personData, lastname_maternal: e.target.value })}
                  error={errors.lastname_maternal}
                  placeholder="Gomez"
                />
              </div>
              <div>
                <Input
                  label="Fecha de Nacimiento *"
                  type="date"
                  value={personData.birthdate}
                  onChange={(e) => setPersonData({ ...personData, birthdate: e.target.value })}
                  error={errors.birthdate}
                />
              </div>
              <div>
                <Input
                  label="Lugar de Nacimiento"
                  value={personData.birthplace}
                  onChange={(e) => setPersonData({ ...personData, birthplace: e.target.value })}
                  placeholder="La Paz"
                />
              </div>
              <div>
                <Select
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
                <Select
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
                <Input
                  label="Nacionalidad"
                  value={personData.nationality}
                  onChange={(e) => setPersonData({ ...personData, nationality: e.target.value })}
                  placeholder="Boliviana"
                />
              </div>
              <div>
                <Input
                  label="Teléfono"
                  value={personData.phone}
                  onChange={(e) => setPersonData({ ...personData, phone: e.target.value })}
                  placeholder="71234567"
                />
              </div>
              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={personData.email}
                  onChange={(e) => setPersonData({ ...personData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Input
                  label="Dirección"
                  value={personData.address}
                  onChange={(e) => setPersonData({ ...personData, address: e.target.value })}
                  placeholder="Av. 16 de Julio, La Paz"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Datos del Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Profesión"
                  value={staffData.profession}
                  onChange={(e) => setStaffData({ ...staffData, profession: e.target.value })}
                  placeholder="Ingeniero de Sistemas"
                />
              </div>
              <div>
                <Select
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
                <Input
                  label="Fecha de Contrato *"
                  type="date"
                  value={staffData.hire_date}
                  onChange={(e) => setStaffData({ ...staffData, hire_date: e.target.value })}
                  error={errors.hire_date}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
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
          </Button>
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
              <Button onClick={() => {
                setCredentialsModal(null);
                router.push('/personal');
              }}>
                Entendido
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
