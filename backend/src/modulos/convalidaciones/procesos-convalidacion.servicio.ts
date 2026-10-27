import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ProcesoConvalidacion,
  EstadoProcesoConvalidacion,
} from '../../entidades/proceso-convalidacion.entidad';
import {
  EquivalenciaPlan,
  ResultadoEquivalencia,
} from '../../entidades/equivalencia-plan.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { CrearProcesoConvalidacionDto } from './dto/crear-proceso-convalidacion.dto';
import { ActualizarProcesoConvalidacionDto } from './dto/actualizar-proceso-convalidacion.dto';
import { GuardarEquivalenciaPlanDto } from './dto/guardar-equivalencia-plan.dto';
import { AprobarProcesoConvalidacionDto } from './dto/aprobar-proceso-convalidacion.dto';

/** Materia de un plan, en formato plano para el frontend. */
export interface MateriaPlanPlana {
  id: number;
  materiaId: number;
  codigo: string | null;
  nombre: string | null;
  semestre: number;
  horasSemanales: number;
  prerrequisitoId: number | null;
}

@Injectable()
export class ServicioProcesosConvalidacion {
  constructor(
    @InjectRepository(ProcesoConvalidacion)
    private repositorioProceso: Repository<ProcesoConvalidacion>,
    @InjectRepository(EquivalenciaPlan)
    private repositorioEquivalencia: Repository<EquivalenciaPlan>,
    @InjectRepository(PlanEstudio)
    private repositorioPlan: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
  ) {}

  // ---------------------------------------------------------------------------
  // Procesos
  // ---------------------------------------------------------------------------

  async crear(dto: CrearProcesoConvalidacionDto): Promise<ProcesoConvalidacion> {
    if (dto.planOrigenId === dto.planDestinoId) {
      throw new BadRequestException('El plan de origen y el de destino deben ser distintos');
    }

    const planOrigen = await this.repositorioPlan.findOne({ where: { id: dto.planOrigenId } });
    const planDestino = await this.repositorioPlan.findOne({ where: { id: dto.planDestinoId } });

    if (!planOrigen || !planDestino) {
      throw new NotFoundException('Alguno de los planes de estudio no existe');
    }

    if (planOrigen.carreraId !== planDestino.carreraId) {
      throw new BadRequestException('Ambos planes deben pertenecer a la misma carrera');
    }

    if (dto.carreraId && dto.carreraId !== planOrigen.carreraId) {
      throw new BadRequestException('La carrera no coincide con la de los planes');
    }

    const anterior = await this.repositorioProceso.findOne({
      where: { planOrigenId: dto.planOrigenId, planDestinoId: dto.planDestinoId },
      order: { version: 'DESC' },
    });
    const version = anterior ? anterior.version + 1 : 1;

    const proceso = this.repositorioProceso.create({
      carreraId: planOrigen.carreraId,
      planOrigenId: dto.planOrigenId,
      planDestinoId: dto.planDestinoId,
      version,
      estado: EstadoProcesoConvalidacion.BORRADOR,
      notas: dto.notas ?? null,
    });

    const guardado = await this.repositorioProceso.save(proceso);

    // Una versión nueva parte de las equivalencias de la versión anterior, para
    // no perder el trabajo ya hecho. El usuario las ajusta antes de aprobar.
    if (anterior) {
      const previas = await this.repositorioEquivalencia.find({
        where: { procesoId: anterior.id },
      });
      if (previas.length > 0) {
        const copias = previas.map((equivalencia) =>
          this.repositorioEquivalencia.create({
            procesoId: guardado.id,
            materiaPlanOrigenId: equivalencia.materiaPlanOrigenId,
            materiaPlanDestinoId: equivalencia.materiaPlanDestinoId,
            resultado: equivalencia.resultado,
            observacion: equivalencia.observacion,
          }),
        );
        await this.repositorioEquivalencia.save(copias);
      }
    }

    return guardado;
  }

