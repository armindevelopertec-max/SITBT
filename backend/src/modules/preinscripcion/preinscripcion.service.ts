import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Estudiante, StudentStatus } from '../../entities/estudiante.entity';
import { Pago, EstadoPago } from '../../entities/pago.entity';
import { ConceptoPago, PaymentConceptType } from '../../entities/concepto-pago.entity';
import { Inscripcion, EstadoInscripcion } from '../../entities/inscripcion.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';
import { Grupo } from '../../entities/grupo.entity';
import { Turno } from '../../entities/turno.entity';
import { Periodo } from '../../entities/periodo.entity';
import { Gestion, GestionStatus } from '../../entities/gestion.entity';
import { Calificacion } from '../../entities/calificacion.entity';
import { EmittedDocument, DocumentType } from '../../entities/emitted-document.entity';
import { VerifyPaymentsDto, CheckPaymentResult } from './dto/verify-payments.dto';
import { CalculateSubjectsDto, CalculateSubjectsResult, SubjectToEnroll } from './dto/calculate-subjects.dto';
import { CreateEnrollmentBatchDto, CreateEnrollmentResult } from './dto/create-enrollment-batch.dto';

@Injectable()
export class PreinscripcionService {
  constructor(
    @InjectRepository(Estudiante)
    private studentRepository: Repository<Estudiante>,
    @InjectRepository(Pago)
    private paymentRepository: Repository<Pago>,
    @InjectRepository(ConceptoPago)
    private conceptRepository: Repository<ConceptoPago>,
    @InjectRepository(Inscripcion)
    private enrollmentRepository: Repository<Inscripcion>,
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
    @InjectRepository(EmittedDocument)
    private documentRepository: Repository<EmittedDocument>,
  ) {}

