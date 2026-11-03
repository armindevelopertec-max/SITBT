import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AsignacionDocente, EstadoAsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { EstadoInscripcionMateria, InscripcionMateria } from '../../entidades/inscripcion-materia.entidad';
import { LibroCalificaciones } from '../../entidades/libro-calificaciones.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

/**
 * Servicio de la interfaz del estudiante.
 *
 * Todo se filtra por el usuario del token: el estudiante solo puede ver sus
 * propias inscripciones y sus propias calificaciones. Nunca se acepta un
 * identificador de estudiante desde el cliente.
 */
@Injectable()
export class ServicioEstudiante {
  constructor(
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    @InjectRepository(InscripcionMateria)
    private repositorioInscripcion: Repository<InscripcionMateria>,
    @InjectRepository(Calificacion)
    private repositorioCalificacion: Repository<Calificacion>,
    @InjectRepository(AsignacionDocente)
    private repositorioAsignacion: Repository<AsignacionDocente>,
    @InjectRepository(LibroCalificaciones)
    private repositorioLibro: Repository<LibroCalificaciones>,
  ) {}

  /**
   * Registro de estudiante del usuario autenticado.
   * Se enlaza por la persona del usuario, igual que al crear la cuenta.
   */
  async obtenerEstudianteDelUsuario(usuarioId: number): Promise<Estudiante> {
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const estudiante = await this.repositorioEstudiante.findOne({
      where: { personaId: usuario.personaId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!estudiante) {
      throw new ForbiddenException(
        'No tienes un registro de estudiante asociado a esta cuenta',
      );
    }

    return estudiante;
  }

  /** Materias que el estudiante autenticado está cursando. */
  async listarMisMaterias(usuarioId: number, gestion?: string): Promise<any[]> {
    const estudiante = await this.obtenerEstudianteDelUsuario(usuarioId);

    const inscripciones = await this.repositorioInscripcion.find({
      where: {
        estudianteId: estudiante.id,
        estado: EstadoInscripcionMateria.CURSANDO,
      },
      relations: [
        'materiaImpartida',
        'materiaImpartida.materia',
        'materiaImpartida.materiaPlan',
        'materiaImpartida.grupo',
        'materiaImpartida.grupo.turno',
        'materiaImpartida.grupo.carrera',
        'materiaImpartida.grupo.periodo',
        'materiaImpartida.grupo.periodo.gestion',
      ],
      order: { creadoEn: 'ASC' },
    });

    const filtradas = gestion
      ? inscripciones.filter(
          (inscripcion) => inscripcion.materiaImpartida?.gestion === gestion,
        )
      : inscripciones;

    const idsMateriaImpartida = filtradas
      .map((inscripcion) => inscripcion.materiaImpartidaId)
      .filter((id): id is number => id !== null && id !== undefined);

    const calificaciones = idsMateriaImpartida.length
      ? await this.repositorioCalificacion.find({
          where: {
            inscripcionMateriaId: In(
              filtradas.map((inscripcion) => inscripcion.id),
            ),
          },
        })
      : [];
    const calificacionPorInscripcion = new Map(
      calificaciones.map((calificacion) => [
        calificacion.inscripcionMateriaId,
        calificacion,
      ]),
    );

    const asignaciones = idsMateriaImpartida.length
      ? await this.repositorioAsignacion.find({
          where: {
            materiaImpartidaId: In(idsMateriaImpartida),
            estado: EstadoAsignacionDocente.ACTIVO,
          },
          relations: ['docente', 'docente.persona'],
        })
      : [];
    const docentePorMateria = new Map<number, Personal>();
    for (const asignacion of asignaciones) {
      if (
        asignacion.materiaImpartidaId !== null &&
        asignacion.docente &&
        !docentePorMateria.has(asignacion.materiaImpartidaId)
      ) {
        docentePorMateria.set(asignacion.materiaImpartidaId, asignacion.docente);
      }
    }

    return filtradas.map((inscripcion) => {
      const materiaImpartida = inscripcion.materiaImpartida;
      const docente = materiaImpartida
        ? docentePorMateria.get(materiaImpartida.id)
        : undefined;

      return {
        inscripcionMateriaId: inscripcion.id,
        materiaImpartidaId: materiaImpartida?.id ?? null,
        estadoInscripcion: inscripcion.estado,
        gestion: materiaImpartida?.gestion ?? null,
        materia: materiaImpartida?.materia
          ? {
              id: materiaImpartida.materia.id,
              codigo: materiaImpartida.materia.codigo,
              nombre: materiaImpartida.materia.nombre,
            }
          : null,
        grupo: materiaImpartida?.grupo
          ? {
              id: materiaImpartida.grupo.id,
              codigo: materiaImpartida.grupo.codigo,
              semestre: materiaImpartida.grupo.semestre,
              paralelo: materiaImpartida.grupo.paralelo,
              turno: materiaImpartida.grupo.turno
                ? {
                    id: materiaImpartida.grupo.turno.id,
                    codigo: materiaImpartida.grupo.turno.codigo,
                    nombre: materiaImpartida.grupo.turno.nombre,
                  }
                : null,
              carrera: materiaImpartida.grupo.carrera
                ? {
                    id: materiaImpartida.grupo.carrera.id,
                    nombre: materiaImpartida.grupo.carrera.nombre,
                  }
                : null,
              periodo: materiaImpartida.grupo.periodo
                ? {
                    id: materiaImpartida.grupo.periodo.id,
                    numero: materiaImpartida.grupo.periodo.numero,
                    nombre: materiaImpartida.grupo.periodo.nombre,
                    gestion:
                      materiaImpartida.grupo.periodo.gestion?.anio ?? null,
                    estado: materiaImpartida.grupo.periodo.estado,
                  }
                : null,
            }
          : null,
        horasSemanales:
          materiaImpartida?.materiaPlan?.horasSemanales ?? null,
        docente: docente
          ? {
              id: docente.id,
              nombre: this.nombrePersona(docente.persona),
              ci: docente.persona?.ci ?? null,
            }
          : null,
        calificacion: this.vistaCalificacion(
          calificacionPorInscripcion.get(inscripcion.id),
        ),
      };
    });
  }

  /** Resumen para el panel del estudiante. */
  async resumen(usuarioId: number): Promise<{
    estudiante: {
      id: number;
      codigoInscripcion: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      carrera: { id: number; nombre: string } | null;
      semestre: number | null;
      estado: string;
      estadoMatricula: string;
    };
    materiasEnCurso: number;
    notasRegistradas: number;
    promedioGeneral: number | null;
  }> {
    const estudiante = await this.obtenerEstudianteDelUsuario(usuarioId);
    const materias = await this.listarMisMaterias(usuarioId);

    const conNotas = materias.filter((materia) => {
      const calificacion = materia.calificacion;
      return (
        calificacion &&
        (calificacion.parcial1 !== null ||
          calificacion.parcial2 !== null ||
          calificacion.notaDefinitiva !== null)
      );
    });

    const definitivas = materias
      .map((materia) => materia.calificacion?.notaDefinitiva)
      .filter((nota): nota is number => typeof nota === 'number');

    const promedioGeneral =
      definitivas.length > 0
        ? Math.round(
            (definitivas.reduce((suma, nota) => suma + nota, 0) /
              definitivas.length) *
              100,
          ) / 100
        : null;

    const semestre = materias.find((materia) => materia.grupo?.semestre)
      ?.grupo?.semestre;

    return {
      estudiante: {
        id: estudiante.id,
        codigoInscripcion: estudiante.codigoInscripcion,
        nombres: estudiante.persona?.nombres ?? '',
        apellidoPaterno: estudiante.persona?.apellidoPaterno ?? '',
        apellidoMaterno: estudiante.persona?.apellidoMaterno ?? '',
        carrera: estudiante.carrera
          ? { id: estudiante.carrera.id, nombre: estudiante.carrera.nombre }
          : null,
        semestre: semestre ?? null,
        estado: estudiante.estado,
        estadoMatricula: estudiante.estadoMatricula,
      },
      materiasEnCurso: materias.length,
      notasRegistradas: conNotas.length,
      promedioGeneral,
    };
  }

  /**
   * Detalle de una materia en la que el estudiante está inscrito, junto con
   * su propia calificación. Si intenta abrir una materia ajena responde 403.
   */
  async obtenerMateria(
    usuarioId: number,
    materiaImpartidaId: number,
  ): Promise<any> {
    const estudiante = await this.obtenerEstudianteDelUsuario(usuarioId);

    const inscripcion = await this.repositorioInscripcion.findOne({
      where: {
        estudianteId: estudiante.id,
        materiaImpartidaId,
      },
      relations: [
        'materiaImpartida',
        'materiaImpartida.materia',
        'materiaImpartida.materiaPlan',
        'materiaImpartida.grupo',
        'materiaImpartida.grupo.turno',
        'materiaImpartida.grupo.carrera',
        'materiaImpartida.grupo.periodo',
        'materiaImpartida.grupo.periodo.gestion',
      ],
    });

    if (
      !inscripcion ||
      inscripcion.estado === EstadoInscripcionMateria.RETIRADO
    ) {
      throw new ForbiddenException('No estás inscrito en esta materia');
    }

    const materiaImpartida = inscripcion.materiaImpartida;

    const calificacion = await this.repositorioCalificacion.findOne({
      where: { inscripcionMateriaId: inscripcion.id },
    });

    const asignacion = await this.repositorioAsignacion.findOne({
      where: {
        materiaImpartidaId,
        estado: EstadoAsignacionDocente.ACTIVO,
      },
      relations: ['docente', 'docente.persona'],
    });

    const libro = await this.repositorioLibro.findOne({
      where: { materiaImpartidaId },
    });

    return {
      inscripcionMateriaId: inscripcion.id,
      materiaImpartidaId,
      estadoInscripcion: inscripcion.estado,
      gestion: materiaImpartida?.gestion ?? null,
      estadoMateria: materiaImpartida?.estado ?? null,
      materia: materiaImpartida?.materia
        ? {
            id: materiaImpartida.materia.id,
            codigo: materiaImpartida.materia.codigo,
            nombre: materiaImpartida.materia.nombre,
          }
        : null,
      grupo: materiaImpartida?.grupo
        ? {
            id: materiaImpartida.grupo.id,
            codigo: materiaImpartida.grupo.codigo,
            semestre: materiaImpartida.grupo.semestre,
            paralelo: materiaImpartida.grupo.paralelo,
            turno: materiaImpartida.grupo.turno
              ? {
                  id: materiaImpartida.grupo.turno.id,
                  codigo: materiaImpartida.grupo.turno.codigo,
                  nombre: materiaImpartida.grupo.turno.nombre,
                }
              : null,
            carrera: materiaImpartida.grupo.carrera
              ? {
                  id: materiaImpartida.grupo.carrera.id,
                  nombre: materiaImpartida.grupo.carrera.nombre,
                }
              : null,
            periodo: materiaImpartida.grupo.periodo
              ? {
                  id: materiaImpartida.grupo.periodo.id,
                  numero: materiaImpartida.grupo.periodo.numero,
                  nombre: materiaImpartida.grupo.periodo.nombre,
                  gestion: materiaImpartida.grupo.periodo.gestion?.anio ?? null,
                  estado: materiaImpartida.grupo.periodo.estado,
                }
              : null,
          }
        : null,
      horasSemanales: materiaImpartida?.materiaPlan?.horasSemanales ?? null,
      docente: asignacion?.docente
        ? {
            id: asignacion.docente.id,
            nombre: this.nombrePersona(asignacion.docente.persona),
            ci: asignacion.docente.persona?.ci ?? null,
          }
        : null,
      libroEstado: libro?.estado ?? 'sin_iniciar',
      calificacion: this.vistaCalificacion(calificacion),
    };
  }

  /** Datos de la nota que puede ver el estudiante (sin campos internos). */
  private vistaCalificacion(calificacion?: Calificacion | null) {
    if (!calificacion) {
      return null;
    }

    return {
      parcial1: calificacion.parcial1,
      parcial1Estado: calificacion.parcial1Estado,
      parcial2: calificacion.parcial2,
      parcial2Estado: calificacion.parcial2Estado,
      promedioFinal: calificacion.promedioFinal,
      observacion: calificacion.observacion,
      estadoRegular: calificacion.estadoRegular,
      aptoSegundaTurno: calificacion.aptoSegundaTurno,
      estado2T: calificacion.estado2T,
      notaSegundaTurno: calificacion.notaSegundaTurno,
      segundaTurnoAplicado: calificacion.segundaTurnoAplicado,
      notaDefinitiva: calificacion.notaDefinitiva,
      estadoDefinitivo: calificacion.estadoDefinitivo,
      estadoRevision: calificacion.estadoRevision,
      registradoEn: calificacion.registradoEn,
      actualizadoEn: calificacion.actualizadoEn,
    };
  }

  private nombrePersona(
    persona?:
      | {
          nombres?: string;
          apellidoPaterno?: string;
          apellidoMaterno?: string;
        }
      | null,
  ): string {
    if (!persona) {
      return 'Sin docente asignado';
    }
    return [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
      .filter(Boolean)
      .join(' ');
  }
}