  async listar(carreraId?: number, estado?: EstadoProcesoConvalidacion): Promise<ProcesoConvalidacion[]> {
    const consulta = this.repositorioProceso
      .createQueryBuilder('proceso')
      .leftJoinAndSelect('proceso.carrera', 'carrera')
      .leftJoinAndSelect('proceso.plan_origen', 'plan_origen')
      .leftJoinAndSelect('proceso.plan_destino', 'plan_destino');

    if (carreraId) {
      consulta.andWhere('proceso.carreraId = :carreraId', { carreraId });
    }

    if (estado) {
      consulta.andWhere('proceso.estado = :estado', { estado });
    }

    return consulta
      .orderBy('proceso.creadoEn', 'DESC')
      .getMany();
  }

  async obtenerUno(id: number): Promise<ProcesoConvalidacion> {
    const proceso = await this.repositorioProceso.findOne({
      where: { id },
      relations: ['carrera', 'plan_origen', 'plan_destino', 'aprobador'],
    });
    if (!proceso) {
      throw new NotFoundException(`Proceso de convalidación con ID ${id} no encontrado`);
    }
    return proceso;
  }

  async actualizar(id: number, dto: ActualizarProcesoConvalidacionDto): Promise<ProcesoConvalidacion> {
    const proceso = await this.obtenerUno(id);
    this.exigirBorrador(proceso, 'modificar');
    if (dto.notas !== undefined) {
      proceso.notas = dto.notas;
    }
    return this.repositorioProceso.save(proceso);
  }

  async eliminar(id: number): Promise<void> {
    const proceso = await this.obtenerUno(id);
    if (proceso.estado === EstadoProcesoConvalidacion.APROBADO) {
      throw new ConflictException(
        'No se puede eliminar una matriz aprobada; archívela o cree una nueva versión',
      );
    }
    await this.repositorioProceso.remove(proceso);
  }

  async aprobar(
    id: number,
    dto: AprobarProcesoConvalidacionDto,
    usuarioId?: number,
  ): Promise<ProcesoConvalidacion> {
    const proceso = await this.obtenerUno(id);

    if (proceso.estado === EstadoProcesoConvalidacion.APROBADO) {
      throw new ConflictException('La matriz ya está aprobada');
    }

    const equivalencias = await this.repositorioEquivalencia.find({
      where: { procesoId: id },
    });

    if (equivalencias.length === 0) {
      throw new BadRequestException('No se puede aprobar una matriz sin equivalencias definidas');
    }

    proceso.estado = EstadoProcesoConvalidacion.APROBADO;
    proceso.numeroResolucion = dto.numeroResolucion ?? proceso.numeroResolucion ?? null;
    proceso.fechaResolucion = dto.fechaResolucion
      ? new Date(dto.fechaResolucion)
      : proceso.fechaResolucion ?? null;
    proceso.aprobadoPor = dto.aprobadoPor ?? usuarioId ?? null;
    proceso.aprobadoEn = new Date();

    return this.repositorioProceso.save(proceso);
  }

  // ---------------------------------------------------------------------------
  // Equivalencias de la matriz
  // ---------------------------------------------------------------------------

  async guardarEquivalencia(
    procesoId: number,
    dto: GuardarEquivalenciaPlanDto,
  ): Promise<EquivalenciaPlan> {
    const proceso = await this.obtenerUno(procesoId);
    this.exigirBorrador(proceso, 'modificar equivalencias de');

    const { destino } = await this.validarRelacion(
      proceso,
      dto.materiaPlanOrigenId,
      dto.materiaPlanDestinoId,
      dto.resultado,
    );

    // Upsert por (proceso, origen, destino). Para "sin correspondencia" el
    // destino es nulo, por lo que se busca una fila existente del mismo origen
    // sin destino.
    const existente = await this.repositorioEquivalencia.findOne({
      where: {
        procesoId,
        materiaPlanOrigenId: dto.materiaPlanOrigenId,
        materiaPlanDestinoId: destino ? destino.id : IsNull(),
      },
    });

    if (existente) {
      existente.resultado = dto.resultado;
      existente.observacion = dto.observacion ?? null;
      existente.materiaPlanDestinoId = destino ? destino.id : null;
      return this.repositorioEquivalencia.save(existente);
    }

    const equivalencia = this.repositorioEquivalencia.create({
      procesoId,
      materiaPlanOrigenId: dto.materiaPlanOrigenId,
      materiaPlanDestinoId: destino ? destino.id : null,
      resultado: dto.resultado,
      observacion: dto.observacion ?? null,
    });
    return this.repositorioEquivalencia.save(equivalencia);
  }

