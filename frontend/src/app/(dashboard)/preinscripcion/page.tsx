'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Insignia } from '@/components/ui/insignia';
import { api } from '@/lib/api';
import { Search, Loader2, CheckCircle, AlertCircle, User, BookOpen, Calendar, CreditCard, FileText, Users } from 'lucide-react';

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  gestionAdmision: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  carrera?: {
    id: number;
    nombre: string;
  };
  plan_estudio?: {
    id: number;
    numeroRm: string;
  };
}

interface EstadoPagos {
  puedeInscribir: boolean;
  pagosFaltantes: { tipo: string; concepto: string; monto: number }[];
  pagosRealizados: { tipo: string; concepto: string; monto: number; fechaPago: string }[];
  esEstudianteNuevo: boolean;
}

interface MateriaAInscribir {
  materiaPlanId: number;
  materiaId: number;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  esReprobada: boolean;
  notaAnteriorReprobada?: number;
  prerrequisitoBloqueado: boolean;
  nombrePrerrequisito?: string;
}

interface Grupo {
  id: number;
  semestre: number;
  paralelo: string;
  gestion: string;
  carreraId: number;
  turnoId: number;
  capacidad: number;
  turno?: { id: number; codigo: string; nombre: string };
}

interface Gestion {
  id: number;
  anio: string;
  estado: string;
  esActual: boolean;
  periodos?: { id: number; numero: string; nombre: string; estado: string }[];
}

interface Turno {
  id: number;
  codigo: string;
  nombre: string;
}

type Paso = 'search' | 'payments' | 'subjects' | 'groups' | 'confirm' | 'success';

const coloresInsignia: Record<string, 'exito' | 'advertencia' | 'error' | 'secundario'> = {
  cursando: 'advertencia',
  aprobado: 'exito',
  reprobado: 'error',
  convalidada: 'secundario',
};

