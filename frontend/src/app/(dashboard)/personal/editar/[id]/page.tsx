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

interface DatosStaff {
  id: number;
  personaId: number;
  profesion: string;
  cargo: string;
  fechaContrato: string;
  estado: string;
  persona?: {
    id: number;
    ci: string;
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

  const [staffData, setStaffData] = useState({
    profesion: '',
    cargo: '',
    fechaContrato: '',
    estado: 'activo',
  });

  const toUpper = (value: string) => value.toUpperCase();

  const isOtherDepartment = !DEPARTMENTS.includes(personData.lugarNacimiento);
  const isOtherNationality = !NATIONALITIES.includes(personData.nacionalidad);

  useEffect(() => {
    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  const fetchStaff = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/personal/${staffId}`);
      const staff: DatosStaff = response.data;

      if (staff.persona) {
        setPersonData({
          ci: staff.persona.ci || '',
          nombres: staff.persona.nombres || '',
          apellidoPaterno: staff.persona.apellidoPaterno || '',
          apellidoMaterno: staff.persona.apellidoMaterno || '',
          fechaNacimiento: staff.persona.fechaNacimiento || '',
          lugarNacimiento: staff.persona.lugarNacimiento || '',
          genero: staff.persona.genero || '',
          estadoCivil: staff.persona.estadoCivil || '',
          nacionalidad: staff.persona.nacionalidad || 'Boliviana',
          telefono: staff.persona.telefono || '',
          correo: staff.persona.correo || '',
          direccion: staff.persona.direccion || '',
        });
      }

      setStaffData({
        profesion: staff.profesion || '',
        cargo: staff.cargo || '',
        fechaContrato: staff.fechaContrato || '',
        estado: staff.estado || 'activo',
      });
    } catch (error) {
      console.error('Error al cargar personal:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!personData.ci) newErrors.ci = 'CI es requerido';
    if (!personData.nombres) newErrors.nombres = 'Nombres es requerido';
    if (!personData.apellidoPaterno) newErrors.apellidoPaterno = 'Apellido paterno es requerido';
    if (!personData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!personData.genero) newErrors.genero = 'Género es requerido';

    if (!staffData.cargo) newErrors.cargo = 'Cargo es requerido';
    if (!staffData.fechaContrato) newErrors.fechaContrato = 'Fecha de contrato es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const staffResponse = await api.get(`/personal/${staffId}`);
      const staff: DatosStaff = staffResponse.data;

      const finalLugarNacimiento = isOtherDepartment ? personData.lugarNacimiento : personData.lugarNacimiento;
      const finalNacionalidad = isOtherNationality ? personData.nacionalidad : personData.nacionalidad;

      await api.patch(`/personas/${staff.personaId}`, {
        ci: personData.ci,
        nombres: personData.nombres,
        apellidoPaterno: personData.apellidoPaterno,
        apellidoMaterno: personData.apellidoMaterno,
        fechaNacimiento: personData.fechaNacimiento,
        lugarNacimiento: finalLugarNacimiento,
        genero: personData.genero,
        estadoCivil: personData.estadoCivil || undefined,
        nacionalidad: finalNacionalidad,
        telefono: personData.telefono || undefined,
        correo: personData.correo || undefined,
        direccion: personData.direccion || undefined,
        estado: 'activo',
      });

      await api.patch(`/personal/${staffId}`, {
        profesion: staffData.profesion || undefined,
        cargo: staffData.cargo,
        fechaContrato: staffData.fechaContrato,
        estado: staffData.estado,
      });

      router.push('/personal');
    } catch (error: any) {
      console.error('Error al actualizar personal:', error);
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
                  value={isOtherDepartment ? 'Otra' : personData.lugarNacimiento}
                  onChange={(e) => {
                    setPersonData({
                      ...personData,
                      lugarNacimiento: e.target.value === 'Otra' ? '' : e.target.value
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
                    value={personData.lugarNacimiento}
                    onChange={(e) => setPersonData({ ...personData, lugarNacimiento: toUpper(e.target.value) })}
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
                <div className="flex flex-wrap gap-4">
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Viuda(o)"
                      checked={personData.estadoCivil === 'Viuda(o)'}
                      onChange={(e) => setPersonData({ ...personData, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Viudo(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Divorciada(o)"
                      checked={personData.estadoCivil === 'Divorciada(o)'}
                      onChange={(e) => setPersonData({ ...personData, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Divorciado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  label="Nacionalidad"
                  value={isOtherNationality ? 'Otra' : personData.nacionalidad}
                  onChange={(e) => {
                    setPersonData({
                      ...personData,
                      nacionalidad: e.target.value === 'Otra' ? '' : e.target.value
                    });
                  }}
                  options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                />
              </div>
              {isOtherNationality && (
                <div>
                  <Entrada
                    label="Especificar nacionalidad"
                    value={personData.nacionalidad}
                    onChange={(e) => setPersonData({ ...personData, nacionalidad: toUpper(e.target.value) })}
                    placeholder="Ingrese la nacionalidad"
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
            <TituloTarjeta>Datos del Personal</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  label="Profesión"
                  value={staffData.profesion}
                  onChange={(e) => setStaffData({ ...staffData, profesion: e.target.value })}
                  placeholder="Ingeniero de Sistemas"
                />
              </div>
              <div>
                <Selector
                  label="Cargo *"
                  value={staffData.cargo}
                  onChange={(e) => setStaffData({ ...staffData, cargo: e.target.value })}
                  error={errors.cargo}
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
                  value={staffData.fechaContrato}
                  onChange={(e) => setStaffData({ ...staffData, fechaContrato: e.target.value })}
                  error={errors.fechaContrato}
                />
              </div>
              <div>
                <Selector
                  label="Estado"
                  value={staffData.estado}
                  onChange={(e) => setStaffData({ ...staffData, estado: e.target.value })}
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
