import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionDocente, EstadoAsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { EstadoInscripcionMateria, InscripcionMateria } from '../../entidades/inscripcion-materia.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { RegistrarCalificacionDto } from '../materias-impartidas/dto/registrar-calificacion.dto';
import { ServicioMateriasImpartidas } from '../materias-impartidas/materias-impartidas.servicio';

/**
 * Servicio de la interfaz del docente.
 *
 * Todo se filtra por el usuario del token: el docente solo puede ver las
 * materias en las que tiene una asignación activa. Nunca se acepta un
 * identificador de docente desde el cliente.
 */
@Injectable()
export class ServicioDocente {
  constructor(
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(Personal)
    private repositorioPersonal: Repository<Personal>,
    @InjectRepository(AsignacionDocente)
    private repositorioAsignacion: Repository<AsignacionDocente>,
    @InjectRepository(InscripcionMateria)
    private repositorioInscripcionMateria: Repository<InscripcionMateria>,
    private servicioMateriasImpartidas: ServicioMateriasImpartidas,
  ) {}

  /**
   * Registro de personal del usuario autenticado.
   * Devuelve null si el usuario no es docente.
   */
  async obtenerDocenteDelUsuario(usuarioId: number): Promise<Personal | null> {
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: usuarioId },
      relations: ['persona'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const personal = await this.repositorioPersonal.findOne({
      where: { personaId: usuario.personaId, cargo: 'docente', estado: 'activo' },
    });

    return personal ?? null;
  }

  /** Materias impartidas asignadas al docente autenticado. */
  async listarMisMaterias(
    usuarioId: number,
    gestion?: string,
  ): Promise<any[]> {
    const docente = await this.obtenerDocenteDelUsuario(usuarioId);
    if (!docente) {
      return [];
    }

    const asignaciones = await this.repositorioAsignacion.find({
      where: { docenteId: docente.id, estado: EstadoAsignacionDocente.ACTIVO },
      relations: [
        'materiaImpartida',
        'materiaImpartida.materia',
        'materiaImpartida.grupo',
        'materiaImpartida.grupo.turno',
        'materiaImpartida.grupo.carrera',
        'materiaImpartida.grupo.periodo',
        'materiaImpartida.grupo.periodo.gestion',
      ],
      order: { fechaInicio: 'DESC' },
    });

    const filtradas = gestion
      ? asignaciones.filter((a) => a.gestion === gestion)
      : asignaciones;

    const idsMateriaImpartida = filtradas
      .map((a) => a.materiaImpartidaId)
      .filter((id): id is number => id !== null);

    // Estudiantes inscritos por materia
    const inscritosPorMateria = await this.contarEstudiantes(idsMateriaImpartida);

    return filtradas.map((asignacion) => {
      const mi = asignacion.materiaImpartida;
      return {
        asignacionId: asignacion.id,
        materiaImpartidaId: mi?.id ?? null,
        cargaHoraria: asignacion.cargaHoraria,
        fechaInicio: asignacion.fechaInicio,
        gestion: asignacion.gestion,
        materia: mi?.materia
          ? {
              id: mi.materia.id,
              codigo: mi.materia.codigo,
              nombre: mi.materia.nombre,
            }
          : null,
        grupo: mi?.grupo
          ? {
              id: mi.grupo.id,
              codigo: mi.grupo.codigo,
              semestre: mi.grupo.semestre,
              paralelo: mi.grupo.paralelo,
              turno: mi.grupo.turno
                ? {
                    id: mi.grupo.turno.id,
                    codigo: mi.grupo.turno.codigo,
                    nombre: mi.grupo.turno.nombre,
                  }
                : null,
              carrera: mi.grupo.carrera
                ? { id: mi.grupo.carrera.id, nombre: mi.grupo.carrera.nombre }
                : null,
              periodo: mi.grupo.periodo
                ? {
                    id: mi.grupo.periodo.id,
                    numero: mi.grupo.periodo.numero,
                    gestion: mi.grupo.periodo.gestion?.anio ?? null,
                  }
                : null,
            }
          : null,
        inscritos:
          mi?.id !== null && mi?.id !== undefined
            ? inscritosPorMateria.get(mi.id) ?? 0
            : 0,
      };
    });
  }