export default function PaginaPreinscripcion() {
  const [paso, setPaso] = useState<Paso>('search');
  const [cargando, setCargando] = useState(false);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  const [estadoPagos, setEstadoPagos] = useState<EstadoPagos | null>(null);
  const [materias, setMaterias] = useState<MateriaAInscribir[]>([]);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<MateriaAInscribir[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | null>(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(null);
  const [periodoActual, setPeriodoActual] = useState<string>('I');
  const [gestionActual, setGestionActual] = useState<string>(new Date().getFullYear().toString());
  const [resultadoInscripcion, setResultadoInscripcion] = useState<any>(null);

  useEffect(() => {
    obtenerTurnos();
    obtenerGestionActual();
  }, []);

  const obtenerTurnos = async () => {
    try {
      const respuesta = await api.get('/turnos/todos');
      setTurnos(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
    }
  };

  const obtenerGestionActual = async () => {
    try {
      const respuesta = await api.get('/gestiones/actual');
      if (respuesta.data) {
        setGestionActual(respuesta.data.anio);
        const periodoAbierto = respuesta.data.periodos?.find((periodo: any) => periodo.estado === 'abierta');
        if (periodoAbierto) {
          setPeriodoActual(periodoAbierto.numero);
        }
      }
    } catch (error) {
      console.error('Error al obtener la gestión:', error);
    }
  };

  const buscarEstudiantes = async () => {
    if (!consultaBusqueda.trim()) return;
    setCargando(true);
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: consultaBusqueda, limite: 20 }
      });
      setEstudiantes(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarEstudiante = async (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setPaso('payments');
    await verificarPagos(estudiante.id);
  };

  const verificarPagos = async (idEstudiante: number) => {
    setCargando(true);
    try {
      const respuesta = await api.post('/preinscripcion/verificar-pagos', {
        estudianteId: idEstudiante,
        gestion: gestionActual,
        periodo: periodoActual,
      });
      setEstadoPagos(respuesta.data);

      if (respuesta.data.puedeInscribir) {
        await calcularMaterias(idEstudiante);
      }
    } catch (error) {
      console.error('Error al verificar los pagos:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularMaterias = async (idEstudiante: number) => {
    try {
      const respuesta = await api.post('/preinscripcion/calcular-materias', {
        estudianteId: idEstudiante,
        gestion: gestionActual,
        periodo: periodoActual,
      });

      const datos = respuesta.data;
      setMaterias(datos.materias || []);
      setMateriasSeleccionadas(datos.materias?.filter((materia: any) => !materia.prerrequisitoBloqueado) || []);

      if (datos.materias?.length > 0) {
        await obtenerGrupos(datos.materias[0].materiaId);
      }
    } catch (error) {
      console.error('Error al calcular las materias:', error);
    }
  };

  const obtenerGrupos = async (idMateria: number) => {
    if (!estudianteSeleccionado) return;
    try {
      const respuesta = await api.get('/preinscripcion/grupos', {
        params: {
          carreraId: estudianteSeleccionado.carrera?.id,
          gestion: gestionActual,
          semestre: materias[0]?.semestre || 1,
        }
      });
      setGrupos(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
    }
  };

  const seleccionarGrupo = (idGrupo: number) => {
    setGrupoSeleccionado(idGrupo);
    setTurnoSeleccionado(idGrupo);
  };

  const alternarMateria = (materia: MateriaAInscribir) => {
    setMateriasSeleccionadas(anteriores => {
      const existe = anteriores.find(materiaSeleccionada => materiaSeleccionada.materiaId === materia.materiaId);
      if (existe) {
        return anteriores.filter(materiaSeleccionada => materiaSeleccionada.materiaId !== materia.materiaId);
      }
      return [...anteriores, materia];
    });
  };

  const confirmarInscripcion = async () => {
    if (!estudianteSeleccionado || !grupoSeleccionado || materiasSeleccionadas.length === 0) return;

    setCargando(true);
    try {
      const respuesta = await api.post('/preinscripcion/inscribir-lote', {
        estudianteId: estudianteSeleccionado.id,
        gestion: gestionActual,
        periodo: periodoActual,
        grupoId: grupoSeleccionado,
        materias: materiasSeleccionadas,
      });
      setResultadoInscripcion(respuesta.data);
      setPaso('success');
    } catch (error) {
      console.error('Error al inscribir:', error);
    } finally {
      setCargando(false);
    }
  };

  const reiniciarFlujo = () => {
    setPaso('search');
    setEstudianteSeleccionado(null);
    setEstadoPagos(null);
    setMaterias([]);
    setMateriasSeleccionadas([]);
    setGrupos([]);
    setTurnoSeleccionado(null);
    setGrupoSeleccionado(null);
    setResultadoInscripcion(null);
    setConsultaBusqueda('');
    setEstudiantes([]);
  };

  const renderizarBusqueda = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Buscar Estudiante</TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Entrada
                placeholder="Buscar por nombre, CI o código de inscripción..."
                value={consultaBusqueda}
                onChange={(e) => setConsultaBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarEstudiantes()}
              />
            </div>
            <Boton onClick={buscarEstudiantes} disabled={cargando}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Boton>
          </div>

          {cargando && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          )}

          {estudiantes.length > 0 && (
            <div className="space-y-2">
              {estudiantes.map((estudiante) => (
                <div
                  key={estudiante.id}
                  onClick={() => seleccionarEstudiante(estudiante)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {estudiante.persona?.nombres?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno} {estudiante.persona?.apellidoMaterno}
                    </p>
                    <p className="text-sm text-gray-500">
                      {estudiante.persona?.ci} · {estudiante.codigoInscripcion}
                    </p>
                    <p className="text-sm text-gray-400">
                      {estudiante.carrera?.nombre} · Ingreso: {estudiante.gestionAdmision}
                    </p>
                  </div>
                  <Insignia variante={estudiante.gestionAdmision === gestionActual ? 'exito' : 'secundario'}>
                    {estudiante.gestionAdmision === gestionActual ? 'Nuevo' : 'Antiguo'}
                  </Insignia>
                </div>
              ))}
            </div>
          )}

          {consultaBusqueda && !cargando && estudiantes.length === 0 && (
            <p className="text-center text-gray-500 py-4">No se encontraron estudiantes</p>
          )}
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderizarPagos = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {estudianteSeleccionado?.persona?.nombres} {estudianteSeleccionado?.persona?.apellidoPaterno}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">CI</p>
              <p className="font-medium">{estudianteSeleccionado?.persona?.ci}</p>
            </div>
            <div>
              <p className="text-gray-500">Código</p>
              <p className="font-medium">{estudianteSeleccionado?.codigoInscripcion}</p>
            </div>
            <div>
              <p className="text-gray-500">Carrera</p>
              <p className="font-medium">{estudianteSeleccionado?.carrera?.nombre}</p>
            </div>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Estado de Pagos - {periodoActual}/{gestionActual}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : estadoPagos ? (
            <>
              {estadoPagos.puedeInscribir ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Pagos completados</p>
                    <p className="text-sm text-green-600">El estudiante puede inscribirse</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Pagos pendientes</p>
                    <p className="text-sm text-red-600">El estudiante debe completar los pagos</p>
                  </div>
                </div>
              )}

              {estadoPagos.pagosRealizados.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pagos realizados</h4>
                  <div className="space-y-2">
                    {estadoPagos.pagosRealizados.map((pago, indice) => (
                      <div key={indice} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{pago.concepto}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(pago.fechaPago).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                        <Insignia variante="exito">Bs. {pago.monto}</Insignia>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {estadoPagos.pagosFaltantes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pagos pendientes</h4>
                  <div className="space-y-2">
                    {estadoPagos.pagosFaltantes.map((pago, indice) => (
                      <div key={indice} className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <p className="font-medium">{pago.concepto}</p>
                        <Insignia variante="error">Bs. {pago.monto}</Insignia>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          <div className="flex gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setPaso('search')}>
              Volver
            </Boton>
            {estadoPagos?.puedeInscribir && (
              <Boton onClick={() => setPaso('subjects')}>
                Continuar
              </Boton>
            )}
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderizarMaterias = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Materias a Cursar - {periodoActual}/{gestionActual}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          {estadoPagos?.esEstudianteNuevo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Estudiante nuevo:</strong> Se le asignarán las materias del primer semestre según su plan de estudio.
              </p>
            </div>
          )}

          {materias.filter(materia => materia.prerrequisitoBloqueado).length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                <strong>Materias bloqueadas por prerrequisitos:</strong>{' '}
                {materias.filter(materia => materia.prerrequisitoBloqueado).map(materia => materia.materiaNombre).join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {materias.filter(materia => !materia.prerrequisitoBloqueado).map((materia) => (
              <div
                key={materia.materiaId}
                onClick={() => alternarMateria(materia)}
                className={`p-4 border rounded-lg cursor-pointer flex items-center gap-4 ${
                  materiasSeleccionadas.find(materiaSeleccionada => materiaSeleccionada.materiaId === materia.materiaId)
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!materiasSeleccionadas.find(materiaSeleccionada => materiaSeleccionada.materiaId === materia.materiaId)}
                  onChange={() => {}}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{materia.materiaNombre}</p>
                    {materia.esReprobada && (
                      <Insignia variante="advertencia">Reprobada</Insignia>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {materia.materiaCodigo} · Semestre {materia.semestre}
                  </p>
                  {materia.esReprobada && materia.notaAnteriorReprobada && (
                    <p className="text-xs text-red-500">
                      Nota anterior: {materia.notaAnteriorReprobada}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setPaso('payments')}>
              Volver
            </Boton>
            <Boton
              onClick={() => setPaso('groups')}
              disabled={materiasSeleccionadas.length === 0}
            >
              Continuar ({materiasSeleccionadas.length} materias)
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderizarGrupos = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seleccionar Turno y Grupo
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Turnos disponibles</h4>
              <div className="space-y-2">
                {turnos.map((turno) => (
                  <div
                    key={turno.id}
                    onClick={() => setTurnoSeleccionado(turno.id)}
                    className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                      turnoSeleccionado === turno.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{turno.nombre}</p>
                      <p className="text-sm text-gray-500">Código: {turno.codigo}</p>
                    </div>
                    {turnoSeleccionado === turno.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">
                Grupos - Semestre {materias[0]?.semestre}
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {grupos
                  .filter(grupo => !turnoSeleccionado || grupo.turnoId === turnoSeleccionado)
                  .map((grupo) => (
                    <div
                      key={grupo.id}
                      onClick={() => seleccionarGrupo(grupo.id)}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                        grupoSeleccionado === grupo.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          Paralelo {grupo.paralelo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {grupo.turno?.nombre || 'Sin turno'} · Capacidad: {grupo.capacidad}
                        </p>
                      </div>
                      {grupoSeleccionado === grupo.id && (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  ))}
                {grupos.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No hay grupos creados para este semestre
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setPaso('subjects')}>
              Volver
            </Boton>
            <Boton
              onClick={() => setPaso('confirm')}
              disabled={!grupoSeleccionado}
            >
              Confirmar Inscripción
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderizarConfirmacion = () => {
    const grupo = grupos.find(grupo => grupo.id === grupoSeleccionado);

    return (
      <div className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Confirmar Inscripción
            </TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estudiante:</span>
                <span className="font-medium">
                  {estudianteSeleccionado?.persona?.nombres} {estudianteSeleccionado?.persona?.apellidoPaterno}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gestión:</span>
                <span className="font-medium">{periodoActual}/{gestionActual}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Turno:</span>
                <span className="font-medium">
                  {turnos.find(turno => turno.id === turnoSeleccionado)?.nombre || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupo:</span>
                <span className="font-medium">
                  Paralelo {grupo?.paralelo}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Materias a inscribir:</h4>
              <div className="space-y-1">
                {materiasSeleccionadas.map((materia) => (
                  <div key={materia.materiaId} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{materia.materiaNombre}</span>
                    {materia.esReprobada && (
                      <Insignia variante="advertencia" className="text-xs">Reprobada</Insignia>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {cargando && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Boton variante="contorno" onClick={() => setPaso('groups')}>
                Volver
              </Boton>
              <Boton onClick={confirmarInscripcion} disabled={cargando}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Boton>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    );
  };

  const renderizarExito = () => (
    <div className="space-y-6">
      <Tarjeta variante="conBorde">
        <ContenidoTarjeta className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Inscripción exitosa!
          </h2>
          <p className="text-gray-600 mb-6">
            Se han creado {resultadoInscripcion?.inscripciones?.length} inscripciones para {periodoActual}/{gestionActual}
          </p>

          {resultadoInscripcion?.boletaId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Boleta generada:</strong> La boleta de inscripción está disponible en Documentos.
              </p>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {resultadoInscripcion?.inscripciones?.map((elemento: any) => (
              <div key={elemento.id} className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{elemento.materiaNombre}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Boton variante="contorno" onClick={reiniciarFlujo}>
              Nueva Inscripción
            </Boton>
            <Boton onClick={() => window.print()}>
              Imprimir Comprobante
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Preinscripcion' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Preinscripción Semestral</h1>
        <div className="flex items-center gap-2 text-sm">
          <Insignia variante={periodoActual === 'I' ? 'primario' : 'secundario'}>
            {periodoActual}/{gestionActual}
          </Insignia>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(['search', 'payments', 'subjects', 'groups', 'confirm', 'success'] as Paso[]).map((nombrePaso, indice) => (
          <div key={nombrePaso} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              paso === nombrePaso ? 'bg-primary-600 text-white' :
              ['search', 'payments', 'subjects', 'groups', 'confirm', 'success'].indexOf(paso) > indice
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {indice + 1}
            </div>
            {indice < 5 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {paso === 'search' && renderizarBusqueda()}
      {paso === 'payments' && renderizarPagos()}
      {paso === 'subjects' && renderizarMaterias()}
      {paso === 'groups' && renderizarGrupos()}
      {paso === 'confirm' && renderizarConfirmacion()}
      {paso === 'success' && renderizarExito()}
    </div>
  );
}
