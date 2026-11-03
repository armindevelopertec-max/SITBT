'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada, AreaTexto } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal } from '@/componentes/iu/modal';
import {
  Tabla,
  EncabezadoTabla,
  CuerpoTabla,
  FilaTabla,
  CeldaEncabezado,
  CeldaTabla,
} from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Pencil,
  RefreshCw,
  Users,
} from 'lucide-react';
import type {
  EstadoCalificacion2T,
  EstadoRegistroNota,
  FilaLibroCalificaciones,
  MateriaImpartida,
} from '@/tipos';

type Pestana = 'estudiantes' | 'calificaciones';

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

const VARIANTES_OBSERVACION: Record<
  string,
  'exito' | 'error' | 'advertencia' | 'contorno' | 'predeterminado'
> = {
  aprobo: 'exito',
  reprobo: 'error',
  no_se_presento: 'advertencia',
  puede_ir_2t: 'advertencia',
  pendiente: 'contorno',
};

const nombrePersona = (
  persona?:
    | {
        nombres?: string;
        apellidoPaterno?: string;
        apellidoMaterno?: string;
      }
    | null,
) => {
  if (!persona) return 'Sin nombre';
  return [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
};

export default function PaginaMateriaDocente() {
  const router = useRouter();
  const parametros = useParams();
  const materiaImpartidaId = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [materia, setMateria] = useState<MateriaImpartida | null>(null);
  const [pestana, setPestana] = useState<Pestana>('estudiantes');
  const [procesando, setProcesando] = useState(false);

  const [estudiantes, setEstudiantes] = useState<FilaLibroCalificaciones[]>([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);

  const [filasLibro, setFilasLibro] = useState<FilaLibroCalificaciones[]>([]);
  const [libroEstado, setLibroEstado] = useState('sin_iniciar');
  const [cargandoLibro, setCargandoLibro] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [filaEditando, setFilaEditando] =
    useState<FilaLibroCalificaciones | null>(null);
  const [formulario, setFormulario] = useState({
    parcial1Estado: 'sin_registrar' as EstadoRegistroNota,
    parcial1: '',
    parcial2Estado: 'sin_registrar' as EstadoRegistroNota,
    parcial2: '',
    estado2T: 'no_corresponde' as EstadoCalificacion2T,
    notaSegundaTurno: '',
    motivo: '',
  });

  useEffect(() => {
    let activo = true;

    api
      .get(`/docente/materias/${materiaImpartidaId}`)
      .then((respuesta) => {
        if (!activo) return;
        setMateria(respuesta.data);
        setNoEncontrado(false);
      })
      .catch(() => {
        if (activo) setNoEncontrado(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [materiaImpartidaId]);

  useEffect(() => {
    if (pestana === 'estudiantes') cargarEstudiantes();
    if (pestana === 'calificaciones') cargarLibro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana, materiaImpartidaId]);

  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    try {
      const respuesta = await api.get(
        `/docente/materias/${materiaImpartidaId}/estudiantes`,
      );
      setEstudiantes(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  const cargarLibro = async () => {
    setCargandoLibro(true);
    try {
      const respuesta = await api.get(
        `/docente/materias/${materiaImpartidaId}/libro`,
      );
      setFilasLibro(respuesta.data.filas || []);
      setLibroEstado(respuesta.data.libro?.estado || 'sin_iniciar');
    } catch (error) {
      console.error('Error al obtener el libro:', error);
    } finally {
      setCargandoLibro(false);
    }
  };

  const abrirEditarCalificacion = (fila: FilaLibroCalificaciones) => {
    const c = fila.calificacion;
    setFilaEditando(fila);
    setFormulario({
      parcial1Estado: (c?.parcial1Estado || 'sin_registrar') as EstadoRegistroNota,
      parcial1: c?.parcial1 != null ? String(c.parcial1) : '',
      parcial2Estado: (c?.parcial2Estado || 'sin_registrar') as EstadoRegistroNota,
      parcial2: c?.parcial2 != null ? String(c.parcial2) : '',
      estado2T: (c?.estado2T || 'no_corresponde') as EstadoCalificacion2T,
      notaSegundaTurno:
        c?.notaSegundaTurno != null ? String(c.notaSegundaTurno) : '',
      motivo: '',
    });
    setModalAbierto(true);
  };

  const guardarCalificacion = async () => {
    if (!filaEditando) return;
    setProcesando(true);
    try {
      const cuerpo: Record<string, unknown> = {
        inscripcionMateriaId: filaEditando.inscripcionMateriaId,
        parcial1Estado: formulario.parcial1Estado,
        parcial2Estado: formulario.parcial2Estado,
        estado2T: formulario.estado2T,
      };

      if (
        formulario.parcial1Estado === 'registrado' &&
        formulario.parcial1 !== ''
      ) {
        cuerpo.parcial1 = Number(formulario.parcial1);
      }
      if (
        formulario.parcial2Estado === 'registrado' &&
        formulario.parcial2 !== ''
      ) {
        cuerpo.parcial2 = Number(formulario.parcial2);
      }
      if (
        formulario.estado2T === 'calificado' &&
        formulario.notaSegundaTurno !== ''
      ) {
        cuerpo.notaSegundaTurno = Number(formulario.notaSegundaTurno);
      }
      if (formulario.motivo.trim()) cuerpo.motivo = formulario.motivo.trim();

      await api.post(
        `/docente/materias/${materiaImpartidaId}/calificaciones`,
        cuerpo,
      );
      setModalAbierto(false);
      setFilaEditando(null);
      await cargarLibro();
    } catch (error) {
      alert(mensajeDeError(error, 'Error al registrar la calificación'));
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (noEncontrado || !materia) {
    return (
      <div className="space-y-6">
        <Migas
          elementos={[
            { etiqueta: 'Mis Materias', href: '/docente/materias' },
            { etiqueta: 'No encontrada' },
          ]}
        />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300">
          No se encontró la materia o no tienes permiso para acceder a ella.
        </div>
        <Boton
          variante="contorno"
          onClick={() => router.push('/docente/materias')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis materias
        </Boton>
      </div>
    );
  }

  const pendientes = filasLibro.filter(
    (fila) =>
      fila.estadoInscripcion !== 'retirado' &&
      (!fila.calificacion ||
        fila.calificacion.estadoDefinitivo === 'pendiente' ||
        !fila.calificacion.estadoDefinitivo),
  ).length;

  const pestanas: { clave: Pestana; etiqueta: string; icono: React.ReactNode }[] =
    [
      {
        clave: 'estudiantes',
        etiqueta: 'Estudiantes',
        icono: <Users className="h-4 w-4" />,
      },
      {
        clave: 'calificaciones',
        etiqueta: 'Calificaciones',
        icono: <ClipboardList className="h-4 w-4" />,
      },
    ];

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Mis Materias', href: '/docente/materias' },
          { etiqueta: materia.materia?.nombre || 'Materia' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {materia.materia?.nombre}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {materia.materia?.codigo} · {materia.grupo?.codigo} ·{' '}
            {materia.grupo?.carrera?.nombre} ·{' '}
            {materia.grupo?.turno?.nombre}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {materia.grupo?.semestre}.º semestre ·{' '}
            {materia.grupo?.periodo
              ? `${materia.grupo.periodo.nombre || 'Periodo'}`
              : `Gestión ${materia.gestion}`}
          </p>
        </div>
        <Boton
          variante="contorno"
          onClick={() => router.push('/docente/materias')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Boton>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {pestanas.map((item) => (
          <button
            key={item.clave}
            onClick={() => setPestana(item.clave)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              pestana === item.clave
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.icono}
            {item.etiqueta}
          </button>
        ))}
      </div>

      {pestana === 'estudiantes' && (
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  Estudiantes inscritos
                </h3>
                <p className="text-sm text-muted-foreground">
                  {estudiantes.length} estudiante(s) en esta materia
                </p>
              </div>
              <Boton
                variante="contorno"
                onClick={cargarEstudiantes}
                disabled={cargandoEstudiantes}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Boton>
            </div>

            {cargandoEstudiantes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Tabla>
                  <EncabezadoTabla>
                    <FilaTabla>
                      <CeldaEncabezado>#</CeldaEncabezado>
                      <CeldaEncabezado>Estudiante</CeldaEncabezado>
                      <CeldaEncabezado>CI</CeldaEncabezado>
                      <CeldaEncabezado>Estado</CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {estudiantes.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No hay estudiantes inscritos en esta materia.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      estudiantes.map((fila, indice) => (
                        <FilaTabla key={fila.inscripcionMateriaId}>
                          <CeldaTabla className="text-muted-foreground">
                            {indice + 1}
                          </CeldaTabla>
                          <CeldaTabla>
                            <div className="text-sm font-medium">
                              {nombrePersona(fila.estudiante?.persona)}
                            </div>
                          </CeldaTabla>
                          <CeldaTabla className="text-sm">
                            {fila.estudiante?.persona?.ci}
                          </CeldaTabla>
                          <CeldaTabla>
                            <Insignia
                              variante={
                                fila.estadoInscripcion === 'retirado'
                                  ? 'error'
                                  : fila.calificacion?.estadoDefinitivo ===
                                      'aprobado'
                                    ? 'exito'
                                    : 'contorno'
                              }
                            >
                              {fila.estadoInscripcion === 'retirado'
                                ? 'Retirado'
                                : fila.calificacion?.estadoDefinitivo ===
                                    'aprobado'
                                  ? 'Aprobado'
                                  : 'Cursando'}
                            </Insignia>
                          </CeldaTabla>
                        </FilaTabla>
                      ))
                    )}
                  </CuerpoTabla>
                </Tabla>
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>
      )}

      {pestana === 'calificaciones' && (
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta className="p-0">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Libro de calificaciones
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filasLibro.length} estudiante(s) · {pendientes} pendiente(s)
                  · Estado:{' '}
                  {ETIQUETAS_ESTADO_NOTAS[libroEstado] || libroEstado}
                </p>
              </div>
              <Boton
                variante="contorno"
                onClick={cargarLibro}
                disabled={cargandoLibro}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Boton>
            </div>

            {libroEstado === 'cerrado' && (
              <div className="border-b border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/30 dark:text-green-300">
                El libro está cerrado. Solicita la reapertura al área académica
                para modificar notas.
              </div>
            )}

            {cargandoLibro ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      <CeldaEncabezado className="text-right">
                        Acciones
                      </CeldaEncabezado>
                    </FilaTabla>
                  </EncabezadoTabla>
                  <CuerpoTabla>
                    {filasLibro.length === 0 ? (
                      <FilaTabla>
                        <CeldaTabla
                          colSpan={9}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No hay estudiantes inscritos en esta materia.
                        </CeldaTabla>
                      </FilaTabla>
                    ) : (
                      filasLibro.map((fila, indice) => {
                        const c = fila.calificacion;
                        return (
                          <FilaTabla key={fila.inscripcionMateriaId}>
                            <CeldaTabla className="text-muted-foreground">
                              {indice + 1}
                            </CeldaTabla>
                            <CeldaTabla>
                              <div className="text-sm font-medium">
                                {nombrePersona(fila.estudiante?.persona)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {fila.estudiante?.persona?.ci}
                              </div>
                            </CeldaTabla>
                            <CeldaTabla>
                              {c?.parcial1 != null
                                ? c.parcial1
                                : c?.parcial1Estado === 'ausente'
                                  ? 'AUS'
                                  : '—'}
                            </CeldaTabla>
                            <CeldaTabla>
                              {c?.parcial2 != null
                                ? c.parcial2
                                : c?.parcial2Estado === 'ausente'
                                  ? 'AUS'
                                  : '—'}
                            </CeldaTabla>
                            <CeldaTabla className="font-medium">
                              {c?.promedioFinal != null ? c.promedioFinal : '—'}
                            </CeldaTabla>
                            <CeldaTabla>
                              <Insignia
                                variante={
                                  VARIANTES_OBSERVACION[
                                    c?.observacion || 'pendiente'
                                  ] || 'contorno'
                                }
                              >
                                {ETIQUETAS_OBSERVACION[
                                  c?.observacion || 'pendiente'
                                ] || 'PENDIENTE'}
                              </Insignia>
                            </CeldaTabla>
                            <CeldaTabla>
                              {c?.notaSegundaTurno != null
                                ? c.notaSegundaTurno
                                : c?.estado2T === 'habilitado'
                                  ? 'Habilitado'
                                  : '—'}
                            </CeldaTabla>
                            <CeldaTabla className="font-medium">
                              {c?.notaDefinitiva != null
                                ? c.notaDefinitiva
                                : '—'}
                            </CeldaTabla>
                            <CeldaTabla className="text-right">
                              <Boton
                                variante="contorno"
                                tamano="pequeno"
                                onClick={() => abrirEditarCalificacion(fila)}
                                disabled={libroEstado === 'cerrado'}
                              >
                                <Pencil className="mr-1 h-4 w-4" />
                                Notas
                              </Boton>
                            </CeldaTabla>
                          </FilaTabla>
                        );
                      })
                    )}
                  </CuerpoTabla>
                </Tabla>
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>
      )}

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Registrar calificaciones"
        descripcion={
          filaEditando
            ? nombrePersona(filaEditando.estudiante?.persona)
            : undefined
        }
        tamano="grande"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Primer parcial
              </p>
              <Selector
                value={formulario.parcial1Estado}
                onChange={(e) =>
                  setFormulario((f) => ({
                    ...f,
                    parcial1Estado: e.target.value as EstadoRegistroNota,
                  }))
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
                disabled={formulario.parcial1Estado !== 'registrado'}
                value={formulario.parcial1}
                onChange={(e) =>
                  setFormulario((f) => ({ ...f, parcial1: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Segundo parcial
              </p>
              <Selector
                value={formulario.parcial2Estado}
                onChange={(e) =>
                  setFormulario((f) => ({
                    ...f,
                    parcial2Estado: e.target.value as EstadoRegistroNota,
                  }))
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
                disabled={formulario.parcial2Estado !== 'registrado'}
                value={formulario.parcial2}
                onChange={(e) =>
                  setFormulario((f) => ({ ...f, parcial2: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Segundo turno
              </p>
              <Selector
                value={formulario.estado2T}
                onChange={(e) =>
                  setFormulario((f) => ({
                    ...f,
                    estado2T: e.target.value as EstadoCalificacion2T,
                  }))
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
                disabled={formulario.estado2T !== 'calificado'}
                value={formulario.notaSegundaTurno}
                onChange={(e) =>
                  setFormulario((f) => ({
                    ...f,
                    notaSegundaTurno: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Motivo (si corrige una nota ya registrada)
              </p>
              <AreaTexto
                rows={3}
                value={formulario.motivo}
                onChange={(e) =>
                  setFormulario((f) => ({ ...f, motivo: e.target.value }))
                }
                placeholder="Detalle de la corrección"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            El promedio semestral se calcula automáticamente. La nota de 2.º
            turno reemplaza el promedio cuando está calificada.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Boton variante="contorno" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton onClick={guardarCalificacion} cargando={procesando}>
              Guardar
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
