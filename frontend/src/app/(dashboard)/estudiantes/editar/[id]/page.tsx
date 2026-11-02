'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { api } from '@/libreria/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

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

interface DatosEstudiante {
  id: number;
  personaId: number;
  codigoInscripcion: string;
  gestionAdmision: string;
  fechaAdmision: string;
  carreraId: number;
  planEstudioId: number;
  numeroFolder: string;
  codigoFormulario01: string;
  numeroTituloBachiller: string;
  fechaTituloBachiller: string;
  estado: string;
  persona?: {
    id: number;
    ci: string;
    ci_issued: string;
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

export default function PaginaEditarEstudiante() {
  const router = useRouter();
  const parametros = useParams();
  const estudianteId = parametros.id as string;

  const [cargando, setCargando] = useState(false);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [periodos, setPeriodos] = useState<{ gestion: Gestion; periodo: Periodo }[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datosPersona, setDatosPersona] = useState({
    ci: '',
    ci_issued: '',
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

  const [datosEstudiante, setDatosEstudiante] = useState({
    codigoInscripcion: '',
    gestionAdmision: '',
    fechaAdmision: '',
    carreraId: '' as string | number,
    planEstudioId: '' as string | number,
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
    estado: 'activo',
  });

  useEffect(() => {
    obtenerCarreras();
    obtenerGestiones();
    if (estudianteId) {
      obtenerEstudiante();
    }
  }, [estudianteId]);

  useEffect(() => {
    if (datosEstudiante.carreraId) {
      obtenerPlanesEstudio(Number(datosEstudiante.carreraId));
    } else {
      setPlanesEstudio([]);
    }
  }, [datosEstudiante.carreraId]);

  const obtenerEstudiante = async () => {
    try {
      setCargandoInicial(true);
      const respuesta = await api.get(`/estudiantes/${estudianteId}`);
      const estudiante: DatosEstudiante = respuesta.data;

      if (estudiante.persona) {
        setDatosPersona({
          ci: estudiante.persona.ci || '',
          ci_issued: estudiante.persona.ci_issued || '',
          nombres: estudiante.persona.nombres || '',
          apellidoPaterno: estudiante.persona.apellidoPaterno || '',
          apellidoMaterno: estudiante.persona.apellidoMaterno || '',
          fechaNacimiento: estudiante.persona.fechaNacimiento || '',
          lugarNacimiento: estudiante.persona.lugarNacimiento || '',
          genero: estudiante.persona.genero || '',
          estadoCivil: estudiante.persona.estadoCivil || '',
          nacionalidad: estudiante.persona.nacionalidad || 'Boliviana',
          telefono: estudiante.persona.telefono || '',
          correo: estudiante.persona.correo || '',
          direccion: estudiante.persona.direccion || '',
        });
      }

      setDatosEstudiante({
        codigoInscripcion: estudiante.codigoInscripcion || '',
        gestionAdmision: estudiante.gestionAdmision || '',
        fechaAdmision: estudiante.fechaAdmision || '',
        carreraId: estudiante.carreraId || '',
        planEstudioId: estudiante.planEstudioId || '',
        numeroFolder: estudiante.numeroFolder || '',
        codigoFormulario01: estudiante.codigoFormulario01 || '',
        numeroTituloBachiller: estudiante.numeroTituloBachiller || '',
        fechaTituloBachiller: estudiante.fechaTituloBachiller || '',
        estado: estudiante.estado || 'activo',
      });
    } catch (error) {
      console.error('Error al cargar estudiante:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

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
    if (!datosPersona.apellidoMaterno) nuevosErrores.apellidoMaterno = 'Apellido materno es requerido';
    if (!datosPersona.fechaNacimiento) nuevosErrores.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!datosPersona.genero) nuevosErrores.genero = 'Género es requerido';

    if (!datosEstudiante.codigoInscripcion) nuevosErrores.codigoInscripcion = 'Código de inscripción es requerido';
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
      const respuestaEstudiante = await api.get(`/estudiantes/${estudianteId}`);
      const estudiante: DatosEstudiante = respuestaEstudiante.data;

      await api.patch(`/personas/${estudiante.personaId}`, {
        ...datosPersona,
        genero: datosPersona.genero,
        estado: 'activo',
      });

      await api.patch(`/estudiantes/${estudianteId}`, {
        codigoInscripcion: datosEstudiante.codigoInscripcion,
        gestionAdmision: datosEstudiante.gestionAdmision,
        fechaAdmision: datosEstudiante.fechaAdmision,
        carreraId: Number(datosEstudiante.carreraId),
        planEstudioId: Number(datosEstudiante.planEstudioId),
        numeroFolder: datosEstudiante.numeroFolder || undefined,
        codigoFormulario01: datosEstudiante.codigoFormulario01 || undefined,
        numeroTituloBachiller: datosEstudiante.numeroTituloBachiller || undefined,
        fechaTituloBachiller: datosEstudiante.fechaTituloBachiller || undefined,
        estado: datosEstudiante.estado,
      });

      router.push('/estudiantes');
    } catch (error: any) {
      console.error('Error al actualizar estudiante:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al actualizar el estudiante' });
      }
    } finally {
      setCargando(false);
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
          { etiqueta: 'Estudiantes', href: '/estudiantes' },
          { etiqueta: 'Editar Estudiante' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Editar Estudiante</h1>
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
                  onChange={(e) => setDatosPersona({ ...datosPersona, ci: e.target.value })}
                  error={errores.ci}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Extensión CI"
                  value={datosPersona.ci_issued}
                  onChange={(e) => setDatosPersona({ ...datosPersona, ci_issued: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Nombres *"
                  value={datosPersona.nombres}
                  onChange={(e) => setDatosPersona({ ...datosPersona, nombres: e.target.value })}
                  error={errores.nombres}
                  placeholder="Juan Carlos"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Apellido Paterno *"
                  value={datosPersona.apellidoPaterno}
                  onChange={(e) => setDatosPersona({ ...datosPersona, apellidoPaterno: e.target.value })}
                  error={errores.apellidoPaterno}
                  placeholder="Perez"
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Apellido Materno *"
                  value={datosPersona.apellidoMaterno}
                  onChange={(e) => setDatosPersona({ ...datosPersona, apellidoMaterno: e.target.value })}
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
                <Entrada
                  etiqueta="Lugar de Nacimiento"
                  value={datosPersona.lugarNacimiento}
                  onChange={(e) => setDatosPersona({ ...datosPersona, lugarNacimiento: e.target.value })}
                  placeholder="La Paz"
                />
              </div>
              <div>
                <Selector
                  etiqueta="Género *"
                  value={datosPersona.genero}
                  onChange={(e) => setDatosPersona({ ...datosPersona, genero: e.target.value })}
                  error={errores.genero}
                  opciones={[
                    { value: 'M', etiqueta: 'Masculino' },
                    { value: 'F', etiqueta: 'Femenino' },
                  ]}
                  placeholder="Seleccionar..."
                />
              </div>
              <div>
                <Selector
                  etiqueta="Estado Civil"
                  value={datosPersona.estadoCivil}
                  onChange={(e) => setDatosPersona({ ...datosPersona, estadoCivil: e.target.value })}
                  opciones={[
                    { value: 'Soltera(o)', etiqueta: 'Soltero(a)' },
                    { value: 'Casada(o)', etiqueta: 'Casado(a)' },
                    { value: 'Viuda(o)', etiqueta: 'Viudo(a)' },
                    { value: 'Divorciada(o)', etiqueta: 'Divorciado(a)' },
                  ]}
                  placeholder="Seleccionar..."
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Nacionalidad"
                  value={datosPersona.nacionalidad}
                  onChange={(e) => setDatosPersona({ ...datosPersona, nacionalidad: e.target.value })}
                  placeholder="Boliviana"
                />
              </div>
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
                  onChange={(e) => setDatosPersona({ ...datosPersona, direccion: e.target.value })}
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
                <Entrada
                  etiqueta="Código de Inscripción *"
                  value={datosEstudiante.codigoInscripcion}
                  error={errores.codigoInscripcion}
                  readOnly
                  className="bg-muted/40"
                />
              </div>
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
                  value={String(datosEstudiante.carreraId)}
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
                  value={String(datosEstudiante.planEstudioId)}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, planEstudioId: e.target.value })}
                  error={errores.planEstudioId}
                  opciones={planesEstudio.map(p => ({ value: p.id.toString(), etiqueta: `${p.numeroRm}` }))}
                  placeholder={cargandoPlanes ? 'Cargando...' : 'Seleccionar plan...'}
                  disabled={cargandoPlanes || !datosEstudiante.carreraId}
                />
              </div>
              <div>
                <Selector
                  etiqueta="Estado"
                  value={datosEstudiante.estado}
                  onChange={(e) => setDatosEstudiante({ ...datosEstudiante, estado: e.target.value })}
                  opciones={[
                    { value: 'activo', etiqueta: 'Activo' },
                    { value: 'inactivo', etiqueta: 'Inactivo' },
                    { value: 'egresado', etiqueta: 'Egresado' },
                    { value: 'suspendido', etiqueta: 'Suspendido' },
                    { value: 'congelado', etiqueta: 'Congelado' },
                  ]}
                  placeholder="Seleccionar estado..."
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
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
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
                Guardar Cambios
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
