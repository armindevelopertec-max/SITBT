import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEstudio, EstadoPlanEstudio } from '../../entidades/plan-estudio.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { CrearPlanEstudioDto } from './dto/crear-plan-estudio.dto';
import { ActualizarPlanEstudioDto } from './dto/actualizar-plan-estudio.dto';

@Injectable()
export class ServicioPlanesEstudio {
  constructor(
    @InjectRepository(PlanEstudio)
    private repositorioPlanEstudio: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private repositorioMateria: Repository<Materia>,
  ) {}

  async crear(crearPlanEstudioDto: CrearPlanEstudioDto): Promise<PlanEstudio> {
    const planEstudio = this.repositorioPlanEstudio.create(crearPlanEstudioDto);
    return this.repositorioPlanEstudio.save(planEstudio);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoPlanEstudio,
    carreraId?: number,
  ): Promise<{ datos: PlanEstudio[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioPlanEstudio
      .createQueryBuilder('planEstudio')
      .leftJoinAndSelect('planEstudio.carrera', 'carrera');

    if (estado) {
      consulta.andWhere('planEstudio.estado = :estado', { estado });
    }

    if (carreraId) {
      consulta.andWhere('planEstudio.carreraId = :carreraId', { carreraId });
    }

    const [datos, total] = await consulta
      .orderBy('planEstudio.fechaRm', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<PlanEstudio> {
    const planEstudio = await this.repositorioPlanEstudio.findOne({
      where: { id },
      relations: ['carrera'],
    });
    if (!planEstudio) {
      throw new NotFoundException(`Plan de estudio con ID ${id} no encontrado`);
    }
    return planEstudio;
  }

  async obtenerUnoConMaterias(id: number): Promise<any> {
    const planEstudio = await this.obtenerUno(id);
    const materias = await this.obtenerMaterias(id);
    const materiasDisponibles = await this.obtenerMateriasDisponibles();
    return {
      ...planEstudio,
      materias,
      materias_disponibles: materiasDisponibles,
    };
  }

  async actualizar(id: number, actualizarPlanEstudioDto: ActualizarPlanEstudioDto): Promise<PlanEstudio> {
    const planEstudio = await this.obtenerUno(id);
    Object.assign(planEstudio, actualizarPlanEstudioDto);
    return this.repositorioPlanEstudio.save(planEstudio);
  }

  async eliminar(id: number): Promise<void> {
    const planEstudio = await this.obtenerUno(id);
    await this.repositorioPlanEstudio.remove(planEstudio);
  }

  async buscarPorCarrera(carreraId: number): Promise<PlanEstudio[]> {
    return this.repositorioPlanEstudio.find({
      where: { carreraId },
      relations: ['carrera'],
      order: { fechaRm: 'DESC' },
    });
  }

  async obtenerActivos(): Promise<PlanEstudio[]> {
    return this.repositorioPlanEstudio.find({
      where: { estado: EstadoPlanEstudio.VIGENTE },
      relations: ['carrera'],
      order: { fechaRm: 'DESC' },
    });
  }

  async buscarActualPorCarrera(carreraId: number): Promise<PlanEstudio[]> {
    return this.repositorioPlanEstudio.find({
      where: { carreraId, estado: EstadoPlanEstudio.VIGENTE },
      relations: ['carrera'],
      order: { fechaRm: 'DESC' },
    });
  }

  /**
   * Devuelve el plan de estudio vigente de una carrera junto con sus materias,
   * en un formato apto para el sitio público (sin datos internos).
   */
  async buscarPublicoPorCarrera(carreraId: number): Promise<{ plan: PlanEstudio | null; materias: any[] }> {
    const planes = await this.buscarActualPorCarrera(carreraId);
    const plan = planes.length > 0 ? planes[0] : null;

    if (!plan) {
      return { plan: null, materias: [] };
    }

    const registros = await this.obtenerMaterias(plan.id);
    const materias = registros.map((materiaPlan) => ({
      id: materiaPlan.id,
      semestre: materiaPlan.semestre,
      horasSemanales: materiaPlan.horasSemanales,
      codigo: materiaPlan.materia?.codigo ?? null,
      nombre: materiaPlan.materia?.nombre ?? null,
      prerrequisito: materiaPlan.prerrequisito
        ? { codigo: materiaPlan.prerrequisito.codigo, nombre: materiaPlan.prerrequisito.nombre }
        : null,
    }));

    return { plan, materias };
  }

  async agregarMateria(planId: number, materiaId: number, semestre: number, horasSemanales: number, prerrequisitoId?: number): Promise<MateriaPlan> {
    const existente = await this.repositorioMateriaPlan.findOne({
      where: { planEstudioId: planId, materiaId },
    });
    if (existente) {
      throw new NotFoundException('Esta materia ya existe en el plan de estudio');
    }
    const materiaPlan = this.repositorioMateriaPlan.create({
      planEstudioId: planId,
      materiaId,
      semestre,
      horasSemanales,
      prerrequisitoId: prerrequisitoId ?? null,
    });
    return this.repositorioMateriaPlan.save(materiaPlan);
  }

  async eliminarMateria(materiaPlanId: number): Promise<void> {
    const materiaPlan = await this.repositorioMateriaPlan.findOne({
      where: { id: materiaPlanId },
    });
    if (!materiaPlan) {
      throw new NotFoundException(`MateriaPlan con ID ${materiaPlanId} no encontrado`);
    }
    await this.repositorioMateriaPlan.remove(materiaPlan);
  }

  async actualizarMateria(materiaPlanId: number, semestre: number, horasSemanales: number, prerrequisitoId?: number): Promise<MateriaPlan> {
    const materiaPlan = await this.repositorioMateriaPlan.findOne({
      where: { id: materiaPlanId },
    });
    if (!materiaPlan) {
      throw new NotFoundException(`MateriaPlan con ID ${materiaPlanId} no encontrado`);
    }
    materiaPlan.semestre = semestre;
    materiaPlan.horasSemanales = horasSemanales;
    materiaPlan.prerrequisitoId = prerrequisitoId ?? null;
    return this.repositorioMateriaPlan.save(materiaPlan);
  }

  async obtenerMaterias(planId: number): Promise<any[]> {
    const registros = await this.repositorioMateriaPlan.find({
      where: { planEstudioId: planId },
      relations: ['materia', 'prerrequisito'],
      order: { semestre: 'ASC' },
    });
    return registros.map((materiaPlan) => ({
      id: materiaPlan.id,
      planEstudioId: materiaPlan.planEstudioId,
      materiaId: materiaPlan.materiaId,
      semestre: materiaPlan.semestre,
      horasSemanales: materiaPlan.horasSemanales,
      prerrequisitoId: materiaPlan.prerrequisitoId,
      materia: materiaPlan.materia,
      prerrequisito: materiaPlan.prerrequisito,
    }));
  }

  async obtenerMateriasDisponibles(): Promise<Materia[]> {
    return this.repositorioMateria.find({
      order: { nombre: 'ASC' },
    });
  }
}
