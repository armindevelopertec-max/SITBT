'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import {
  Tarjeta,
  ContenidoTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada, AreaTexto } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { formatearFechaHora, mensajeDeError } from '@/libreria/utilidades';
import {
  ArrowLeft,
  Loader2,
  Users,
  UserCog,
  ClipboardList,
  History,
  Info,
  Pencil,
  UserPlus,
  UserMinus,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Printer,
} from 'lucide-react';
import type {
  MateriaImpartida as MateriaImpartidaDetalle,
  AsignacionDocente,
  FilaLibroCalificaciones,
  HistorialMateriaImpartida,
  EstadoRegistroNota,
  EstadoCalificacion2T,
} from '@/tipos';

type Pestana = 'datos' | 'docente' | 'estudiantes' | 'calificaciones' | 'historial';

const ETIQUETAS_ESTADO_NOTAS: Record<string, string> = {
  sin_iniciar: 'Sin iniciar',
  borrador: 'Sin iniciar',
  en_registro: 'En registro',
  pendiente_revision: 'Pendiente de revisión',
  cerrado: 'Cerrado',
  reabierto: 'Reabierto',
};

const ETIQUETAS_OBSERVACION: Record<string, string> = {
  aprobo: 'APROBÓ',
  reprobo: 'REPROBÓ',
  no_se_presento: 'NO SE PRESENTÓ',
  puede_ir_2t: 'PUEDE IR A 2T',
  pendiente: 'PENDIENTE',
};

const VARIANTES_OBSERVACION: Record<string, 'exito' | 'error' | 'advertencia' | 'contorno' | 'predeterminado'> = {
  aprobo: 'exito',
  reprobo: 'error',
  no_se_presento: 'advertencia',
  puede_ir_2t: 'advertencia',
  pendiente: 'contorno',
};

const nombrePersona = (persona?: { nombres?: string; apellidoPaterno?: string; apellidoMaterno?: string } | null) => {
  if (!persona) return '—';
  const { nombres, apellidoPaterno, apellidoMaterno } = persona;
  return [apellidoPaterno, apellidoMaterno, nombres].filter(Boolean).join(' ');
};

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  carreraId: number;
  estado: string;
  persona?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
  };
}

interface Personal {
  id: number;
  cargo: string;
  estado: string;
  persona?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
  };
}

