'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Modal } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
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

export default function PaginaNuevoEstudiante() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
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

  const [datosEstudiante, setDatosEstudiante] = useState({

    gestionAdmision: new Date().getFullYear().toString(),
    fechaAdmision: '',
    carreraId: '',
    planEstudioId: '',
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
  });

  const aMayusculas = (value: string) => value.toUpperCase();

  useEffect(() => {
    obtenerCarreras();
    obtenerGestiones();
  }, []);

  useEffect(() => {
    if (datosEstudiante.carreraId) {
      obtenerPlanesEstudio(Number(datosEstudiante.carreraId));
    } else {
      setPlanesEstudio([]);
    }
  }, [datosEstudiante.carreraId]);

  const obtenerCarreras = async () => {
    try {
      const respuesta = await api.get('/carreras/activos');
      setCarreras(respuesta.data || []);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
    } finally {
      setCargandoCarreras(false);
    }
  };

  const obtenerPlanesEstudio = async (carreraId: number) => {
    setCargandoPlanes(true);
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${carreraId}`);
      setPlanesEstudio(respuesta.data || []);
    } catch (error) {
      console.error('Error al cargar planes de estudio:', error);
    } finally {
      setCargandoPlanes(false);
    }
  };

  const obtenerGestiones = async () => {
    try {
      const respuesta = await api.get('/gestiones/activos');
      const todasLasGestiones: Gestion[] = respuesta.data || [];
      const todosLosPeriodos: { gestion: Gestion; periodo: Periodo }[] = [];

      todasLasGestiones.forEach((gestion) => {
        if (gestion.periodos && gestion.periodos.length > 0) {
          gestion.periodos.forEach((periodo: any) => {
            todosLosPeriodos.push({ gestion, periodo });
          });
        }
      });

      setPeriodos(todosLosPeriodos.sort((a, b) => {
        if (a.gestion.anio !== b.gestion.anio) return b.gestion.anio.localeCompare(a.gestion.anio);
        return a.periodo.numero.localeCompare(b.periodo.numero);
      }));
    } catch (error) {
      console.error('Error al cargar gestiones:', error);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!datosPersona.ci) nuevosErrores.ci = 'CI es requerido';
    if (!datosPersona.nombres) nuevosErrores.nombres = 'Nombres es requerido';
    if (!datosPersona.apellidoPaterno) nuevosErrores.apellidoPaterno = 'Apellido paterno es requerido';
    if (!datosPersona.fechaNacimiento) nuevosErrores.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!datosPersona.genero) nuevosErrores.genero = 'Género es requerido';

    if (!datosEstudiante.gestionAdmision) nuevosErrores.gestionAdmision = 'Gestión de ingreso es requerida';
    if (!datosEstudiante.fechaAdmision) nuevosErrores.fechaAdmision = 'Fecha de ingreso es requerida';
    if (!datosEstudiante.carreraId) nuevosErrores.carreraId = 'Carrera es requerida';
    if (!datosEstudiante.planEstudioId) nuevosErrores.planEstudioId = 'Plan de estudio es requerido';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setCargando(true);
    try {
      const cargaPersona = {
        ...datosPersona,
        genero: datosPersona.genero,
        estado: 'activo',
      };

      const respuestaPersona = await api.post('/personas', cargaPersona);
      const personaId = respuestaPersona.data.id;

      const cargaEstudiante = {
        personaId: personaId,
        gestionAdmision: datosEstudiante.gestionAdmision,
        fechaAdmision: datosEstudiante.fechaAdmision,
        carreraId: Number(datosEstudiante.carreraId),
        planEstudioId: Number(datosEstudiante.planEstudioId),
        numeroFolder: datosEstudiante.numeroFolder || undefined,
        codigoFormulario01: datosEstudiante.codigoFormulario01 || undefined,
        numeroTituloBachiller: datosEstudiante.numeroTituloBachiller || undefined,
        fechaTituloBachiller: datosEstudiante.fechaTituloBachiller || undefined,
        estado: 'activo',
      };

      const respuesta = await api.post('/estudiantes', cargaEstudiante);

      if (respuesta.data.usuario) {
        setModalCredenciales(respuesta.data.usuario);
      } else {
        router.push('/estudiantes');
      }
    } catch (error: any) {
      console.error('Error al crear estudiante:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al crear el estudiante' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Estudiantes', href: '/estudiantes' },
          { etiqueta: 'Nuevo Estudiante' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Estudiante</h1>
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
                  error={errores.apellidoMaterno}
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
                    const valor = e.target.value;
                    setDatosPersona({ ...datosPersona, lugarNacimiento: valor });
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
                    etiqueta="Especificar lugar de nacimiento"
                    value={datosPersona.lugarNacimientoOtro || ''}
                    onChange={(e) => setDatosPersona({ ...datosPersona, lugarNacimientoOtro: aMayusculas(e.target.value) })}
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
                <div className="flex gap-4">
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
                </div>
              </div>
              <div>
                <Selector
                  etiqueta="Nacionalidad"
                  value={datosPersona.nacionalidad}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setDatosPersona({ ...datosPersona, nacionalidad: valor });
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
                    value={datosPersona.nacionalidadOtra || ''}
                    onChange={(e) => setDatosPersona({ ...datosPersona, nacionalidadOtra: aMayusculas(e.target.value) })}
                    placeholder="Ingrese su nacionalidad"
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
            <TituloTarjeta>Datos del Estudiante</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Selector
                  etiqueta="Gestión de Ingreso *"
                  value={datosEstudiante.gestionAdmision}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, gestionAdmision: e.target.value })}
                  error={errores.gestionAdmision}
                  opciones={periodos.map(p => ({
                    value: `${p.gestion.anio}-${p.periodo.numero}`,
                    etiqueta: `${p.periodo.numero}/${p.gestion.anio}${p.periodo.estado === 'abierta' ? ' ★' : ''}`,
                  }))}
                  placeholder="Seleccionar período..."
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Fecha de Ingreso *"
                  type="date"
                  value={datosEstudiante.fechaAdmision}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, fechaAdmision: e.target.value })}
                  error={errores.fechaAdmision}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Carrera *"
                  value={datosEstudiante.carreraId}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, carreraId: e.target.value, planEstudioId: '' })}
                  error={errores.carreraId}
                  opciones={carreras.map(c => ({ value: c.id.toString(), etiqueta: c.nombre }))}
                  placeholder={cargandoCarreras ? 'Cargando...' : 'Seleccionar carrera...'}
                  disabled={cargandoCarreras}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Plan de Estudio *"
                  value={datosEstudiante.planEstudioId}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, planEstudioId: e.target.value })}
                  error={errores.planEstudioId}
                  opciones={planesEstudio.map(p => ({ value: p.id.toString(), etiqueta: `${p.numeroRm}` }))}
                  placeholder={cargandoPlanes ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={cargandoPlanes || !datosEstudiante.carreraId}
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Número de Folder"
                  value={datosEstudiante.numeroFolder}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, numeroFolder: e.target.value })}
                  placeholder="F-001"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Código Formulario 01"
                  value={datosEstudiante.codigoFormulario01}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, codigoFormulario01: e.target.value })}
                  placeholder="FORM01-2024-001"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Número de Título de Bachiller"
                  value={datosEstudiante.numeroTituloBachiller}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, numeroTituloBachiller: e.target.value })}
                  placeholder="123456"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Fecha de Título de Bachiller"
                  type="date"
                  value={datosEstudiante.fechaTituloBachiller}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, fechaTituloBachiller: e.target.value })}
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
          <Boton type="submit" disabled={cargando}>
            {cargando ? (
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

      {modalCredenciales && (
        <Modal abierto={!!modalCredenciales} alCerrar={() => {
          setModalCredenciales(null);
          router.push('/estudiantes');
        }} titulo="Usuario Creado" tamano="mediano">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              El estudiante ha sido registrado exitosamente. A continuación encontrará las credenciales de acceso al sistema:
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
              ⚠️ Se recomienda que el estudiante cambie su contraseña después de iniciar sesión.
            </p>
            <div className="flex justify-end">
              <Boton onClick={() => {
                setModalCredenciales(null);
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