  async verifyPayments(dto: VerifyPaymentsDto): Promise<CheckPaymentResult> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      relations: ['persona'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { year: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.number === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const isNewStudent = student.admission_gestion === dto.gestion;
    const payments = await this.paymentRepository.find({
      where: {
        student_id: dto.studentId,
        gestion: dto.gestion,
        status: EstadoPago.PAGADO,
      },
      relations: ['concepto'],
    });

    const concepts = await this.conceptRepository.find({
      where: { status: 'activo' as any },
    });

    const paidPayments: CheckPaymentResult['paidPayments'] = [];
    const missingPayments: CheckPaymentResult['missingPayments'] = [];

    for (const payment of payments) {
      paidPayments.push({
        type: payment.concepto?.type || 'unknown',
        concept: payment.concepto?.name || 'Desconocido',
        amount: Number(payment.amount),
        paymentDate: payment.payment_date,
      });
    }

    if (isNewStudent) {
      const hasUnico = payments.some(p => p.concepto?.type === PaymentConceptType.UNICO);
      if (!hasUnico) {
        const unicoConcept = concepts.find(c => c.type === PaymentConceptType.UNICO);
        if (unicoConcept) {
          missingPayments.push({
            type: PaymentConceptType.UNICO,
            concept: unicoConcept.name,
            amount: Number(unicoConcept.default_amount),
          });
        }
      }
    }

    const hasSemestral = payments.some(p =>
      p.concepto?.type === PaymentConceptType.SEMESTRAL &&
      p.concepto?.name?.toLowerCase().includes(periodoNumero.toLowerCase())
    );

    if (!hasSemestral) {
      const semestralConcept = concepts.find(c => c.type === PaymentConceptType.SEMESTRAL);
      if (semestralConcept) {
        missingPayments.push({
          type: PaymentConceptType.SEMESTRAL,
          concept: `${semestralConcept.name} - ${periodoNumero}/${dto.gestion}`,
          amount: Number(semestralConcept.default_amount),
        });
      }
    }

    return {
      canEnroll: missingPayments.length === 0,
      missingPayments,
      paidPayments,
      isNewStudent,
    };
  }

  async calculateSubjects(dto: CalculateSubjectsDto): Promise<CalculateSubjectsResult> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      relations: ['plan_estudio', 'carrera'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { year: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.number === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const isNewStudent = student.admission_gestion === dto.gestion;

    if (isNewStudent) {
      return this.calculateNewStudentSubjects(student, dto, periodoNumero);
    }

    return this.calculateOldStudentSubjects(student, dto, gestion, periodoNumero);
  }

  private async calculateNewStudentSubjects(
    student: Estudiante,
    dto: CalculateSubjectsDto,
    periodoNumero: string,
  ): Promise<CalculateSubjectsResult> {
    const materiasPlan = await this.materiaPlanRepository.find({
      where: { study_plan_id: student.study_plan_id },
      relations: ['materia', 'prerequisite'],
      order: { semester: 'ASC' },
    });

    const firstSemesterMaterias = materiasPlan.filter(m => m.semester === 1);

    const subjects: SubjectToEnroll[] = firstSemesterMaterias.map(m => ({
      materiaPlanId: m.id,
      subjectId: m.subject_id,
      subjectCode: m.materia?.code || '',
      subjectName: m.materia?.name || '',
      semester: m.semester,
      isFromFailed: false,
      prerequisiteBlocked: false,
    }));

    return {
      canEnroll: true,
      currentSemester: 1,
      subjects,
      failedSubjects: [],
      blockedSubjects: [],
      totalReprobadas: 0,
      message: 'Estudiante nuevo - Primer semestre',
    };
  }

  private async calculateOldStudentSubjects(
    student: Estudiante,
    dto: CalculateSubjectsDto,
    gestion: Gestion,
    periodoNumero: string,
  ): Promise<CalculateSubjectsResult> {
    const previousPeriodoNumero = periodoNumero === 'II' ? 'I' : null;
    const previousGestion = previousPeriodoNumero ? gestion.year : String(parseInt(gestion.year) - 1);

    const failedSubjects: CalculateSubjectsResult['failedSubjects'] = [];
    let totalReprobadas = 0;
    let currentSemester = 1;

    if (previousPeriodoNumero) {
      const previousEnrollments = await this.enrollmentRepository.find({
        where: {
          student_id: student.id,
          gestion: previousGestion,
        },
        relations: ['materia', 'materiaPlan'],
      });

      for (const enrollment of previousEnrollments) {
        if (enrollment.status === EstadoInscripcion.REPROBADO) {
          failedSubjects.push({
            subjectId: enrollment.subject_id,
            subjectName: enrollment.materia?.name || 'Desconocida',
            grade: enrollment.final_grade || 0,
            previousGestion: previousGestion,
          });
          totalReprobadas++;
        }
        if (enrollment.materiaPlan?.semester) {
          currentSemester = Math.max(currentSemester, enrollment.materiaPlan.semester + 1);
        }
      }
    }

    const materiasPlan = await this.materiaPlanRepository.find({
      where: { study_plan_id: student.study_plan_id },
      relations: ['materia', 'prerequisite'],
      order: { semester: 'ASC' },
    });

    const subjects: SubjectToEnroll[] = [];
    const blockedSubjects: CalculateSubjectsResult['blockedSubjects'] = [];

    const failedSubjectIds = failedSubjects.map(f => f.subjectId);

    if (totalReprobadas >= 3) {
      for (const failed of failedSubjects) {
        const materiaPlan = materiasPlan.find(m => m.subject_id === failed.subjectId);
        if (materiaPlan) {
          subjects.push({
            materiaPlanId: materiaPlan.id,
            subjectId: failed.subjectId,
            subjectCode: materiaPlan.materia?.code || '',
            subjectName: materiaPlan.materia?.name || '',
            semester: materiaPlan.semester,
            isFromFailed: true,
            failedPreviousGrade: failed.grade,
            prerequisiteBlocked: false,
          });
        }
      }

      return {
        canEnroll: true,
        currentSemester,
        subjects,
        failedSubjects,
        blockedSubjects,
        totalReprobadas,
        message: `Tienes ${totalReprobadas} materias reprobadas. Solo puedes inscribir las materias reprobadas.`,
      };
    }

    const approvedSubjectIds: number[] = [];
    if (previousPeriodoNumero) {
      const previousEnrollments = await this.enrollmentRepository.find({
        where: {
          student_id: student.id,
          gestion: previousGestion,
        },
      });

      for (const enrollment of previousEnrollments) {
        if (enrollment.status === EstadoInscripcion.APROBADO) {
          approvedSubjectIds.push(enrollment.subject_id);
        }
      }
    }

    const semestresCursados = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('DISTINCT enrollment.semester', 'semester')
      .where('enrollment.student_id = :studentId', { studentId: student.id })
      .getRawOne();

    const semesterToEnroll = failedSubjects.length > 0 ? currentSemester - 1 : currentSemester;

    const materiasSemestre = materiasPlan.filter(m => m.semester === semesterToEnroll);

    for (const materia of materiasSemestre) {
      if (failedSubjectIds.includes(materia.subject_id)) {
        continue;
      }

      let prerequisiteBlocked = false;
      let prerequisiteName: string | undefined;

      if (materia.prerequisite_id) {
        const prerequisiteApproved = approvedSubjectIds.includes(materia.prerequisite_id);
        const prerequisiteFailed = failedSubjectIds.includes(materia.prerequisite_id);

        if (!prerequisiteApproved && !prerequisiteFailed) {
          const prerequisite = await this.materiaRepository.findOne({
            where: { id: materia.prerequisite_id },
          });
          prerequisiteBlocked = true;
          prerequisiteName = prerequisite?.name || 'Prerrequisito';

          blockedSubjects.push({
            subjectId: materia.subject_id,
            subjectName: materia.materia?.name || '',
            reason: `Prerrequisito no aprobado: ${prerequisite?.name}`,
          });

          continue;
        }

        if (prerequisiteFailed) {
          const prerequisite = await this.materiaRepository.findOne({
            where: { id: materia.prerequisite_id },
          });
          prerequisiteBlocked = true;
          prerequisiteName = prerequisite?.name || 'Prerrequisito';
        }
      }

      subjects.push({
        materiaPlanId: materia.id,
        subjectId: materia.subject_id,
        subjectCode: materia.materia?.code || '',
        subjectName: materia.materia?.name || '',
        semester: materia.semester,
        isFromFailed: false,
        prerequisiteBlocked,
        prerequisiteName,
      });
    }

    for (const failed of failedSubjects) {
      const materiaPlan = materiasPlan.find(m => m.subject_id === failed.subjectId);
      if (materiaPlan) {
        subjects.push({
          materiaPlanId: materiaPlan.id,
          subjectId: failed.subjectId,
          subjectCode: materiaPlan.materia?.code || '',
          subjectName: materiaPlan.materia?.name || '',
          semester: materiaPlan.semester,
          isFromFailed: true,
          failedPreviousGrade: failed.grade,
          prerequisiteBlocked: false,
        });
      }
    }

    subjects.sort((a, b) => a.semester - b.semester);

    return {
      canEnroll: true,
      currentSemester: semesterToEnroll,
      subjects,
      failedSubjects,
      blockedSubjects,
      totalReprobadas,
      message: failedSubjects.length > 0
        ? `Tienes ${totalReprobadas} materias reprobadas. Cursarás ${subjects.length} materias (${materiasSemestre.length - blockedSubjects.length} del semestre + ${failedSubjects.length} reprobadas en paralelo).`
        : 'Cursarás las materias correspondientes al semestre actual.',
    };
  }

  async createEnrollmentBatch(dto: CreateEnrollmentBatchDto): Promise<CreateEnrollmentResult> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.gestionRepository.findOne({
      where: { year: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.getCurrentPeriodoNumero(gestion);
    const periodo = gestion.periodos?.find(p => p.number === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const group = await this.groupRepository.findOne({
      where: { id: dto.groupId },
      relations: ['turno', 'carrera'],
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const enrollments: { id: number; subjectName: string; groupName: string }[] = [];

    for (const subject of dto.subjects) {
      const existing = await this.enrollmentRepository.findOne({
        where: {
          student_id: dto.studentId,
          subject_id: subject.subjectId,
          gestion: dto.gestion,
        },
      });

      if (existing) {
        continue;
      }

      const enrollment = this.enrollmentRepository.create({
        student_id: dto.studentId,
        subject_id: subject.subjectId,
        group_id: dto.groupId,
        gestion: dto.gestion,
        semester: subject.semester,
        status: EstadoInscripcion.CURSANDO,
      });

      const saved = await this.enrollmentRepository.save(enrollment);
      enrollments.push({
        id: saved.id,
        subjectName: subject.subjectName,
        groupName: `${group.parallel}-${dto.gestion}`,
      });
    }

    const numDocumento = `BOL-INS-${dto.gestion}-${periodoNumero}-${student.inscription_code}-${Date.now()}`;

    const boleta = this.documentRepository.create({
      estudiante_id: dto.studentId,
      tipo: DocumentType.BOLETA_INSCRIPCION,
      numeroDocumento: numDocumento,
      gestion: dto.gestion,
      gestion_id: gestion.id,
    });

    const savedBoleta = await this.documentRepository.save(boleta);

    return {
      success: true,
      enrollments,
      boletaId: savedBoleta.id,
      message: `Se crearon ${enrollments.length} inscripciones para ${periodoNumero}/${dto.gestion}`,
    };
  }

  async getEnrollmentBoleta(estudianteId: number, gestion: string, periodo?: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id: estudianteId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestionEntity = await this.gestionRepository.findOne({
      where: { year: gestion },
      relations: ['periodos'],
    });

    if (!gestionEntity) {
      throw new NotFoundException(`Gestión ${gestion} no encontrada`);
    }

    const periodoNumero = periodo || this.getCurrentPeriodoNumero(gestionEntity);
    const periodoEntity = gestionEntity.periodos?.find(p => p.number === periodoNumero);

      const enrollments = await this.enrollmentRepository.find({
      where: {
        student_id: estudianteId,
        gestion: gestion,
      },
      relations: ['materia', 'grupo', 'grupo.turno'],
    });

    const boleta = await this.documentRepository.findOne({
      where: {
        estudiante_id: estudianteId,
        gestion: gestion,
        tipo: DocumentType.BOLETA_INSCRIPCION,
      },
      order: { fechaEmision: 'DESC' },
    });

    return {
      estudiante: {
        id: student.id,
        nombre: `${student.persona?.lastname_paternal || ''} ${student.persona?.lastname_maternal || ''} ${student.persona?.names || ''}`,
        ci: student.persona?.ci,
        codigo: student.inscription_code,
        carrera: student.carrera?.name,
        plan: student.plan_estudio?.rm_number,
      },
      gestion: {
        year: gestion,
        periodo: periodoNumero,
        periodoNombre: periodoEntity?.name,
      },
      boleta: boleta ? {
        numero: boleta.numeroDocumento,
        fechaEmision: boleta.fechaEmision,
        estado: boleta.estado,
      } : null,
      materias: enrollments.map(e => ({
        id: e.id,
        codigo: e.materia?.code,
        nombre: e.materia?.name,
        turno: e.grupo?.turno?.code,
        turnoNombre: e.grupo?.turno?.name,
        paralelo: e.grupo?.parallel,
        grupo: `${e.grupo?.parallel}-${gestion}`,
        estado: e.status,
      })),
      totalMaterias: enrollments.length,
    };
  }

  private getCurrentPeriodoNumero(gestion: Gestion): string {
    const now = new Date();
    const periodo = gestion.periodos?.find(p => {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      return now >= start && now <= end;
    });
    return periodo?.number || 'I';
  }

  async getGroupsByCareerAndSemester(
    careerId: number,
    gestion: string,
    semester: number,
    shiftId?: number,
  ): Promise<Grupo[]> {
    const query = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.turno', 'turno')
      .leftJoinAndSelect('group.carrera', 'career')
      .where('group.career_id = :careerId', { careerId })
      .andWhere('group.gestion = :gestion', { gestion })
      .andWhere('group.semester = :semester', { semester });

    if (shiftId) {
      query.andWhere('group.shift_id = :shiftId', { shiftId });
    }

    return query.getMany();
  }

  async getOpenPeriodo(gestionYear: string): Promise<Periodo | null> {
    const gestion = await this.gestionRepository.findOne({
      where: { year: gestionYear },
      relations: ['periodos'],
    });

    if (!gestion) {
      return null;
    }

    return gestion.periodos?.find(p => p.status === GestionStatus.ABIERTA) || null;
  }
}