  async actualizarEquivalencia(
    procesoId: number,
    equivalenciaId: number,
    dto: GuardarEquivalenciaPlanDto,
  ): Promise<EquivalenciaPlan> {
    const proceso = await this.obtenerUno(procesoId);
    this.exigirBorrador(proceso, 'modificar equivalencias de');

    const equivalencia = await this.repositorioEquivalencia.findOne({
      where: { id: equivalenciaId, procesoId },
    });
    if (!equivalencia) {
      throw new NotFoundException('Equivalencia no encontrada en este proceso');
    }

    const { destino } = await this.validarRelacion(
      proceso,
      dto.materiaPlanOrigenId,
      dto.materiaPlanDestinoId,
      dto.resultado,
    );

    // Evita duplicar otra relación con el mismo origen y destino.
    const duplicada = await this.repositorioEquivalencia.findOne({
      where: {
        procesoId,
        materiaPlanOrigenId: dto.materiaPlanOrigenId,
        materiaPlanDestinoId: destino ? destino.id : IsNull(),
      },
    });
    if (duplicada && duplicada.id !== equivalencia.id) {
      throw new ConflictException('Ya existe una equivalencia para esa materia de origen y destino');
    }

    equivalencia.materiaPlanOrigenId = dto.materiaPlanOrigenId;
    equivalencia.materiaPlanDestinoId = destino ? destino.id : null;
    equivalencia.resultado = dto.resultado;
    equivalencia.observacion = dto.observacion ?? null;
    return this.repositorioEquivalencia.save(equivalencia);
  }

  async eliminarEquivalencia(procesoId: number, equivalenciaId: number): Promise<void> {
    const proceso = await this.obtenerUno(procesoId);
    this.exigirBorrador(proceso, 'modificar equivalencias de');

    const equivalencia = await this.repositorioEquivalencia.findOne({
      where: { id: equivalenciaId, procesoId },
    });
    if (!equivalencia) {
      throw new NotFoundException('Equivalencia no encontrada en este proceso');
    }
    await this.repositorioEquivalencia.remove(equivalencia);
  }

  /**
   * Valida que la materia de origen pertenezca al plan de origen, que la de
   * destino (si existe) pertenezca al plan de destino, y que el resultado sea
   * coherente con la presencia de destino.
   */
  private async validarRelacion(
    proceso: ProcesoConvalidacion,
    materiaPlanOrigenId: number,
    materiaPlanDestinoId: number | undefined,
    resultado: ResultadoEquivalencia,
  ): Promise<{ destino: MateriaPlan | null }> {
    const origen = await this.repositorioMateriaPlan.findOne({
      where: { id: materiaPlanOrigenId },
    });
    if (!origen || origen.planEstudioId !== proceso.planOrigenId) {
      throw new BadRequestException(
        'La materia de origen no pertenece al plan de origen del proceso',
      );
    }

    let destino: MateriaPlan | null = null;
    if (materiaPlanDestinoId) {
      destino = await this.repositorioMateriaPlan.findOne({
        where: { id: materiaPlanDestinoId },
      });
      if (!destino || destino.planEstudioId !== proceso.planDestinoId) {
        throw new BadRequestException(
          'La materia de destino no pertenece al plan de destino del proceso',
        );
      }
    }

    if (resultado === ResultadoEquivalencia.SIN_CORRESPONDENCIA && destino) {
      throw new BadRequestException(
        'Una materia sin correspondencia no debe tener materia de destino',
      );
    }
    if (resultado !== ResultadoEquivalencia.SIN_CORRESPONDENCIA && !destino) {
      throw new BadRequestException(
        'Debe indicar la materia de destino para este resultado',
      );
    }

    return { destino };
  }

