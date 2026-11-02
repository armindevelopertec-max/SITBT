'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { api } from '@/libreria/api';
import { usarCargosPersonal } from '@/ganchos/usarCargosPersonal';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface DatosPersonal {
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

const DEPARTAMENTOS = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Tarija', 'Chuquisaca', 'Beni', 'Pando'];

const NACIONALIDADES = [
  'Boliviana', 'Argentina', 'Peruana', 'Chilena', 'Brasileña', 'Colombiana', 'Venezolana', 'Española', 'Otra'
];

export default function PaginaEditarPersonal() {
  const router = useRouter();
  const parametros = useParams();
  const idPersonal = parametros.id as string;
  const { cargos, cargando: cargandoCargos } = usarCargosPersonal();

  const [guardando, setGuardando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datosPersona, setDatosPersona] = useState({
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

  const [datosPersonal, setDatosPersonal] = useState({
    profesion: '',
    cargo: '',
    fechaContrato: '',
    estado: 'activo',
  });

  const aMayusculas = (value: string) => value.toUpperCase();

  const esOtroDepartamento = !DEPARTAMENTOS.includes(datosPersona.lugarNacimiento);
  const esOtraNacionalidad = !NACIONALIDADES.includes(datosPersona.nacionalidad);

  useEffect(() => {
    if (idPersonal) {
      obtenerPersonal();
    }
  }, [idPersonal]);

  const obtenerPersonal = async () => {
    try {
      setCargandoInicial(true);
      const respuesta = await api.get(`/personal/${idPersonal}`);
      const personal: DatosPersonal = respuesta.data;

      if (personal.persona) {
        setDatosPersona({
          ci: personal.persona.ci || '',
          nombres: personal.persona.nombres || '',
          apellidoPaterno: personal.persona.apellidoPaterno || '',
          apellidoMaterno: personal.persona.apellidoMaterno || '',
          fechaNacimiento: personal.persona.fechaNacimiento || '',
          lugarNacimiento: personal.persona.lugarNacimiento || '',
          genero: personal.persona.genero || '',
          estadoCivil: personal.persona.estadoCivil || '',
          nacionalidad: personal.persona.nacionalidad || 'Boliviana',
          telefono: personal.persona.telefono || '',
          correo: personal.persona.correo || '',
          direccion: personal.persona.direccion || '',
        });
      }

      setDatosPersonal({
        profesion: personal.profesion || '',
        cargo: personal.cargo || '',
        fechaContrato: personal.fechaContrato || '',
        estado: personal.estado || 'activo',
      });
    } catch (error) {
      console.error('Error al cargar personal:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

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
      const respuestaPersonal = await api.get(`/personal/${idPersonal}`);
      const personal: DatosPersonal = respuestaPersonal.data;

      const lugarNacimientoFinal = esOtroDepartamento ? datosPersona.lugarNacimiento : datosPersona.lugarNacimiento;
      const nacionalidadFinal = esOtraNacionalidad ? datosPersona.nacionalidad : datosPersona.nacionalidad;

      await api.patch(`/personas/${personal.personaId}`, {
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
      });

      await api.patch(`/personal/${idPersonal}`, {
        profesion: datosPersonal.profesion || undefined,
        cargo: datosPersonal.cargo,
        fechaContrato: datosPersonal.fechaContrato,
        estado: datosPersonal.estado,
      });

      router.push('/personal');
    } catch (error: any) {
      console.error('Error al actualizar personal:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al actualizar el personal' });
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoInicial) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Personal', href: '/personal' },
          { etiqueta: 'Editar Personal' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Editar Personal</h1>
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
                  value={esOtroDepartamento ? 'Otra' : datosPersona.lugarNacimiento}
                  onChange={(e) => {
                    setDatosPersona({
                      ...datosPersona,
                      lugarNacimiento: e.target.value === 'Otra' ? '' : e.target.value
                    });
                  }}
                  opciones={[
                    { value: '', etiqueta: 'Seleccionar' },
                    ...DEPARTAMENTOS.map(d => ({ value: d, etiqueta: d })),
                    { value: 'Otra', etiqueta: 'Otra' },
                  ]}
                />
              </div>
              {esOtroDepartamento && (
                <div>
                  <Entrada
                    etiqueta="Especificar lugar"
                    value={datosPersona.lugarNacimiento}
                    onChange={(e) => setDatosPersona({ ...datosPersona, lugarNacimiento: aMayusculas(e.target.value) })}
                    placeholder="Ingrese el lugar"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Género *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="M"
                      checked={datosPersona.genero === 'M'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="F"
                      checked={datosPersona.genero === 'F'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, genero: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Femenino</span>
                  </label>
                </div>
                {errores.genero && <p className="text-xs text-red-500 mt-1">{errores.genero}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado Civil</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Soltera(o)"
                      checked={datosPersona.estadoCivil === 'Soltera(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Casada(o)"
                      checked={datosPersona.estadoCivil === 'Casada(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Casado(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Viuda(o)"
                      checked={datosPersona.estadoCivil === 'Viuda(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Viudo(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Divorciada(o)"
                      checked={datosPersona.estadoCivil === 'Divorciada(o)'}
                      onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                      className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">Divorciado(a)</span>
                  </label>
                </div>
              </div>
              <div>
                <Selector
                  etiqueta="Nacionalidad"
                  value={esOtraNacionalidad ? 'Otra' : datosPersona.nacionalidad}
                  onChange={(e) => {
                    setDatosPersona({
                      ...datosPersona,
                      nacionalidad: e.target.value === 'Otra' ? '' : e.target.value
                    });
                  }}
                  opciones={NACIONALIDADES.map(n => ({ value: n, etiqueta: n }))}
                />
              </div>
              {esOtraNacionalidad && (
                <div>
                  <Entrada
                    etiqueta="Especificar nacionalidad"
                    value={datosPersona.nacionalidad}
                    onChange={(e) => setDatosPersona({ ...datosPersona, nacionalidad: aMayusculas(e.target.value) })}
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
                  opciones={cargos.map((cargo) => ({
                    value: cargo.codigo,
                    etiqueta: cargo.nombre,
                  }))}
                  disabled={cargandoCargos}
                  placeholder={
                    cargandoCargos
                      ? 'Cargando cargos...'
                      : 'Seleccionar cargo...'
                  }
                />
                {cargos.length === 0 && !cargandoCargos && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    No hay cargos disponibles. Crea un rol activo en /roles.
                  </p>
                )}
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
              <div>
                <Selector
                  etiqueta="Estado"
                  value={datosPersonal.estado}
                  onChange={(e) => setDatosPersonal({ ...datosPersonal, estado: e.target.value })}
                  opciones={[
                    { value: 'activo', etiqueta: 'Activo' },
                    { value: 'inactivo', etiqueta: 'Inactivo' },
                    { value: 'licencia', etiqueta: 'Licencia' },
                  ]}
                  placeholder="Seleccionar estado..."
                />
              </div>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errores.submit && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
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
                Guardar Cambios
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
