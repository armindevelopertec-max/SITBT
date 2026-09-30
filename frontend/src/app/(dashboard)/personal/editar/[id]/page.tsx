'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const [staffData, setStaffData] = useState({
    profession: '',
    position: '',
    hire_date: '',
    status: 'activo',
  });

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
          ci_issued: staff.persona.ci_issued || '',
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
      const staffResponse = await api.get(`/personal/${staffId}`);
      const staff: StaffData = staffResponse.data;

      await api.patch(`/personas/${staff.person_id}`, {
        ...personData,
        gender: personData.gender,
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Personal', href: '/personal' },
          { label: 'Editar Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Personal</h1>
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
              <div>
                <Select
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
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