  // ---------------------------------------------------------------------------
  // Comparación de planes
  // ---------------------------------------------------------------------------
  async comparar(procesoId: number) {
    const proceso = await this.obtenerUno(procesoId);

    const [materiasOrigen, materiasDestino, equivalencias] = await Promise.all([
      this.obtenerMateriasDelPlan(proceso.planOrigenId),
      this.obtenerMateriasDelPlan(proceso.planDestinoId),
      this.repositorioEquivalencia.find({
        where: { procesoId },
        order: { id: 'ASC' },
      }),
    ]);

    const destinoReferenciado = new Set(
      equivalencias
        .filter((e) => e.materiaPlanDestinoId !== null)
        .map((e) => e.materiaPlanDestinoId as number),
    );

    const origenConEquivalencia = new Set(equivalencias.map((e) => e.materiaPlanOrigenId));

    const equivalentes = equivalencias.filter(
      (e) => e.resultado === ResultadoEquivalencia.EQUIVALENTE,
    ).length;
    const requierenValidacion = equivalencias.filter(
      (e) => e.resultado === ResultadoEquivalencia.REQUIERE_VALIDACION,
    ).length;
    const sinCorrespondencia = equivalencias.filter(
      (e) => e.resultado === ResultadoEquivalencia.SIN_CORRESPONDENCIA,
    ).length;
    const sinClasificar = materiasOrigen.filter((m) => !origenConEquivalencia.has(m.id)).length;
    const nuevas = materiasDestino.filter((m) => !destinoReferenciado.has(m.id)).length;

    return {
      proceso,
      planOrigen: proceso.plan_origen,
      planDestino: proceso.plan_destino,
      origenPorSemestre: this.agruparPorSemestre(materiasOrigen),
      destinoPorSemestre: this.agruparPorSemestre(materiasDestino),
      equivalencias: equivalencias.map((e) => ({
        id: e.id,
        materiaPlanOrigenId: e.materiaPlanOrigenId,
        materiaPlanDestinoId: e.materiaPlanDestinoId,
        resultado: e.resultado,
        observacion: e.observacion,
      })),
      resumen: {
        totalOrigen: materiasOrigen.length,
        totalDestino: materiasDestino.length,
        equivalentes,
        requierenValidacion,
        sinCorrespondencia,
        sinClasificar,
        nuevas,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------------------

  private exigirBorrador(proceso: ProcesoConvalidacion, accion: string): void {
    if (proceso.estado !== EstadoProcesoConvalidacion.BORRADOR) {
      throw new ConflictException(
        `No se puede ${accion} una matriz que no está en borrador; cree una nueva versión`,
      );
    }
  }

  private async obtenerMateriasDelPlan(planId: number): Promise<MateriaPlanPlana[]> {
    const registros = await this.repositorioMateriaPlan.find({
      where: { planEstudioId: planId },
      relations: ['materia'],
      order: { semestre: 'ASC' },
    });
    return registros
      .map((materiaPlan) => this.mapearMateria(materiaPlan))
      .sort((a, b) => a.semestre - b.semestre || (a.nombre ?? '').localeCompare(b.nombre ?? ''));
  }

  private mapearMateria(materiaPlan: MateriaPlan): MateriaPlanPlana {
    return {
      id: materiaPlan.id,
      materiaId: materiaPlan.materiaId,
      codigo: materiaPlan.materia?.codigo ?? null,
      nombre: materiaPlan.materia?.nombre ?? null,
      semestre: materiaPlan.semestre,
      horasSemanales: materiaPlan.horasSemanales,
      prerrequisitoId: materiaPlan.prerrequisitoId ?? null,
    };
  }

  private agruparPorSemestre(materias: MateriaPlanPlana[]) {
    const mapa = new Map<number, MateriaPlanPlana[]>();
    for (const materia of materias) {
      const lista = mapa.get(materia.semestre) ?? [];
      lista.push(materia);
      mapa.set(materia.semestre, lista);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([semestre, lista]) => ({ semestre, materias: lista }));
  }
}
