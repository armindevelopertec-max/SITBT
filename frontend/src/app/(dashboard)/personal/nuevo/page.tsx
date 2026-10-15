'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Modal } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { ArrowLeft, Save, Loader2, User, Key } from 'lucide-react';

export default function PaginaNuevoPersonal() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [modalCredenciales, setModalCredenciales] = useState<{ nombreUsuario: string; contrasena: string } | null>(null);

  const [datosPersona, setDatosPersona] = useState({
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

  const [datosPersonal, setDatosPersonal] = useState({
    profesion: '',
    cargo: '',
    fechaContrato: '',
  });

  const aMayusculas = (value: string) => value.toUpperCase();

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosPersona.ci) nuevosErrores.ci = 'CI es requerido';
    if (!datosPersona.nombres) nuevosErrores.nombres = 'Nombres es requerido';
    if (!datosPersona.apellidoPaterno) nuevosErrores.apellidoPaterno = 'Apellido paterno es requerido';
    if (!datosPersona.fechaNacimiento) nuevosErrores.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!datosPersona.genero) nuevosErrores.genero = 'Género es requerido';

    if (!datosPersonal.cargo) nuevosErrores.cargo = 'Cargo es requerido';
    if (!datosPersonal.fechaContrato) nuevosErrores.fechaContrato = 'Fecha de contrato es requerida';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const lugarNacimientoFinal = datosPersona.lugarNacimiento === 'Otra' && datosPersona.lugarNacimientoOtro
        ? datosPersona.lugarNacimientoOtro
        : datosPersona.lugarNacimiento;
      const nacionalidadFinal = datosPersona.nacionalidad === 'Otra' && datosPersona.nacionalidadOtra
        ? datosPersona.nacionalidadOtra
        : datosPersona.nacionalidad;

      const cuerpoPersona = {
        ci: datosPersona.ci,
        nombres: datosPersona.nombres,
        apellidoPaterno: datosPersona.apellidoPaterno,
        apellidoMaterno: datosPersona.apellidoMaterno,
        fechaNacimiento: datosPersona.fechaNacimiento,
        lugarNacimiento: lugarNacimientoFinal,
        genero: datosPersona.genero,
        estadoCivil: datosPersona.estadoCivil || undefined,
        nacionalidad: nacionalidadFinal,
        telefono: datosPersona.telefono || undefined,
        correo: datosPersona.correo || undefined,
        direccion: datosPersona.direccion || undefined,
        estado: 'activo',
      };

      const respuestaPersona = await api.post('/personas', cuerpoPersona);
      const idPersona = respuestaPersona.data.id;

      const cuerpoPersonal = {
        personaId: idPersona,
        profesion: datosPersonal.profesion || undefined,
        cargo: datosPersonal.cargo,
        fechaContrato: datosPersonal.fechaContrato,
        estado: 'activo',
      };

      const respuesta = await api.post('/personal', cuerpoPersonal);

      if (respuesta.data.usuario) {
        setModalCredenciales(respuesta.data.usuario);
      } else {
        router.push('/personal');
      }
    } catch (error: any) {
      console.error('Error al crear personal:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al crear el personal' });
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Personal', href: '/personal' },
          { etiqueta: 'Nuevo Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Personal</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos Personales</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  etiqueta="Cédula de Identidad *"
                  value={datosPersona.ci}
                  onChange={(e) => setDatosPersona({ ...datosPersona, ci: aMayusculas(e.target.value) })}
                  error={errores.ci}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Nombres *"
                  value={datosPersona.nombres}
                  onChange={(e) => setDatosPersona({ ...datosPersona, nombres: aMayusculas(e.target.value) })}
                  error={errores.nombres}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Apellido Paterno *"
                  value={datosPersona.apellidoPaterno}
                  onChange={(e) => setDatosPersona({ ...datosPersona, apellidoPaterno: aMayusculas(e.target.value) })}
                  error={errores.apellidoPaterno}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Apellido Materno"
                  value={datosPersona.apellidoMaterno}
                  onChange={(e) => setDatosPersona({ ...datosPersona, apellidoMaterno: aMayusculas(e.target.value) })}
                  placeholder="Gomez"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Fecha de Nacimiento *"
                  type="date"
                  value={datosPersona.fechaNacimiento}
                  onChange={(e) => setDatosPersona({ ...datosPersona, fechaNacimiento: e.target.value })}
                  error={errores.fechaNacimiento}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Lugar de Nacimiento"
                  value={datosPersona.lugarNacimiento}
                  onChange={(e) => {
                    setDatosPersona({ ...datosPersona, lugarNacimiento: e.target.value, lugarNacimientoOtro: '' });
                  }}
                  opciones={[
                    { value: '', etiqueta: 'Seleccionar' },
                    { value: 'La Paz', etiqueta: 'La Paz' },
                    { value: 'Cochabamba', etiqueta: 'Cochabamba' },
                    { value: 'Santa Cruz', etiqueta: 'Santa Cruz' },
                    { value: 'Oruro', etiqueta: 'Oruro' },
                    { value: 'Potosí', etiqueta: 'Potosí' },
                    { value: 'Tarija', etiqueta: 'Tarija' },
                    { value: 'Chuquisaca', etiqueta: 'Chuquisaca' },
                    { value: 'Beni', etiqueta: 'Beni' },
                    { value: 'Pando', etiqueta: 'Pando' },
                    { value: 'Otra', etiqueta: 'Otra' },
                  ]}
                />
              </div>
              {datosPersona.lugarNacimiento === 'Otra' && (
                <div>
                  <Entrada
                    etiqueta="Especificar lugar"
                    value={datosPersona.lugarNacimientoOtro}
                    onChange={(e) => setDatosPersona({ ...datosPersona, lugarNacimientoOtro: aMayusculas(e.target.value) })}
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
                      checked={datosPersona.genero === 'M'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="F"
                      checked={datosPersona.genero === 'F'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Femenino</span>
                  </label>
                </div>
                {errores.genero && <p className="text-xs text-red-500 mt-1">{errores.genero}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Soltera(o)"
                      checked={datosPersona.estadoCivil === 'Soltera(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Casada(o)"
                      checked={datosPersona.estadoCivil === 'Casada(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Casado(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Viuda(o)"
                      checked={datosPersona.estadoCivil === 'Viuda(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Viudo(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Divorciada(o)"
                      checked={datosPersona.estadoCivil === 'Divorciada(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Divorciado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  etiqueta="Nacionalidad"
                  value={datosPersona.nacionalidad}
                  onChange={(e) => {
                    setDatosPersona({ ...datosPersona, nacionalidad: e.target.value, nacionalidadOtra: '' });
                  }}
                  opciones={[
                    { value: 'Boliviana', etiqueta: 'Boliviana' },
                    { value: 'Argentina', etiqueta: 'Argentina' },
                    { value: 'Peruana', etiqueta: 'Peruana' },
                    { value: 'Chilena', etiqueta: 'Chilena' },
                    { value: 'Brasileña', etiqueta: 'Brasileña' },
                    { value: 'Colombiana', etiqueta: 'Colombiana' },
                    { value: 'Venezolana', etiqueta: 'Venezolana' },
                    { value: 'Española', etiqueta: 'Española' },
                    { value: 'Otra', etiqueta: 'Otra' },
                  ]}
                />
              </div>
              {datosPersona.nacionalidad === 'Otra' && (
                <div>
                  <Entrada
                    etiqueta="Especificar nacionalidad"
                    value={datosPersona.nacionalidadOtra}
                    onChange={(e) => setDatosPersona({ ...datosPersona, nacionalidadOtra: aMayusculas(e.target.value) })}
                    placeholder="Ingrese la nacionalidad"
                  />
                </div>
              )}
              <div>
                <Entrada
                  etiqueta="Teléfono"
                  value={datosPersona.telefono}
                  onChange={(e) => setDatosPersona({ ...datosPersona, telefono: e.target.value })}
                  placeholder="71234567"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Correo Electrónico"
                  type="email"
                  value={datosPersona.correo}
                  onChange={(e) => setDatosPersona({ ...datosPersona, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Entrada
                  etiqueta="Dirección"
                  value={datosPersona.direccion}
                  onChange={(e) => setDatosPersona({ ...datosPersona, direccion: aMayusculas(e.target.value) })}
                  placeholder="Av. 16 de Julio, La Paz"
                />
              </div>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos del Personal</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Entrada
                  etiqueta="Profesión"
                  value={datosPersonal.profesion}
                  onChange={(e) => setDatosPersonal({ ...datosPersonal, profesion: e.target.value })}
                  placeholder="Ingeniero de Sistemas"
                />
              </div>
              <div>
                <Selector
                  etiqueta="Cargo *"
                  value={datosPersonal.cargo}
                  onChange={(e) => setDatosPersonal({ ...datosPersonal, cargo: e.target.value })}
                  error={errores.cargo}
                  opciones={[
                    { value: 'docente', etiqueta: 'Docente' },
                    { value: 'secretaria', etiqueta: 'Secretaria' },
                    { value: 'director_academico', etiqueta: 'Director Académico' },
                    { value: 'rector', etiqueta: 'Rector' },
                    { value: 'apoyo', etiqueta: 'Personal de Apoyo' },
                    { value: 'bibliotecario', etiqueta: 'Bibliotecario' },
                  ]}
                  placeholder="Seleccionar cargo..."
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Fecha de Contrato *"
                  type="date"
                  value={datosPersonal.fechaContrato}
                  onChange={(e) => setDatosPersonal({ ...datosPersonal, fechaContrato: e.target.value })}
                  error={errores.fechaContrato}
                />
              </div>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errores.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errores.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Boton variante="contorno" type="button" onClick={() => router.back()}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? (
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

      {modalCredenciales && (
        <Modal abierto={!!modalCredenciales} alCerrar={() => {
          setModalCredenciales(null);
          router.push('/personal');
        }} titulo="Usuario Creado" tamano="mediano">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              El personal ha sido registrado exitosamente. A continuación encontrará las credenciales de acceso al sistema:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nombre de usuario</p>
                  <p className="font-mono font-medium">{modalCredenciales.nombreUsuario}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Contraseña temporal</p>
                  <p className="font-mono font-medium">{modalCredenciales.contrasena}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ Se recomienda que el usuario cambie su contraseña después de iniciar sesión.
            </p>
            <div className="flex justify-end">
              <Boton onClick={() => {
                setModalCredenciales(null);
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
