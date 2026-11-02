'use client';

import { useEffect, useState } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro, CampoFiltro, FilaFiltros } from '@/componentes/iu/barra-filtros';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Search, Loader2, Eye, CheckCircle, XCircle, UserPlus, FileText } from 'lucide-react';
import { api } from '@/libreria/api';
import { Selector } from '@/componentes/iu/selector';

const etiquetasEstado: Record<string, { etiqueta: string; color: string }> = {
  pendiente: { etiqueta: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
  verificado: { etiqueta: 'Verificado', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  rechazado: { etiqueta: 'Rechazado', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
  convertido: { etiqueta: 'Convertido', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
};

const etiquetasOrigen: Record<string, string> = {
  web: 'Web',
  secretaria: 'Secretaría',
};

interface SolicitudAdmision {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  ci: string;
  ciExpedido: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreTutor: string;
  ciTutor: string;
  telefonoTutor: string;
  genero: string;
  lugarNacimiento: string;
  estadoCivil: string;
  nacionalidad: string;
  carreraId: number;
  carrera: { id: number; nombre: string } | null;
  estado: string;
  observaciones: string;
  verificadoPor: number;
  fechaVerificacion: string;
  origen: string;
  estudianteConvertidoId: number;
  creadoEn: string;
}

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
}

interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
}

interface DatosFormularioEdicion {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  ci: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  telefono: string;
  correo: string;
  direccion: string;
  nombreTutor: string;
  ciTutor: string;
  telefonoTutor: string;
  carreraId: number;
}

interface DatosModalDetalle {
  solicitud: SolicitudAdmision;
  mostrarConvertir: boolean;
  modoEdicion?: boolean;
}

interface DatosFormularioConversion {
  gestionAdmision: string;
  fechaAdmision: string;
  carreraId: number;
  planEstudioId: number;
  numeroFolder: string;
  codigoFormulario01: string;
  numeroTituloBachiller: string;
  fechaTituloBachiller: string;
}

export default function PaginaAdmision() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdmision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroOrigen, setFiltroOrigen] = useState<string>('');

  const [modalDetalle, setModalDetalle] = useState<DatosModalDetalle | null>(null);
  const [modalVerificar, setModalVerificar] = useState<SolicitudAdmision | null>(null);
  const [modalRechazar, setModalRechazar] = useState<SolicitudAdmision | null>(null);
  const [modalConvertir, setModalConvertir] = useState<SolicitudAdmision | null>(null);
  const [solicitudEliminando, setSolicitudEliminando] = useState<SolicitudAdmision | null>(null);

  const [observaciones, setObservaciones] = useState('');
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [formularioEdicion, setFormularioEdicion] = useState<DatosFormularioEdicion | null>(null);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<PlanEstudio[]>([]);
  const [gestiones, setGestiones] = useState<string[]>([]);
  const [formularioConversion, setFormularioConversion] = useState<DatosFormularioConversion>({
    gestionAdmision: new Date().getFullYear().toString(),
    fechaAdmision: new Date().toISOString().split('T')[0],
    carreraId: 0,
    planEstudioId: 0,
    numeroFolder: '',
    codigoFormulario01: '',
    numeroTituloBachiller: '',
    fechaTituloBachiller: '',
  });

  useEffect(() => {
    obtenerSolicitudes();
    obtenerCarreras();
    obtenerGestiones();
  }, []);

  const obtenerSolicitudes = async () => {
    try {
      const respuesta = await api.get('/admision');
      setSolicitudes(respuesta.data.datos);
    } catch (error) {
      console.error('Error al obtener las admisiones:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerCarreras = async () => {
    try {
      const respuesta = await api.get('/carreras/activos');
      setCarreras(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    }
  };

  const obtenerGestiones = async () => {
    try {
      const respuesta = await api.get('/gestiones');
      const datos = respuesta.data;
      if (Array.isArray(datos)) {
        setGestiones(datos.map((g: any) => g.anio || g.gestion || g));
      } else if (datos.datos) {
        setGestiones(datos.datos.map((g: any) => g.anio || g.gestion || g));
      }
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
      setGestiones([new Date().getFullYear().toString()]);
    }
  };

  const obtenerPlanesEstudio = async (idCarrera: number) => {
    try {
      const respuesta = await api.get(`/planes-estudio/actual/${idCarrera}`);
      setPlanesEstudio(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener los planes de estudio:', error);
      setPlanesEstudio([]);
    }
  };

  const abrirConversion = (solicitud: SolicitudAdmision) => {
    setModalConvertir(solicitud);
    setFormularioConversion({
      gestionAdmision: new Date().getFullYear().toString(),
      fechaAdmision: new Date().toISOString().split('T')[0],
      carreraId: solicitud.carreraId || 0,
      planEstudioId: 0,
      numeroFolder: '',
      codigoFormulario01: '',
      numeroTituloBachiller: '',
      fechaTituloBachiller: '',
    });
    if (solicitud.carreraId) {
      obtenerPlanesEstudio(solicitud.carreraId);
    }
  };

  const convertir = async () => {
    if (!modalConvertir) return;
    setCargandoFormulario(true);
    try {
      await api.post(`/admision/${modalConvertir.id}/convertir-estudiante`, {
        gestionAdmision: formularioConversion.gestionAdmision,
      });

      setModalConvertir(null);
      obtenerSolicitudes();
    } catch (error: any) {
      console.error('Error al convertir:', error);
      alert(error.response?.data?.mensaje || 'Error al convertir a estudiante');
    } finally {
      setCargandoFormulario(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    const nombreCompleto = `${solicitud.nombre} ${solicitud.apellidoPaterno || ''} ${solicitud.apellidoMaterno || ''}`.toLowerCase();
    const ci = solicitud.ci.toLowerCase();
    const busqueda = terminoBusqueda.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda) || ci.includes(busqueda);
    const coincideEstado = !filtroEstado || solicitud.estado === filtroEstado;
    const coincideOrigen = !filtroOrigen || solicitud.origen === filtroOrigen;
    return coincideBusqueda && coincideEstado && coincideOrigen;
  });

  const obtenerInsigniaEstado = (estado: string) => {
    const configuracionInsignia = etiquetasEstado[estado] || { etiqueta: estado, color: 'bg-muted text-foreground' };
    return <Insignia className={configuracionInsignia.color}>{configuracionInsignia.etiqueta}</Insignia>;
  };

  const esMenor = (fechaNacimiento: string): boolean => {
    if (!fechaNacimiento) return false;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    const diaDiff = hoy.getDate() - nacimiento.getDate();
    const edadReal = edad - (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0) ? 1 : 0);
    return edadReal < 18;
  };

  const verificar = async () => {
    if (!modalVerificar) return;
    setCargandoFormulario(true);
    try {
      await api.post(`/admision/${modalVerificar.id}/verificar`, {
        verificadoPor: 1,
        observaciones,
      });
      setModalVerificar(null);
      setObservaciones('');
      obtenerSolicitudes();
    } catch (error) {
      console.error('Error al verificar:', error);
    } finally {
      setCargandoFormulario(false);
    }
  };

  const rechazar = async () => {
    if (!modalRechazar) return;
    setCargandoFormulario(true);
    try {
      await api.post(`/admision/${modalRechazar.id}/rechazar`, {
        verificadoPor: 1,
        observaciones,
      });
      setModalRechazar(null);
      setObservaciones('');
      obtenerSolicitudes();
    } catch (error) {
      console.error('Error al rechazar:', error);
    } finally {
      setCargandoFormulario(false);
    }
  };

  const eliminar = async () => {
    if (!solicitudEliminando) return;
    setCargandoFormulario(true);
    try {
      await api.delete(`/admision/${solicitudEliminando.id}`);
      setSolicitudEliminando(null);
      obtenerSolicitudes();
    } catch (error) {
      console.error('Error al eliminar la solicitud de admisión:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar la solicitud de admisión'));
      }).catch(() => {
        alert('Error al eliminar la solicitud de admisión');
      });
    } finally {
      setCargandoFormulario(false);
    }
  };

  const habilitarEdicion = (solicitud: SolicitudAdmision) => {
    setFormularioEdicion({
      nombre: solicitud.nombre,
      apellidoPaterno: solicitud.apellidoPaterno || '',
      apellidoMaterno: solicitud.apellidoMaterno || '',
      ci: solicitud.ci,
      fechaNacimiento: solicitud.fechaNacimiento,
      lugarNacimiento: solicitud.lugarNacimiento || '',
      genero: solicitud.genero || '',
      estadoCivil: solicitud.estadoCivil || '',
      nacionalidad: solicitud.nacionalidad || '',
      telefono: solicitud.telefono || '',
      correo: solicitud.correo,
      direccion: solicitud.direccion || '',
      nombreTutor: solicitud.nombreTutor || '',
      ciTutor: solicitud.ciTutor || '',
      telefonoTutor: solicitud.telefonoTutor || '',
      carreraId: solicitud.carreraId,
    });
    setModalDetalle({ solicitud, mostrarConvertir: solicitud.estado === 'verificado', modoEdicion: true });
  };

  const cancelarEdicion = () => {
    setFormularioEdicion(null);
    if (modalDetalle) {
      setModalDetalle({ ...modalDetalle, modoEdicion: false });
    }
  };

  const guardarEdicion = async () => {
    if (!modalDetalle || !formularioEdicion) return;
    setCargandoFormulario(true);
    try {
      await api.patch(`/admision/${modalDetalle.solicitud.id}`, formularioEdicion);
      setModalDetalle(null);
      setFormularioEdicion(null);
      obtenerSolicitudes();
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar los datos');
    } finally {
      setCargandoFormulario(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Admisión' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Admisión</h1>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TituloTarjeta>Pre-registros ({solicitudesFiltradas.length})</TituloTarjeta>
            <FilaFiltros>
              <CampoFiltro
                etiqueta="Estado"
                value={filtroEstado}
                onChange={setFiltroEstado}
                placeholder="Todos"
                className="w-full sm:w-40"
                opciones={[
                  { value: 'pendiente', etiqueta: 'Pendiente' },
                  { value: 'verificado', etiqueta: 'Verificado' },
                  { value: 'rechazado', etiqueta: 'Rechazado' },
                  { value: 'convertido', etiqueta: 'Convertido' },
                ]}
              />
              <CampoFiltro
                etiqueta="Origen"
                value={filtroOrigen}
                onChange={setFiltroOrigen}
                placeholder="Todos"
                className="w-full sm:w-40"
                opciones={[
                  { value: 'web', etiqueta: 'Web' },
                  { value: 'secretaria', etiqueta: 'Secretaría' },
                ]}
              />
              <BuscadorFiltro
                placeholder="Buscar por nombre o CI..."
                value={terminoBusqueda}
                onChange={setTerminoBusqueda}
                className="w-full sm:w-64"
              />
            </FilaFiltros>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre Completo</CeldaEncabezado>
                <CeldaEncabezado>Carrera</CeldaEncabezado>
                <CeldaEncabezado>Origen</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {solicitudesFiltradas.map((solicitud) => (
                <FilaTabla key={solicitud.id}>
                  <CeldaTabla className="font-medium">
                    {solicitud.ci} {solicitud.ciExpedido && `- ${solicitud.ciExpedido}`}
                  </CeldaTabla>
                  <CeldaTabla>
                    {solicitud.nombre} {solicitud.apellidoPaterno} {solicitud.apellidoMaterno}
                  </CeldaTabla>
                  <CeldaTabla>{solicitud.carrera?.nombre || '-'}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante="contorno">{etiquetasOrigen[solicitud.origen] || '-'}</Insignia>
                  </CeldaTabla>
                  <CeldaTabla>{obtenerInsigniaEstado(solicitud.estado)}</CeldaTabla>
                  <CeldaTabla>{new Date(solicitud.creadoEn).toLocaleString('es-BO', { hour12: false })}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" title="Ver detalles" onClick={() => setModalDetalle({ solicitud, mostrarConvertir: solicitud.estado === 'verificado' })}>
                        <Eye className="w-4 h-4" />
                      </Boton>
                      {solicitud.estado === 'pendiente' && (
                        <>
                          <Boton variante="fantasma" tamano="icono" title="Verificar" onClick={() => setModalVerificar(solicitud)}>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Boton>
                          <Boton variante="fantasma" tamano="icono" title="Rechazar" onClick={() => setModalRechazar(solicitud)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Boton>
                        </>
                      )}
                      {solicitud.estado === 'verificado' && (
                        <Boton variante="fantasma" tamano="icono" title="Convertir a estudiante" onClick={() => abrirConversion(solicitud)}>
                          <UserPlus className="w-4 h-4 text-blue-500" />
                        </Boton>
                      )}
                      <Boton variante="fantasma" tamano="icono" title="Eliminar" onClick={() => setSolicitudEliminando(solicitud)}>
                        <FileText className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {solicitudesFiltradas.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8 text-muted-foreground">
                    {terminoBusqueda || filtroEstado || filtroOrigen ? 'No se encontraron registros' : 'No hay pre-registros'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Detalle */}
      <Modal abierto={!!modalDetalle} alCerrar={() => { setModalDetalle(null); setFormularioEdicion(null); }} titulo="Detalle del Pre-registro" tamano="grande">
        {modalDetalle && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
              {modalDetalle.solicitud.estado !== 'convertido' && !modalDetalle.modoEdicion && (
                <Boton variante="contorno" tamano="pequeno" onClick={() => habilitarEdicion(modalDetalle.solicitud)}>
                  Editar datos
                </Boton>
              )}
            </div>
            {modalDetalle.modoEdicion && formularioEdicion ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Nombres</label>
                  <Entrada value={formularioEdicion.nombre} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Apellido Paterno</label>
                  <Entrada value={formularioEdicion.apellidoPaterno} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, apellidoPaterno: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Apellido Materno</label>
                  <Entrada value={formularioEdicion.apellidoMaterno} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, apellidoMaterno: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">CI</label>
                  <Entrada value={formularioEdicion.ci} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, ci: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha de nacimiento</label>
                  <Entrada type="date" value={formularioEdicion.fechaNacimiento} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, fechaNacimiento: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Lugar de nacimiento</label>
                  <Entrada value={formularioEdicion.lugarNacimiento} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, lugarNacimiento: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Género</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="genero" value="M" checked={formularioEdicion.genero === 'M'} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, genero: e.target.value })} />
                      <span className="text-sm">Masculino</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="genero" value="F" checked={formularioEdicion.genero === 'F'} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, genero: e.target.value })} />
                      <span className="text-sm">Femenino</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Estado civil</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="estadoCivil" value="Soltera(o)" checked={formularioEdicion.estadoCivil === 'Soltera(o)'} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, estadoCivil: e.target.value })} />
                      <span className="text-sm">Soltero(a)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="estadoCivil" value="Casada(o)" checked={formularioEdicion.estadoCivil === 'Casada(o)'} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, estadoCivil: e.target.value })} />
                      <span className="text-sm">Casado(a)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nacionalidad</label>
                  <Entrada value={formularioEdicion.nacionalidad} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, nacionalidad: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Teléfono</label>
                  <Entrada value={formularioEdicion.telefono} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, telefono: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Correo</label>
                  <Entrada type="email" value={formularioEdicion.correo} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, correo: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dirección</label>
                  <Entrada value={formularioEdicion.direccion} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, direccion: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Carrera</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg" value={formularioEdicion.carreraId} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, carreraId: parseInt(e.target.value) })}>
                    <option value={0}>Seleccionar carrera</option>
                    {carreras.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                {esMenor(formularioEdicion.fechaNacimiento) && (
                  <>
                    <div className="col-span-2 border-t pt-4 mt-2">
                      <p className="text-sm font-semibold text-foreground">Datos del Tutor</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Nombre del tutor</label>
                      <Entrada value={formularioEdicion.nombreTutor} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, nombreTutor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">CI del tutor</label>
                      <Entrada value={formularioEdicion.ciTutor} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, ciTutor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Teléfono del tutor</label>
                      <Entrada value={formularioEdicion.telefonoTutor} onChange={(e) => setFormularioEdicion({ ...formularioEdicion, telefonoTutor: e.target.value })} />
                    </div>
                  </>
                )}
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Boton variante="contorno" onClick={cancelarEdicion} disabled={cargandoFormulario}>Cancelar</Boton>
                  <Boton onClick={guardarEdicion} disabled={cargandoFormulario}>{cargandoFormulario ? 'Guardando...' : 'Guardar cambios'}</Boton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre completo</p>
                  <p className="font-medium">{modalDetalle.solicitud.nombre} {modalDetalle.solicitud.apellidoPaterno} {modalDetalle.solicitud.apellidoMaterno}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CI</p>
                  <p className="font-medium">{modalDetalle.solicitud.ci} {modalDetalle.solicitud.ciExpedido && `- ${modalDetalle.solicitud.ciExpedido}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                  <p className="font-medium">{new Date(modalDetalle.solicitud.fechaNacimiento).toLocaleDateString('es-BO')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lugar de nacimiento</p>
                  <p className="font-medium">{modalDetalle.solicitud.lugarNacimiento || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium">{modalDetalle.solicitud.genero === 'M' ? 'Masculino' : modalDetalle.solicitud.genero === 'F' ? 'Femenino' : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado civil</p>
                  <p className="font-medium">{modalDetalle.solicitud.estadoCivil || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nacionalidad</p>
                  <p className="font-medium">{modalDetalle.solicitud.nacionalidad || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{modalDetalle.solicitud.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo</p>
                  <p className="font-medium">{modalDetalle.solicitud.correo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{modalDetalle.solicitud.direccion || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carrera</p>
                  <p className="font-medium">{modalDetalle.solicitud.carrera?.nombre || '-'}</p>
                </div>
                {esMenor(modalDetalle.solicitud.fechaNacimiento) && modalDetalle.solicitud.nombreTutor && (
                  <>
                    <div className="col-span-2 border-t pt-4 mt-2">
                      <p className="text-sm font-semibold text-foreground">Datos del Tutor (menor de edad)</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre del tutor</p>
                      <p className="font-medium">{modalDetalle.solicitud.nombreTutor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CI del tutor</p>
                      <p className="font-medium">{modalDetalle.solicitud.ciTutor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono del tutor</p>
                      <p className="font-medium">{modalDetalle.solicitud.telefonoTutor || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Verificar */}
      <ModalConfirmacion
        abierto={!!modalVerificar}
        alCerrar={() => { setModalVerificar(null); setObservaciones(''); }}
        alConfirmar={verificar}
        titulo="Verificar Pre-registro"
        textoConfirmar="Verificar"
        cargando={cargandoFormulario}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Está seguro de verificar el pre-registro de <strong>{modalVerificar?.nombre} {modalVerificar?.apellidoPaterno}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observaciones (opcional)</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Observaciones..."
            />
          </div>
        </div>
      </ModalConfirmacion>

      {/* Modal Rechazar */}
      <ModalConfirmacion
        abierto={!!modalRechazar}
        alCerrar={() => { setModalRechazar(null); setObservaciones(''); }}
        alConfirmar={rechazar}
        titulo="Rechazar Pre-registro"
        textoConfirmar="Rechazar"
        variante="destructivo"
        cargando={cargandoFormulario}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Está seguro de rechazar el pre-registro de <strong>{modalRechazar?.nombre} {modalRechazar?.apellidoPaterno}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motivo del rechazo *</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Motivo del rechazo..."
              required
            />
          </div>
        </div>
      </ModalConfirmacion>

      {/* Modal Convertir - Formulario completo */}
      <Modal abierto={!!modalConvertir} alCerrar={() => setModalConvertir(null)} titulo="Crear Estudiante" tamano="grande">
        {modalConvertir && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Datos del pre-registro:</strong> {modalConvertir.nombre} {modalConvertir.apellidoPaterno} {modalConvertir.apellidoMaterno}<br />
                CI: {modalConvertir.ci} {modalConvertir.ciExpedido && `- ${modalConvertir.ciExpedido}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gestión de ingreso *</label>
                <Selector
                  value={formularioConversion.gestionAdmision}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, gestionAdmision: e.target.value })}
                  opciones={gestiones.map(g => ({ value: g, etiqueta: g }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha de ingreso *</label>
                <Entrada
                  type="date"
                  value={formularioConversion.fechaAdmision}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, fechaAdmision: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Carrera *</label>
                <Selector
                  value={formularioConversion.carreraId.toString()}
                  onChange={(e) => {
                    const idCarrera = parseInt(e.target.value);
                    setFormularioConversion({ ...formularioConversion, carreraId: idCarrera, planEstudioId: 0 });
                    obtenerPlanesEstudio(idCarrera);
                  }}
                  opciones={carreras.map(c => ({ value: c.id.toString(), etiqueta: c.nombre }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Plan de estudio *</label>
                <Selector
                  value={formularioConversion.planEstudioId.toString()}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, planEstudioId: parseInt(e.target.value) })}
                  opciones={planesEstudio.map(sp => ({ value: sp.id.toString(), etiqueta: sp.numeroRm }))}
                  placeholder="Seleccionar plan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Número de carpeta</label>
                <Entrada
                  value={formularioConversion.numeroFolder}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, numeroFolder: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Código Formulario 01</label>
                <Entrada
                  value={formularioConversion.codigoFormulario01}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, codigoFormulario01: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Número de Título Bachiller</label>
                <Entrada
                  value={formularioConversion.numeroTituloBachiller}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, numeroTituloBachiller: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha de Título Bachiller</label>
                <Entrada
                  type="date"
                  value={formularioConversion.fechaTituloBachiller}
                  onChange={(e) => setFormularioConversion({ ...formularioConversion, fechaTituloBachiller: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Boton variante="contorno" onClick={() => setModalConvertir(null)}>
                Cancelar
              </Boton>
              <Boton onClick={convertir} cargando={cargandoFormulario}>
                Crear Estudiante
              </Boton>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Eliminar */}
      <ModalConfirmacion
        abierto={!!solicitudEliminando}
        alCerrar={() => setSolicitudEliminando(null)}
        alConfirmar={eliminar}
        titulo="Eliminar Pre-registro"
        mensaje={`¿Está seguro de eliminar el pre-registro de "${solicitudEliminando?.nombre} ${solicitudEliminando?.apellidoPaterno}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={cargandoFormulario}
      />
    </div>
  );
}
