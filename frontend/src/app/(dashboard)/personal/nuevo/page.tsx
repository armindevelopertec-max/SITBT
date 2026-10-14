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

  const [staffData, setStaffData] = useState({
    profesion: '',
    cargo: '',
    fechaContrato: '',
  });

  const toUpper = (value: string) => value.toUpperCase();

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
      const finalLugarNacimiento = personData.lugarNacimiento === 'Otra' && personData.lugarNacimientoOtro
        ? personData.lugarNacimientoOtro
        : personData.lugarNacimiento;
      const finalNacionalidad = personData.nacionalidad === 'Otra' && personData.nacionalidadOtra
        ? personData.nacionalidadOtra
        : personData.nacionalidad;

      const personPayload = {
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
      };

      const personResponse = await api.post('/personas', personPayload);
      const personId = personResponse.data.id;

      const staffPayload = {
        personaId: personId,
        profesion: staffData.profesion || undefined,
        cargo: staffData.cargo,
        fechaContrato: staffData.fechaContrato,
        estado: 'activo',
      };

      const response = await api.post('/personal', staffPayload);

      if (response.data.user) {
        setCredentialsModal(response.data.user);
      } else {
        router.push('/personal');
      }
    } catch (error: any) {
      console.error('Error al crear personal:', error);
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
                  value={personData.lugarNacimiento}
                  onChange={(e) => {
                    setPersonData({ ...personData, lugarNacimiento: e.target.value, lugarNacimientoOtro: '' });
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
                    label="Especificar lugar"
                    value={personData.lugarNacimientoOtro}
                    onChange={(e) => setPersonData({ ...personData, lugarNacimientoOtro: toUpper(e.target.value) })}
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
                  value={personData.nacionalidad}
                  onChange={(e) => {
                    setPersonData({ ...personData, nacionalidad: e.target.value, nacionalidadOtra: '' });
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
                    value={personData.nacionalidadOtra}
                    onChange={(e) => setPersonData({ ...personData, nacionalidadOtra: toUpper(e.target.value) })}
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
