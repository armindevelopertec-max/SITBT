import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Estudiante, EstadoEstudiante } from '../../entities/estudiante.entity';
import { Pago, EstadoPago } from '../../entities/pago.entity';
import { ConceptoPago, TipoConceptoPago } from '../../entities/concepto-pago.entity';
import { Inscripcion, EstadoInscripcion } from '../../entities/inscripcion.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';
import { Turno } from '../../entities/turno.entity';
import { Periodo } from '../../entities/periodo.entity';
import { Gestion, EstadoGestion } from '../../entities/gestion.entity';
import { Calificacion } from '../../entities/calificacion.entity';
import { DocumentoEmitido, TipoDocumento } from '../../entities/emitted-document.entity';
import { VerificarPagosDto, ResultadoVerificarPagos } from './dto/verify-payments.dto';
import { CalcularMateriasDto, ResultadoCalcularMaterias, MateriaAInscribir } from './dto/calculate-subjects.dto';
import { CrearInscripcionLoteDto, ResultadoCrearInscripcion } from './dto/create-enrollment-batch.dto';

@Injectable()
export class PreinscripcionService {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Pago)
    private paymentRepository: Repository<Pago>,
    @InjectRepository(ConceptoPago)
    private conceptRepository: Repository<ConceptoPago>,
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(MateriaPlan)
    private materiaPlanRepository: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
    @InjectRepository(Turno)
    private shiftRepository: Repository<Turno>,
    @InjectRepository(Periodo)
    private periodoRepository: Repository<Periodo>,
    @InjectRepository(Gestion)
    private gestionRepository: Repository<Gestion>,
    @InjectRepository(Calificacion)
    private calificacionRepository: Repository<Calificacion>,
    @InjectRepository(DocumentoEmitido)
    private documentRepository: Repository<DocumentoEmitido>,
  ) {}

  async verifyPayments(dto: VerificarPagosDto): Promise<ResultadoVerificarPagos> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: dto.estudianteId },
      relations: ['persona'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const esEstudianteNuevo = estudiante.gestionAdmision === dto.gestion;
    const payments = await this.paymentRepository.find({
      where: {
        estudianteId: dto.estudianteId,
        gestion: dto.gestion,
        estado: EstadoPago.PAGADO,
      },
      relations: ['concepto'],
    });

    const concepts = await this.conceptRepository.find({
      where: { estado: 'activo' as any },
    });

    const pagosRealizados: ResultadoVerificarPagos['pagosRealizados'] = [];
    const pagosFaltantes: ResultadoVerificarPagos['pagosFaltantes'] = [];

    for (const payment of payments) {
      pagosRealizados.push({
        tipo: payment.concepto?.tipo || 'unknown',
        concepto: payment.concepto?.nombre || 'Desconocido',
        monto: Number(payment.monto),
        fechaPago: payment.fechaPago,
      });
    }

    if (esEstudianteNuevo) {
      const hasUnico = payments.some(p => p.concepto?.tipo === TipoConceptoPago.UNICO);
      if (!hasUnico) {
        const unicoConcept = concepts.find(c => c.tipo === TipoConceptoPago.UNICO);
        if (unicoConcept) {
          pagosFaltantes.push({
            tipo: TipoConceptoPago.UNICO,
            concepto: unicoConcept.nombre,
            monto: Number(unicoConcept.montoPredeterminado),
          });
        }
      }
    }

    const hasSemestral = payments.some(p =>
      p.concepto?.tipo === TipoConceptoPago.SEMESTRAL &&
      p.concepto?.nombre?.toLowerCase().includes(periodoNumero.toLowerCase())
    );

    if (!hasSemestral) {
      const semestralConcept = concepts.find(c => c.tipo === TipoConceptoPago.SEMESTRAL);
      if (semestralConcept) {
        pagosFaltantes.push({
          tipo: TipoConceptoPago.SEMESTRAL,
          concepto: `${semestralConcept.nombre} - ${periodoNumero}/${dto.gestion}`,
          monto: Number(semestralConcept.montoPredeterminado),
        });
      }
    }

    return {
      puedeInscribir: pagosFaltantes.length === 0,
      pagosFaltantes,
      pagosRealizados,
      esEstudianteNuevo,
    };
  }

  async calculateSubjects(dto: CalcularMateriasDto): Promise<ResultadoCalcularMaterias> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: dto.estudianteId },
      relations: ['plan_estudio', 'carrera'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const esEstudianteNuevo = estudiante.gestionAdmision === dto.gestion;

    if (esEstudianteNuevo) {
      return this.calculateNewStudentSubjects(estudiante, dto, periodoNumero);
    }

    return this.calculateOldStudentSubjects(estudiante, dto, gestion, periodoNumero);
  }

  private async calculateNewStudentSubjects(
    estudiante: Estudiante,
    dto: CalcularMateriasDto,
    periodoNumero: string,
  ): Promise<ResultadoCalcularMaterias> {
    const materiasPlan = await this.materiaPlanRepository.find({
      where: { planEstudioId: estudiante.planEstudioId },
      relations: ['materia', 'prerrequisito'],
      order: { semestre: 'ASC' },
    });

    const firstSemesterMaterias = materiasPlan.filter(m => m.semestre === 1);

    const materias: MateriaAInscribir[] = firstSemesterMaterias.map(m => ({
      materiaPlanId: m.id,
      materiaId: m.materiaId,
      materiaCodigo: m.materia?.codigo || '',
      materiaNombre: m.materia?.nombre || '',
      semestre: m.semestre,
      esReprobada: false,
      prerrequisitoBloqueado: false,
    }));

    return {
      puedeInscribir: true,
      semestreActual: 1,
      materias,
      materiasReprobadas: [],
      materiasBloqueadas: [],
      totalReprobadas: 0,
      mensaje: 'Estudiante nuevo - Primer semestre',
    };
  }

  private async calculateOldStudentSubjects(
    estudiante: Estudiante,
    dto: CalcularMateriasDto,
    gestion: Gestion,
    periodoNumero: string,
  ): Promise<ResultadoCalcularMaterias> {
    const previousPeriodoNumero = periodoNumero === 'II' ? 'I' : null;
    const gestionAnterior = previousPeriodoNumero ? gestion.anio : String(parseInt(gestion.anio) - 1);

    const materiasReprobadas: ResultadoCalcularMaterias['materiasReprobadas'] = [];
    let totalReprobadas = 0;
    let semestreActual = 1;

    if (previousPeriodoNumero) {
      const previousEnrollments = await this.inscripcionRepository.find({
        where: {
          estudianteId: estudiante.id,
          gestion: gestionAnterior,
        },
        relations: ['materia', 'materiaPlan'],
      });

      for (const inscripcion of previousEnrollments) {
        if (inscripcion.estado === EstadoInscripcion.REPROBADO) {
          materiasReprobadas.push({
            materiaId: inscripcion.materiaId,
            materiaNombre: inscripcion.materia?.nombre || 'Desconocida',
            nota: inscripcion.notaFinal || 0,
            gestionAnterior: gestionAnterior,
          });
          totalReprobadas++;
        }
        if (inscripcion.materiaPlan?.semestre) {
          semestreActual = Math.max(semestreActual, inscripcion.materiaPlan.semestre + 1);
        }
      }
    }

    const materiasPlan = await this.materiaPlanRepository.find({
      where: { planEstudioId: estudiante.planEstudioId },
      relations: ['materia', 'prerrequisito'],
      order: { semestre: 'ASC' },
    });

    const materias: MateriaAInscribir[] = [];
    const materiasBloqueadas: ResultadoCalcularMaterias['materiasBloqueadas'] = [];

    const failedSubjectIds = materiasReprobadas.map(f => f.materiaId);

    if (totalReprobadas >= 3) {
      for (const failed of materiasReprobadas) {
        const materiaPlan = materiasPlan.find(m => m.materiaId === failed.materiaId);
        if (materiaPlan) {
          materias.push({
            materiaPlanId: materiaPlan.id,
            materiaId: failed.materiaId,
            materiaCodigo: materiaPlan.materia?.codigo || '',
            materiaNombre: materiaPlan.materia?.nombre || '',
            semestre: materiaPlan.semestre,
            esReprobada: true,
            notaAnteriorReprobada: failed.nota,
            prerrequisitoBloqueado: false,
          });
        }
      }

      return {
        puedeInscribir: true,
        semestreActual,
        materias,
        materiasReprobadas,
        materiasBloqueadas,
        totalReprobadas,
        mensaje: `Tienes ${totalReprobadas} materias reprobadas. Solo puedes inscribir las materias reprobadas.`,
      };
    }

    const approvedSubjectIds: number[] = [];
    if (previousPeriodoNumero) {
      const previousEnrollments = await this.inscripcionRepository.find({
        where: {
          estudianteId: estudiante.id,
          gestion: gestionAnterior,
        },
      });

      for (const inscripcion of previousEnrollments) {
        if (inscripcion.estado === EstadoInscripcion.APROBADO) {
          approvedSubjectIds.push(inscripcion.materiaId);
        }
      }
    }

    const semestresCursados = await this.inscripcionRepository
      .createQueryBuilder('inscripcion')
      .select('DISTINCT inscripcion.semestre', 'semester')
      .where('inscripcion.estudianteId = :estudianteId', { estudianteId: estudiante.id })
      .getRawOne();

    const semesterToEnroll = materiasReprobadas.length > 0 ? semestreActual - 1 : semestreActual;

    const materiasSemestre = materiasPlan.filter(m => m.semestre === semesterToEnroll);

    for (const materia of materiasSemestre) {
      if (failedSubjectIds.includes(materia.materiaId)) {
        continue;
      }

      let prerrequisitoBloqueado = false;
      let nombrePrerrequisito: string | undefined;

      if (materia.prerrequisitoId) {
        const prerequisiteApproved = approvedSubjectIds.includes(materia.prerrequisitoId);
        const prerequisiteFailed = failedSubjectIds.includes(materia.prerrequisitoId);

        if (!prerequisiteApproved && !prerequisiteFailed) {
          const prerequisite = await this.materiaRepository.findOne({
            where: { id: materia.prerrequisitoId },
          });
          prerrequisitoBloqueado = true;
          nombrePrerrequisito = prerequisite?.nombre || 'Prerrequisito';

          materiasBloqueadas.push({
            materiaId: materia.materiaId,
            materiaNombre: materia.materia?.nombre || '',
            razon: `Prerrequisito no aprobado: ${prerequisite?.nombre}`,
          });

          continue;
        }

        if (prerequisiteFailed) {
          const prerequisite = await this.materiaRepository.findOne({
            where: { id: materia.prerrequisitoId },
          });
          prerrequisitoBloqueado = true;
          nombrePrerrequisito = prerequisite?.nombre || 'Prerrequisito';
        }
      }

      materias.push({
        materiaPlanId: materia.id,
        materiaId: materia.materiaId,
        materiaCodigo: materia.materia?.codigo || '',
        materiaNombre: materia.materia?.nombre || '',
        semestre: materia.semestre,
        esReprobada: false,
        prerrequisitoBloqueado,
        nombrePrerrequisito,
      });
    }

    for (const failed of materiasReprobadas) {
      const materiaPlan = materiasPlan.find(m => m.materiaId === failed.materiaId);
      if (materiaPlan) {
        materias.push({
          materiaPlanId: materiaPlan.id,
          materiaId: failed.materiaId,
          materiaCodigo: materiaPlan.materia?.codigo || '',
          materiaNombre: materiaPlan.materia?.nombre || '',
          semestre: materiaPlan.semestre,
          esReprobada: true,
          notaAnteriorReprobada: failed.nota,
          prerrequisitoBloqueado: false,
        });
      }
    }

    materias.sort((a, b) => a.semestre - b.semestre);

    return {
      puedeInscribir: true,
      semestreActual: semesterToEnroll,
      materias,
      materiasReprobadas,
      materiasBloqueadas,
      totalReprobadas,
      mensaje: materiasReprobadas.length > 0
        ? `Tienes ${totalReprobadas} materias reprobadas. Cursarás ${materias.length} materias (${materiasSemestre.length - materiasBloqueadas.length} del semestre + ${materiasReprobadas.length} reprobadas en paralelo).`
        : 'Cursarás las materias correspondientes al semestre actual.',
    };
  }

  async createEnrollmentBatch(dto: CrearInscripcionLoteDto): Promise<ResultadoCrearInscripcion> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: dto.estudianteId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const grupo = await this.groupRepository.findOne({
      where: { id: dto.grupoId },
      relations: ['turno', 'carrera'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const inscripciones: { id: number; materiaNombre: string; nombreGrupo: string }[] = [];

    for (const materia of dto.materias) {
      const existing = await this.inscripcionRepository.findOne({
        where: {
          estudianteId: dto.estudianteId,
          materiaId: materia.materiaId,
          gestion: dto.gestion,
        },
      });

      if (existing) {
        continue;
      }

      const inscripcion = this.inscripcionRepository.create({
        estudianteId: dto.estudianteId,
        materiaId: materia.materiaId,
        grupoId: dto.grupoId,
        gestion: dto.gestion,
        semestre: materia.semestre,
        estado: EstadoInscripcion.CURSANDO,
      });

      const guardada = await this.inscripcionRepository.save(inscripcion);
      inscripciones.push({
        id: guardada.id,
        materiaNombre: materia.materiaNombre,
        nombreGrupo: `${grupo.paralelo}-${dto.gestion}`,
      });
    }

    const numDocumento = `BOL-INS-${dto.gestion}-${periodoNumero}-${estudiante.codigoInscripcion}-${Date.now()}`;

    const boleta = this.documentRepository.create({
      estudianteId: dto.estudianteId,
      tipo: TipoDocumento.BOLETA_INSCRIPCION,
      numeroDocumento: numDocumento,
      gestion: dto.gestion,
      gestionId: gestion.id,
    });

    const savedBoleta = await this.documentRepository.save(boleta);

    return {
      exito: true,
      inscripciones,
      boletaId: savedBoleta.id,
      mensaje: `Se crearon ${inscripciones.length} inscripciones para ${periodoNumero}/${dto.gestion}`,
    };
  }

  async getEnrollmentBoleta(estudianteId: number, gestion: string, periodo?: string): Promise<any> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestionEntity = await this.gestionRepository.findOne({
      where: { anio: gestion },
      relations: ['periodos'],
    });

    if (!gestionEntity) {
      throw new NotFoundException(`Gestión ${gestion} no encontrada`);
    }

    const periodoNumero = periodo || this.getCurrentPeriodoNumero(gestionEntity);
    const periodoEntity = gestionEntity.periodos?.find(p => p.numero === periodoNumero);

      const inscripciones = await this.inscripcionRepository.find({
      where: {
        estudianteId: estudianteId,
        gestion: gestion,
      },
      relations: ['materia', 'grupo', 'grupo.turno'],
    });

    const boleta = await this.documentRepository.findOne({
      where: {
        estudianteId: estudianteId,
        gestion: gestion,
        tipo: TipoDocumento.BOLETA_INSCRIPCION,
      },
      order: { fechaEmision: 'DESC' },
    });

    return {
      estudiante: {
        id: estudiante.id,
        nombre: `${estudiante.persona?.apellidoPaterno || ''} ${estudiante.persona?.apellidoMaterno || ''} ${estudiante.persona?.nombres || ''}`,
        ci: estudiante.persona?.ci,
        codigo: estudiante.codigoInscripcion,
        carrera: estudiante.carrera?.nombre,
        plan: estudiante.plan_estudio?.numeroRm,
      },
      gestion: {
        anio: gestion,
        periodo: periodoNumero,
        periodoNombre: periodoEntity?.nombre,
      },
      boleta: boleta ? {
        numero: boleta.numeroDocumento,
        fechaEmision: boleta.fechaEmision,
        estado: boleta.estado,
      } : null,
      materias: inscripciones.map(e => ({
        id: e.id,
        codigo: e.materia?.codigo,
        nombre: e.materia?.nombre,
        turno: e.grupo?.turno?.codigo,
        turnoNombre: e.grupo?.turno?.nombre,
        paralelo: e.grupo?.paralelo,
        grupo: `${e.grupo?.paralelo}-${gestion}`,
        estado: e.estado,
      })),
      totalMaterias: inscripciones.length,
    };
  }

  private getCurrentPeriodoNumero(gestion: Gestion): string {
    const now = new Date();
    const periodo = gestion.periodos?.find(p => {
      const start = new Date(p.fechaInicio);
      const end = new Date(p.fechaFin);
      return now >= start && now <= end;
    });
    return periodo?.numero || 'I';
  }

  async getGroupsByCareerAndSemester(
    carreraId: number,
    gestion: string,
    semestre: number,
    turnoId?: number,
  ): Promise<Grupo[]> {
    const query = this.groupRepository
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .where('grupo.carreraId = :carreraId', { carreraId })
      .andWhere('grupo.gestion = :gestion', { gestion })
      .andWhere('grupo.semestre = :semestre', { semestre: semestre });

    if (turnoId) {
      query.andWhere('grupo.turnoId = :turnoId', { turnoId: undefined });
    }

    return query.getMany();
  }

  async getOpenPeriodo(anioGestion: string): Promise<Periodo | null> {
    const gestion = await this.gestionRepository.findOne({
      where: { anio: anioGestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      return null;
    }

    return gestion.periodos?.find(p => p.estado === EstadoGestion.ABIERTA) || null;
  }
}