export default function PaginaDetalleMateriaImpartida() {
  const router = useRouter();
  const parametros = useParams();
  const materiaImpartidaId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [materia, setMateria] = useState<MateriaImpartidaDetalle | null>(null);
  const [pestana, setPestana] = useState<Pestana>('datos');
  const [procesando, setProcesando] = useState(false);

  // Docente
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [cargandoDocentes, setCargandoDocentes] = useState(false);
  const [personalDisponible, setPersonalDisponible] = useState<Personal[]>([]);
  const [modalDocenteAbierto, setModalDocenteAbierto] = useState(false);
  const [formularioDocente, setFormularioDocente] = useState({ docenteId: '', cargaHoraria: '', observacion: '' });

  // Estudiantes
  const [estudiantes, setEstudiantes] = useState<FilaLibroCalificaciones[]>([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [disponibles, setDisponibles] = useState<Estudiante[]>([]);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [cargandoDisponibles, setCargandoDisponibles] = useState(false);
  const [modalEstudianteAbierto, setModalEstudianteAbierto] = useState(false);
  const [estudianteRetirar, setEstudianteRetirar] = useState<FilaLibroCalificaciones | null>(null);

  // Libro
  const [filasLibro, setFilasLibro] = useState<FilaLibroCalificaciones[]>([]);
  const [libroEstado, setLibroEstado] = useState<string>('sin_iniciar');
  const [cargandoLibro, setCargandoLibro] = useState(false);
  const [modalCalificacionAbierto, setModalCalificacionAbierto] = useState(false);
  const [filaEditando, setFilaEditando] = useState<FilaLibroCalificaciones | null>(null);
  const [formularioCalificacion, setFormularioCalificacion] = useState({
    parcial1Estado: 'sin_registrar' as EstadoRegistroNota,
    parcial1: '',
    parcial2Estado: 'sin_registrar' as EstadoRegistroNota,
    parcial2: '',
    estado2T: 'no_corresponde' as EstadoCalificacion2T,
    notaSegundaTurno: '',
    motivo: '',
  });

  // Cierre
  const [modalCerrarAbierto, setModalCerrarAbierto] = useState(false);
  const [observacionCierre, setObservacionCierre] = useState('');
  const [modalReabrirAbierto, setModalReabrirAbierto] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState('');

  // Historial
  const [historial, setHistorial] = useState<HistorialMateriaImpartida | null>(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    cargarMateria();
    cargarLibro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiaImpartidaId]);

  const cargarMateria = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}`);
      setMateria(respuesta.data);
      setLibroEstado(respuesta.data.libro?.estado || 'sin_iniciar');
      setNoEncontrado(false);
    } catch (error) {
      console.error('Error al obtener la materia impartida:', error);
      setNoEncontrado(true);
    } finally {
      setCargando(false);
    }
  };

  const cargarDocentes = async () => {
    setCargandoDocentes(true);
    try {
      const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}/docentes`);
      setAsignaciones(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
    } finally {
      setCargandoDocentes(false);
    }
  };

  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    try {
      const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}/estudiantes`);
      setEstudiantes(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  const cargarLibro = async () => {
    setCargandoLibro(true);
    try {
      const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}/libro`);
      setFilasLibro(respuesta.data.filas || []);
      setLibroEstado(respuesta.data.libro?.estado || 'sin_iniciar');
    } catch (error) {
      console.error('Error al obtener el libro:', error);
    } finally {
      setCargandoLibro(false);
    }
  };

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}/historial`);
      setHistorial(respuesta.data);
    } catch (error) {
      console.error('Error al obtener el historial:', error);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cambiarPestana = (nueva: Pestana) => {
    setPestana(nueva);
    if (nueva === 'docente') cargarDocentes();
    if (nueva === 'estudiantes') cargarEstudiantes();
    if (nueva === 'calificaciones') cargarLibro();
    if (nueva === 'historial') cargarHistorial();
  };

  const recargarResumen = async () => {
    await Promise.all([cargarMateria(), cargarLibro()]);
  };

  // ---- Docente ----
  const abrirAsignarDocente = async () => {
    setFormularioDocente({ docenteId: '', cargaHoraria: '', observacion: '' });
    setModalDocenteAbierto(true);
    try {
      const respuesta = await api.get('/personal/docentes');
      const lista = respuesta.data.datos || respuesta.data || [];
      setPersonalDisponible(lista);
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      setPersonalDisponible([]);
    }
  };

  const asignarDocente = async () => {
    if (!formularioDocente.docenteId) return;
    setProcesando(true);
    try {
      const cuerpo: Record<string, unknown> = { docenteId: Number(formularioDocente.docenteId) };
      if (formularioDocente.cargaHoraria) cuerpo.cargaHoraria = Number(formularioDocente.cargaHoraria);
      if (formularioDocente.observacion.trim()) cuerpo.observacion = formularioDocente.observacion.trim();
      await api.post(`/materias-impartidas/${materiaImpartidaId}/docentes`, cuerpo);
      setModalDocenteAbierto(false);
      await Promise.all([cargarMateria(), cargarDocentes()]);
    } catch (error) {
      alert(mensajeDeError(error, 'Error al asignar el docente'));
    } finally {
      setProcesando(false);
    }
  };

  const finalizarAsignacion = async (asignacionId: number) => {
    setProcesando(true);
    try {
      await api.patch(`/materias-impartidas/${materiaImpartidaId}/docentes/${asignacionId}/finalizar`);
      await Promise.all([cargarMateria(), cargarDocentes()]);
    } catch (error) {
      alert(mensajeDeError(error, 'Error al finalizar la asignación'));
    } finally {
      setProcesando(false);
    }
  };

  // ---- Estudiantes ----
  const abrirInscribir = async () => {
    setBusquedaEstudiante('');
    setModalEstudianteAbierto(true);
    setCargandoDisponibles(true);
    try {
      const respuesta = await api.get('/estudiantes', { params: { limite: 300 } });
      const lista: Estudiante[] = respuesta.data.datos || [];
      const inscritos = new Set(estudiantes.map((e) => e.estudianteId));
      setDisponibles(
        lista.filter((e) => e.estado === 'activo' && e.carreraId === materia?.grupo?.carreraId && !inscritos.has(e.id)),
      );
    } catch (error) {
      console.error('Error al obtener estudiantes disponibles:', error);
      setDisponibles([]);
    } finally {
      setCargandoDisponibles(false);
    }
  };

  const inscribirEstudiante = async (estudianteId: number) => {
    setProcesando(true);
    try {
      await api.post(`/materias-impartidas/${materiaImpartidaId}/estudiantes`, { estudianteId });
      setModalEstudianteAbierto(false);
      await Promise.all([cargarEstudiantes(), recargarResumen()]);
    } catch (error) {
      alert(mensajeDeError(error, 'Error al inscribir el estudiante'));
    } finally {
      setProcesando(false);
    }
  };

  const confirmarRetirar = async () => {
    if (!estudianteRetirar) return;
    setProcesando(true);
    try {
      await api.delete(`/materias-impartidas/${materiaImpartidaId}/estudiantes/${estudianteRetirar.inscripcionMateriaId}`);
      setEstudianteRetirar(null);
      await Promise.all([cargarEstudiantes(), recargarResumen()]);
    } catch (error) {
      alert(mensajeDeError(error, 'Error al retirar el estudiante'));
    } finally {
      setProcesando(false);
    }
  };

  const sincronizarEstudiantes = async () => {
    setProcesando(true);
    try {
      const respuesta = await api.post(`/materias-impartidas/${materiaImpartidaId}/estudiantes/sincronizar`);
      await Promise.all([cargarEstudiantes(), recargarResumen()]);
      alert(`Sincronización completada: ${respuesta.data.creadas} inscripción(es) nueva(s).`);
    } catch (error) {
      alert(mensajeDeError(error, 'Error al sincronizar estudiantes'));
    } finally {
      setProcesando(false);
    }
  };

  // ---- Calificaciones ----
  const abrirEditarCalificacion = (fila: FilaLibroCalificaciones) => {
    const c = fila.calificacion;
    setFilaEditando(fila);
    setFormularioCalificacion({
      parcial1Estado: (c?.parcial1Estado || 'sin_registrar') as EstadoRegistroNota,
      parcial1: c?.parcial1 != null ? String(c.parcial1) : '',
      parcial2Estado: (c?.parcial2Estado || 'sin_registrar') as EstadoRegistroNota,
      parcial2: c?.parcial2 != null ? String(c.parcial2) : '',
      estado2T: (c?.estado2T || 'no_corresponde') as EstadoCalificacion2T,
      notaSegundaTurno: c?.notaSegundaTurno != null ? String(c.notaSegundaTurno) : '',
      motivo: '',
    });
    setModalCalificacionAbierto(true);
  };

  const guardarCalificacion = async () => {
    if (!filaEditando) return;
    setProcesando(true);
    try {
      const cuerpo: Record<string, unknown> = { inscripcionMateriaId: filaEditando.inscripcionMateriaId };

      cuerpo.parcial1Estado = formularioCalificacion.parcial1Estado;
      if (formularioCalificacion.parcial1Estado === 'registrado' && formularioCalificacion.parcial1 !== '') {
        cuerpo.parcial1 = Number(formularioCalificacion.parcial1);
      }

      cuerpo.parcial2Estado = formularioCalificacion.parcial2Estado;
      if (formularioCalificacion.parcial2Estado === 'registrado' && formularioCalificacion.parcial2 !== '') {
        cuerpo.parcial2 = Number(formularioCalificacion.parcial2);
      }

      cuerpo.estado2T = formularioCalificacion.estado2T;
      if (formularioCalificacion.estado2T === 'calificado' && formularioCalificacion.notaSegundaTurno !== '') {
        cuerpo.notaSegundaTurno = Number(formularioCalificacion.notaSegundaTurno);
      }

      if (formularioCalificacion.motivo.trim()) cuerpo.motivo = formularioCalificacion.motivo.trim();

      await api.post(`/materias-impartidas/${materiaImpartidaId}/calificaciones`, cuerpo);
      setModalCalificacionAbierto(false);
      setFilaEditando(null);
      await recargarResumen();
    } catch (error) {
      alert(mensajeDeError(error, 'Error al registrar la calificación'));
    } finally {
      setProcesando(false);
    }
  };

  // ---- Cierre ----
  const confirmarCerrar = async () => {
    setProcesando(true);
    try {
      await api.post(`/materias-impartidas/${materiaImpartidaId}/cerrar`, { observacion: observacionCierre || undefined });
      setModalCerrarAbierto(false);
      setObservacionCierre('');
      await recargarResumen();
    } catch (error) {
      alert(mensajeDeError(error, 'Error al cerrar el libro'));
    } finally {
      setProcesando(false);
    }
  };

  const confirmarReabrir = async () => {
    if (!motivoReapertura.trim()) {
      alert('Debes indicar el motivo de la reapertura.');
      return;
    }
    setProcesando(true);
    try {
      await api.post(`/materias-impartidas/${materiaImpartidaId}/reabrir`, { motivo: motivoReapertura.trim() });
      setModalReabrirAbierto(false);
      setMotivoReapertura('');
      await recargarResumen();
    } catch (error) {
      alert(mensajeDeError(error, 'Error al reabrir el libro'));
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (noEncontrado || !materia) {
    return (
      <div className="space-y-6">
        <Migas elementos={[{ etiqueta: 'Materias Impartidas', href: '/materias-impartidas' }, { etiqueta: 'No encontrada' }]} />
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          No se encontró la materia impartida solicitada.
        </div>
        <Boton variante="contorno" onClick={() => router.push('/materias-impartidas')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al listado
        </Boton>
      </div>
    );
  }

  const pendientes = filasLibro.filter(
    (f) => f.estadoInscripcion !== 'retirado' && (!f.calificacion || f.calificacion.estadoDefinitivo === 'pendiente' || !f.calificacion.estadoDefinitivo),
  ).length;

  const estudiantesFiltrados = disponibles.filter((e) => {
    if (!busquedaEstudiante.trim()) return true;
    const t = busquedaEstudiante.toLowerCase();
    return (
      (e.persona ? nombrePersona(e.persona).toLowerCase() : '').includes(t) ||
      (e.persona?.ci || '').toLowerCase().includes(t)
    );
  });

  const pestanas: { clave: Pestana; etiqueta: string; icono: React.ReactNode }[] = [
    { clave: 'datos', etiqueta: 'Datos', icono: <Info className="w-4 h-4" /> },
    { clave: 'docente', etiqueta: 'Docente', icono: <UserCog className="w-4 h-4" /> },
    { clave: 'estudiantes', etiqueta: 'Estudiantes', icono: <Users className="w-4 h-4" /> },
    { clave: 'calificaciones', etiqueta: 'Calificaciones', icono: <ClipboardList className="w-4 h-4" /> },
    { clave: 'historial', etiqueta: 'Historial', icono: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Materias Impartidas', href: '/materias-impartidas' },
          { etiqueta: materia.materia?.codigo || 'Detalle' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{materia.materia?.nombre}</h1>
            <Insignia variante={libroEstado === 'cerrado' ? 'exito' : 'primario'}>
              {ETIQUETAS_ESTADO_NOTAS[libroEstado] || libroEstado}
            </Insignia>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {materia.materia?.codigo} · {materia.grupo?.carrera?.nombre} · {materia.grupo?.semestre}.º semestre · Paralelo{' '}
            {materia.grupo?.paralelo} · {materia.gestion}
            {materia.grupo?.periodo?.numero ? ` · Periodo ${materia.grupo.periodo.numero}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {libroEstado === 'cerrado' ? (
            <Boton variante="contorno" onClick={() => setModalReabrirAbierto(true)}>
              <Unlock className="w-4 h-4 mr-2" />
              Reabrir libro
            </Boton>
          ) : (
            <Boton onClick={() => setModalCerrarAbierto(true)}>
              <Lock className="w-4 h-4 mr-2" />
              Cerrar libro
            </Boton>
          )}
          <Boton
            variante="contorno"
            onClick={() => window.open(`/imprimir/materias-impartidas/${materiaImpartidaId}`, '_blank')}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir acta
          </Boton>
          <Boton variante="fantasma" onClick={() => router.push('/materias-impartidas')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Boton>
        </div>
      </div>

      <Tarjeta variante="conBorde">
        <div className="border-b border-border px-2">
          <nav className="flex flex-wrap gap-1">
            {pestanas.map((item) => (
              <button
                key={item.clave}
                onClick={() => cambiarPestana(item.clave)}
                className={
                  'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ' +
                  (pestana === item.clave
                    ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border')
                }
              >
                {item.icono}
                {item.etiqueta}
              </button>
            ))}
          </nav>
        </div>

        <ContenidoTarjeta>
          {/* Datos */}
          {pestana === 'datos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DatoResumen etiqueta="Materia" valor={`${materia.materia?.codigo || ''} ${materia.materia?.nombre || ''}`} />
              <DatoResumen etiqueta="Carrera" valor={materia.grupo?.carrera?.nombre || '—'} />
              <DatoResumen etiqueta="Grupo" valor={materia.grupo?.codigo || '—'} />
              <DatoResumen etiqueta="Gestión" valor={materia.gestion} />
              <DatoResumen etiqueta="Periodo" valor={materia.grupo?.periodo?.numero ? `Periodo ${materia.grupo.periodo.numero}` : '—'} />
              <DatoResumen etiqueta="Semestre" valor={`${materia.grupo?.semestre}.º`} />
              <DatoResumen etiqueta="Paralelo" valor={materia.grupo?.paralelo || '—'} />
              <DatoResumen etiqueta="Turno" valor={materia.grupo?.turno?.nombre || '—'} />
              <DatoResumen etiqueta="Inscritos" valor={String(materia.inscritos ?? 0)} />
              <DatoResumen etiqueta="Estado de la asignatura" valor={materia.estado === 'activa' ? 'Activa' : 'Cerrada'} />
              <DatoResumen etiqueta="Estado de notas" valor={ETIQUETAS_ESTADO_NOTAS[libroEstado] || libroEstado} />
              <DatoResumen etiqueta="Docente actual" valor={nombrePersona(materia.docente?.persona)} />
            </div>
          )}

          {/* Docente */}
          {pestana === 'docente' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Docente asignado</h3>
                  <p className="text-sm text-muted-foreground">
                    {materia.docente ? nombrePersona(materia.docente.persona) : 'Aún no se asignó un docente.'}
                  </p>
                </div>
                <Boton onClick={abrirAsignarDocente}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {materia.docente ? 'Cambiar docente' : 'Asignar docente'}
                </Boton>
              </div>
              {cargandoDocentes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>Docente</CeldaEncabezado>
                      <CeldaEncabezado>Vigencia</CeldaEncabezado>
                      <CeldaEncabezado>Carga horaria</CeldaEncabezado>
                      <CeldaEncabezado>Estado</CeldaEncabezado>
                      <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {asignaciones.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay asignaciones registradas.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      asignaciones.map((a) => (
                        <FilaTabla key={a.id}>
                          <CeldaTabla>{nombrePersona(a.docente?.persona)}</CeldaTabla>
                          <CeldaTabla className="text-sm text-muted-foreground">
                            {(a.fechaInicio || '—') + ' → ' + (a.fechaFin || 'vigente')}
                          </CeldaTabla>
                          <CeldaTabla className="text-sm text-muted-foreground">{a.cargaHoraria ?? '—'}</CeldaTabla>
                          <CeldaTabla>
                            <Insignia variante={a.estado === 'activo' ? 'exito' : 'secundario'}>
                              {a.estado === 'activo' ? 'Activo' : a.estado === 'finalizado' ? 'Finalizado' : 'Anulado'}
                            </Insignia>
                          </CeldaTabla>
                          <CeldaTabla className="text-right">
                            {a.estado === 'activo' && (
                              <Boton
                                variante="contorno"
                                tamano="pequeno"
                                onClick={() => finalizarAsignacion(a.id)}
                                disabled={procesando}
                              >
                                Finalizar
                              </Boton>
                            )}
                          </CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}

          {/* Estudiantes */}
          {pestana === 'estudiantes' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Estudiantes inscritos</h3>
                  <p className="text-sm text-muted-foreground">{estudiantes.length} estudiante(s)</p>
                </div>
                <div className="flex gap-2">
                  <Boton variante="contorno" onClick={sincronizarEstudiantes} disabled={procesando}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar con el grupo
                  </Boton>
                  <Boton onClick={abrirInscribir}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscribir estudiante
                  </Boton>
                </div>
              </div>
              {cargandoEstudiantes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>CI / Código</CeldaEncabezado>
                      <CeldaEncabezado>Nombre completo</CeldaEncabezado>
                      <CeldaEncabezado>Estado</CeldaEncabezado>
                      <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {estudiantes.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={4} className="text-center py-8 text-muted-foreground">
                          No hay estudiantes inscritos.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      estudiantes.map((e) => (
                        <FilaTabla key={e.inscripcionMateriaId}>
                          <CeldaTabla>
                            <div className="text-sm font-medium">{e.estudiante?.persona?.ci || '—'}</div>
                            <div className="text-xs text-muted-foreground">{e.estudiante?.codigoInscripcion || ''}</div>
                          </CeldaTabla>
                          <CeldaTabla>{nombrePersona(e.estudiante?.persona)}</CeldaTabla>
                          <CeldaTabla>
                            <Insignia variante={e.estadoInscripcion === 'retirado' ? 'error' : 'primario'}>
                              {e.estadoInscripcion}
                            </Insignia>
                          </CeldaTabla>
                          <CeldaTabla className="text-right">
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Retirar"
                              onClick={() => setEstudianteRetirar(e)}
                            >
                              <UserMinus className="w-4 h-4 text-red-500" />
                            </Boton>
                          </CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}

          {/* Calificaciones */}
          {pestana === 'calificaciones' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Libro de calificaciones</h3>
                  <p className="text-sm text-muted-foreground">
                    {filasLibro.length} estudiante(s) · {pendientes} pendiente(s) · Estado: {ETIQUETAS_ESTADO_NOTAS[libroEstado] || libroEstado}
                  </p>
                </div>
                <Boton variante="contorno" onClick={cargarLibro} disabled={cargandoLibro}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Boton>
              </div>

              {libroEstado === 'cerrado' && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm">
                  El libro está cerrado. Reábralo con autorización para modificar notas.
                </div>
              )}

              {cargandoLibro ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>#</CeldaEncabezado>
                      <CeldaEncabezado>Estudiante</CeldaEncabezado>
                      <CeldaEncabezado>Parcial 1</CeldaEncabezado>
                      <CeldaEncabezado>Parcial 2</CeldaEncabezado>
                      <CeldaEncabezado>Promedio</CeldaEncabezado>
                      <CeldaEncabezado>Observación</CeldaEncabezado>
                      <CeldaEncabezado>2.º turno</CeldaEncabezado>
                      <CeldaEncabezado>Definitiva</CeldaEncabezado>
                      <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {filasLibro.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla colSpan={9} className="text-center py-8 text-muted-foreground">
                          No hay estudiantes inscritos en esta materia.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      filasLibro.map((fila, indice) => {
                        const c = fila.calificacion;
                        return (
                          <FilaTabla key={fila.inscripcionMateriaId}>
                            <CeldaTabla className="text-muted-foreground">{indice + 1}</CeldaTabla>
                            <CeldaTabla>
                              <div className="text-sm font-medium">{nombrePersona(fila.estudiante?.persona)}</div>
                              <div className="text-xs text-muted-foreground">{fila.estudiante?.persona?.ci}</div>
                            </CeldaTabla>
                            <CeldaTabla>{c?.parcial1 != null ? c.parcial1 : c?.parcial1Estado === 'ausente' ? 'AUS' : '—'}</CeldaTabla>
                            <CeldaTabla>{c?.parcial2 != null ? c.parcial2 : c?.parcial2Estado === 'ausente' ? 'AUS' : '—'}</CeldaTabla>
                            <CeldaTabla className="font-medium">{c?.promedioFinal != null ? c.promedioFinal : '—'}</CeldaTabla>
                            <CeldaTabla>
                              <Insignia variante={VARIANTES_OBSERVACION[c?.observacion || 'pendiente'] || 'contorno'}>
                                {ETIQUETAS_OBSERVACION[c?.observacion || 'pendiente'] || 'PENDIENTE'}
                              </Insignia>
                            </CeldaTabla>
                            <CeldaTabla>{c?.notaSegundaTurno != null ? c.notaSegundaTurno : c?.estado2T === 'habilitado' ? 'Habilitado' : '—'}</CeldaTabla>
                            <CeldaTabla className="font-medium">{c?.notaDefinitiva != null ? c.notaDefinitiva : '—'}</CeldaTabla>
                            <CeldaTabla className="text-right">
                              <Boton
                                variante="contorno"
                                tamano="pequeno"
                                onClick={() => abrirEditarCalificacion(fila)}
                                disabled={libroEstado === 'cerrado'}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Notas
                              </Boton>
                            </CeldaTabla>
                          </FilaTabla>
                        );
                      })
                    )}
                  </CuerpoTabla>
                </Tabla>
              )}
            </div>
          )}

          {/* Historial */}
          {pestana === 'historial' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground">Cierres y reaperturas</h3>
                {cargandoHistorial ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                  </div>
                ) : (
                  <Tabla>
                    <EncabezadoTabla>
                      <FilaTabla>
                        <CeldaEncabezado>Fecha</CeldaEncabezado>
                        <CeldaEncabezado>Acción</CeldaEncabezado>
                        <CeldaEncabezado>Motivo</CeldaEncabezado>
                        <CeldaEncabezado>Autorizado por</CeldaEncabezado>
                      </FilaTabla>
                    </EncabezadoTabla>
                    <CuerpoTabla>
                      {!historial || historial.cierres.length === 0 ? (
                        <FilaTabla>
                          <CeldaTabla colSpan={4} className="text-center py-6 text-muted-foreground">
                            Sin cierres registrados.
                          </CeldaTabla>
                        </FilaTabla>
                      ) : (
                        historial.cierres.map((c) => (
                          <FilaTabla key={c.id}>
                            <CeldaTabla className="text-sm whitespace-nowrap">{formatearFechaHora(c.creadoEn || '')}</CeldaTabla>
                            <CeldaTabla>
                              <Insignia variante={c.accion === 'cerrar' ? 'exito' : 'advertencia'}>
                                {c.accion === 'cerrar' ? 'Cierre' : 'Reapertura'}
                              </Insignia>
                            </CeldaTabla>
                            <CeldaTabla className="text-sm text-muted-foreground">{c.motivo || '—'}</CeldaTabla>
                            <CeldaTabla className="text-sm text-muted-foreground">{nombrePersona(c.autorizador?.persona)}</CeldaTabla>
                          </FilaTabla>
                        ))
                      )}
                    </CuerpoTabla>
                  </Tabla>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-foreground">Auditoría de notas</h3>
                <p className="text-sm text-muted-foreground">Cambios registrados sobre las calificaciones (valor anterior y nuevo).</p>
                {cargandoHistorial ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
                  </div>
                ) : (
                  <Tabla>
                    <EncabezadoTabla>
                      <FilaTabla>
                        <CeldaEncabezado>Fecha</CeldaEncabezado>
                        <CeldaEncabezado>Campo</CeldaEncabezado>
                        <CeldaEncabezado>Anterior</CeldaEncabezado>
                        <CeldaEncabezado>Nuevo</CeldaEncabezado>
                        <CeldaEncabezado>Motivo</CeldaEncabezado>
                      </FilaTabla>
                    </EncabezadoTabla>
                    <CuerpoTabla>
                      {!historial || historial.auditoria.length === 0 ? (
                        <FilaTabla>
                          <CeldaTabla colSpan={5} className="text-center py-6 text-muted-foreground">
                            Sin cambios registrados.
                          </CeldaTabla>
                        </FilaTabla>
                      ) : (
                        historial.auditoria.slice(0, 100).map((a) => (
                          <FilaTabla key={a.id}>
                            <CeldaTabla className="text-sm whitespace-nowrap">{formatearFechaHora(a.cambiadoEn || '')}</CeldaTabla>
                            <CeldaTabla className="text-sm">{a.campoCambiado}</CeldaTabla>
                            <CeldaTabla className="text-sm text-muted-foreground">{a.valorAnterior ?? '—'}</CeldaTabla>
                            <CeldaTabla className="text-sm text-muted-foreground">{a.valorNuevo ?? '—'}</CeldaTabla>
                            <CeldaTabla className="text-sm text-muted-foreground">{a.motivo || '—'}</CeldaTabla>
                          </FilaTabla>
                        ))
                      )}
                    </CuerpoTabla>
                  </Tabla>
                )}
              </div>
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal docente */}
      <Modal
        abierto={modalDocenteAbierto}
        alCerrar={() => setModalDocenteAbierto(false)}
        titulo={materia.docente ? 'Cambiar docente' : 'Asignar docente'}
        descripcion="Al cambiar de docente se finaliza la asignación anterior conservando el historial."
        tamano="mediano"
      >
        <div className="space-y-4">
          <Selector
            etiqueta="Docente *"
            value={formularioDocente.docenteId}
            onChange={(e) => setFormularioDocente((f) => ({ ...f, docenteId: e.target.value }))}
            opciones={[
              { value: '', etiqueta: 'Seleccionar docente...' },
              ...personalDisponible.map((p) => ({ value: p.id, etiqueta: `${nombrePersona(p.persona)} (${p.cargo})` })),
            ]}
          />
          <Entrada
            etiqueta="Carga horaria"
            type="number"
            min={0}
            value={formularioDocente.cargaHoraria}
            onChange={(e) => setFormularioDocente((f) => ({ ...f, cargaHoraria: e.target.value }))}
            placeholder="Horas"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observación</label>
            <AreaTexto
              rows={2}
              value={formularioDocente.observacion}
              onChange={(e) => setFormularioDocente((f) => ({ ...f, observacion: e.target.value }))}
              placeholder="Opcional"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Boton variante="contorno" onClick={() => setModalDocenteAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={asignarDocente} cargando={procesando} disabled={!formularioDocente.docenteId}>
              Asignar
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal inscribir estudiante */}
      <Modal
        abierto={modalEstudianteAbierto}
        alCerrar={() => setModalEstudianteAbierto(false)}
        titulo="Inscribir estudiante"
        descripcion="Estudiantes activos de la carrera no inscritos aún en esta materia."
        tamano="grande"
      >
        <div className="space-y-4">
          <BuscadorFiltro
            placeholder="Buscar por nombre o CI..."
            value={busquedaEstudiante}
            onChange={setBusquedaEstudiante}
          />
          {cargandoDisponibles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : estudiantesFiltrados.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No hay estudiantes disponibles para inscribir.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto scrollarea-tema divide-y divide-gray-100">
              {estudiantesFiltrados.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{nombrePersona(e.persona)}</p>
                    <p className="text-xs text-muted-foreground">
                      CI: {e.persona?.ci || '—'} · {e.codigoInscripcion}
                    </p>
                  </div>
                  <Boton tamano="pequeno" onClick={() => inscribirEstudiante(e.id)} disabled={procesando}>
                    Inscribir
                  </Boton>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Boton variante="contorno" onClick={() => setModalEstudianteAbierto(false)}>
              Cerrar
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal calificación */}
      <Modal
        abierto={modalCalificacionAbierto}
        alCerrar={() => setModalCalificacionAbierto(false)}
        titulo="Registrar calificaciones"
        descripcion={filaEditando ? nombrePersona(filaEditando.estudiante?.persona) : undefined}
        tamano="grande"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Primer parcial</p>
              <Selector
                value={formularioCalificacion.parcial1Estado}
                onChange={(e) =>
                  setFormularioCalificacion((f) => ({ ...f, parcial1Estado: e.target.value as EstadoRegistroNota }))
                }
                opciones={[
                  { value: 'sin_registrar', etiqueta: 'Sin registrar' },
                  { value: 'registrado', etiqueta: 'Registrado' },
                  { value: 'ausente', etiqueta: 'Ausente' },
                  { value: 'justificado', etiqueta: 'Justificado' },
                ]}
              />
              <Entrada
                type="number"
                min={0}
                max={100}
                placeholder="Nota 0-100"
                disabled={formularioCalificacion.parcial1Estado !== 'registrado'}
                value={formularioCalificacion.parcial1}
                onChange={(e) => setFormularioCalificacion((f) => ({ ...f, parcial1: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Segundo parcial</p>
              <Selector
                value={formularioCalificacion.parcial2Estado}
                onChange={(e) =>
                  setFormularioCalificacion((f) => ({ ...f, parcial2Estado: e.target.value as EstadoRegistroNota }))
                }
                opciones={[
                  { value: 'sin_registrar', etiqueta: 'Sin registrar' },
                  { value: 'registrado', etiqueta: 'Registrado' },
                  { value: 'ausente', etiqueta: 'Ausente' },
                  { value: 'justificado', etiqueta: 'Justificado' },
                ]}
              />
              <Entrada
                type="number"
                min={0}
                max={100}
                placeholder="Nota 0-100"
                disabled={formularioCalificacion.parcial2Estado !== 'registrado'}
                value={formularioCalificacion.parcial2}
                onChange={(e) => setFormularioCalificacion((f) => ({ ...f, parcial2: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Segundo turno</p>
              <Selector
                value={formularioCalificacion.estado2T}
                onChange={(e) =>
                  setFormularioCalificacion((f) => ({ ...f, estado2T: e.target.value as EstadoCalificacion2T }))
                }
                opciones={[
                  { value: 'no_corresponde', etiqueta: 'No corresponde' },
                  { value: 'habilitado', etiqueta: 'Habilitado' },
                  { value: 'calificado', etiqueta: 'Calificado' },
                  { value: 'ausente', etiqueta: 'Ausente' },
                  { value: 'justificado', etiqueta: 'Justificado' },
                ]}
              />
              <Entrada
                type="number"
                min={0}
                max={100}
                placeholder="Nota 2T 0-100"
                disabled={formularioCalificacion.estado2T !== 'calificado'}
                value={formularioCalificacion.notaSegundaTurno}
                onChange={(e) => setFormularioCalificacion((f) => ({ ...f, notaSegundaTurno: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Motivo (si corrige una nota ya registrada)</p>
              <AreaTexto
                rows={3}
                value={formularioCalificacion.motivo}
                onChange={(e) => setFormularioCalificacion((f) => ({ ...f, motivo: e.target.value }))}
                placeholder="Detalle de la corrección"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            El promedio semestral se calcula automáticamente. La nota de 2.º turno reemplaza el promedio cuando está
            calificada.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Boton variante="contorno" onClick={() => setModalCalificacionAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={guardarCalificacion} cargando={procesando}>
              Guardar
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal cerrar */}
      <Modal
        abierto={modalCerrarAbierto}
        alCerrar={() => setModalCerrarAbierto(false)}
        titulo="Cerrar libro de calificaciones"
        tamano="mediano"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {pendientes > 0
              ? `Hay ${pendientes} estudiante(s) sin resultado definitivo. No se podrá cerrar hasta resolverlos.`
              : 'Todos los estudiantes tienen resultado definitivo. El libro quedará cerrado.'}
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observación</label>
            <AreaTexto
              rows={2}
              value={observacionCierre}
              onChange={(e) => setObservacionCierre(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="contorno" onClick={() => setModalCerrarAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={confirmarCerrar} cargando={procesando} disabled={pendientes > 0}>
              Cerrar libro
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Modal reabrir */}
      <Modal
        abierto={modalReabrirAbierto}
        alCerrar={() => setModalReabrirAbierto(false)}
        titulo="Reabrir libro de calificaciones"
        tamano="mediano"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La reapertura permite modificar notas cerradas y queda registrada en la auditoría con autorización.
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motivo *</label>
            <AreaTexto
              rows={3}
              value={motivoReapertura}
              onChange={(e) => setMotivoReapertura(e.target.value)}
              placeholder="Motivo de la reapertura"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="contorno" onClick={() => setModalReabrirAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={confirmarReabrir} cargando={procesando} disabled={!motivoReapertura.trim()}>
              Reabrir
            </Boton>
          </div>
        </div>
      </Modal>

      {/* Confirmar retirar */}
      <ModalConfirmacion
        abierto={!!estudianteRetirar}
        alCerrar={() => setEstudianteRetirar(null)}
        alConfirmar={confirmarRetirar}
        titulo="Retirar estudiante"
        mensaje={
          estudianteRetirar
            ? `¿Retirar a ${nombrePersona(estudianteRetirar.estudiante?.persona)} de esta materia?`
            : undefined
        }
        textoConfirmar="Retirar"
        variante="destructivo"
        cargando={procesando}
      />
    </div>
  );
}

function DatoResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{valor}</p>
    </div>
  );
}