  /** Resumen para el panel del docente. */
  async resumen(usuarioId: number): Promise<{
    totalMaterias: number;
    totalEstudiantes: number;
    totalGrupos: number;
    cargaHoraria: number;
  }> {
    const materias = await this.listarMisMaterias(usuarioId);

    const grupos = new Set<number>();
    let cargaHoraria = 0;

    for (const materia of materias) {
      if (materia.grupo?.id) grupos.add(materia.grupo.id);
      cargaHoraria += materia.cargaHoraria ?? 0;
    }

    return {
      totalMaterias: materias.length,
      totalEstudiantes: materias.reduce(
        (suma, materia) => suma + (materia.inscritos ?? 0),
        0,
      ),
      totalGrupos: grupos.size,
      cargaHoraria,
    };
  }

  /**
   * Verifica que el docente autenticado tenga la asignación de la materia.
   * Se usa para proteger el acceso directo por URL.
   */
  async verificarAccesoAMateria(
    usuarioId: number,
    materiaImpartidaId: number,
  ): Promise<boolean> {
    const docente = await this.obtenerDocenteDelUsuario(usuarioId);
    if (!docente) {
      return false;
    }

    const asignacion = await this.repositorioAsignacion.findOne({
      where: {
        docenteId: docente.id,
        materiaImpartidaId,
        estado: EstadoAsignacionDocente.ACTIVO,
      },
    });

    return !!asignacion;
  }

  /** Lanza 403 si el docente no dicta la materia. */
  private async exigirAccesoAMateria(
    usuarioId: number,
    materiaImpartidaId: number,
  ): Promise<void> {
    const permitido = await this.verificarAccesoAMateria(
      usuarioId,
      materiaImpartidaId,
    );
    if (!permitido) {
      throw new ForbiddenException(
        'No tienes asignada esta materia impartida',
      );
    }
  }

  /** Detalle de una materia que dicta el docente autenticado. */
  async obtenerMateria(usuarioId: number, materiaImpartidaId: number) {
    await this.exigirAccesoAMateria(usuarioId, materiaImpartidaId);
    return this.servicioMateriasImpartidas.obtenerUno(materiaImpartidaId);
  }

  /** Estudiantes inscritos en una materia que dicta el docente. */
  async obtenerEstudiantes(usuarioId: number, materiaImpartidaId: number) {
    await this.exigirAccesoAMateria(usuarioId, materiaImpartidaId);
    return this.servicioMateriasImpartidas.obtenerEstudiantes(
      materiaImpartidaId,
    );
  }

  /** Libro de calificaciones de una materia que dicta el docente. */
  async obtenerLibro(usuarioId: number, materiaImpartidaId: number) {
    await this.exigirAccesoAMateria(usuarioId, materiaImpartidaId);
    return this.servicioMateriasImpartidas.obtenerLibro(materiaImpartidaId);
  }

  /** Registra una nota en una materia que dicta el docente. */
  async registrarCalificacion(
    usuarioId: number,
    materiaImpartidaId: number,
    dto: RegistrarCalificacionDto,
  ) {
    await this.exigirAccesoAMateria(usuarioId, materiaImpartidaId);
    return this.servicioMateriasImpartidas.registrarCalificacion(
      materiaImpartidaId,
      dto,
      usuarioId,
    );
  }

  private async contarEstudiantes(
    idsMateriaImpartida: number[],
  ): Promise<Map<number, number>> {
    const mapa = new Map<number, number>();
    if (idsMateriaImpartida.length === 0) {
      return mapa;
    }

    const filas = await this.repositorioInscripcionMateria
      .createQueryBuilder('im')
      .select('im.materia_impartida_id', 'materiaImpartidaId')
      .addSelect('COUNT(*)', 'total')
      .where('im.materia_impartida_id IN (:...ids)', { ids: idsMateriaImpartida })
      .andWhere('im.estado != :retirado', { retirado: EstadoInscripcionMateria.RETIRADO })
      .groupBy('im.materia_impartida_id')
      .getRawMany();

    for (const fila of filas) {
      mapa.set(Number(fila.materiaImpartidaId), Number(fila.total));
    }

    return mapa;
  }
}
