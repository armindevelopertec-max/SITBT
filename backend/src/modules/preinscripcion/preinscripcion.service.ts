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
export class ServicioPreinscripcion {
  constructor(
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    @InjectRepository(Pago)
    private repositorioPago: Repository<Pago>,
    @InjectRepository(ConceptoPago)
    private repositorioConcepto: Repository<ConceptoPago>,
    @InjectRepository(Inscripcion)
    private repositorioInscripcion: Repository<Inscripcion>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private repositorioMateria: Repository<Materia>,
    @InjectRepository(Grupo)
    private repositorioGrupo: Repository<Grupo>,
    @InjectRepository(Turno)
    private repositorioTurno: Repository<Turno>,
    @InjectRepository(Periodo)
    private repositorioPeriodo: Repository<Periodo>,
    @InjectRepository(Gestion)
    private repositorioGestion: Repository<Gestion>,
    @InjectRepository(Calificacion)
    private repositorioCalificacion: Repository<Calificacion>,
    @InjectRepository(DocumentoEmitido)
    private repositorioDocumento: Repository<DocumentoEmitido>,
  ) {}

  async verificarPagos(dto: VerificarPagosDto): Promise<ResultadoVerificarPagos> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { id: dto.estudianteId },
      relations: ['persona'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.repositorioGestion.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.obtenerNumeroPeriodoActual(gestion);
    const periodo = gestion.periodos?.find((periodoEncontrado) => periodoEncontrado.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const esEstudianteNuevo = estudiante.gestionAdmision === dto.gestion;
    const pagos = await this.repositorioPago.find({
      where: {
        estudianteId: dto.estudianteId,
        gestion: dto.gestion,
        estado: EstadoPago.PAGADO,
      },
      relations: ['concepto'],
    });

    const conceptos = await this.repositorioConcepto.find({
      where: { estado: 'activo' as any },
    });

    const pagosRealizados: ResultadoVerificarPagos['pagosRealizados'] = [];
    const pagosFaltantes: ResultadoVerificarPagos['pagosFaltantes'] = [];

    for (const pago of pagos) {
      pagosRealizados.push({
        tipo: pago.concepto?.tipo || 'unknown',
        concepto: pago.concepto?.nombre || 'Desconocido',
        monto: Number(pago.monto),
        fechaPago: pago.fechaPago,
      });
    }

    if (esEstudianteNuevo) {
      const tieneUnico = pagos.some(pago => pago.concepto?.tipo === TipoConceptoPago.UNICO);
      if (!tieneUnico) {
        const conceptoUnico = conceptos.find(concepto => concepto.tipo === TipoConceptoPago.UNICO);
        if (conceptoUnico) {
          pagosFaltantes.push({
            tipo: TipoConceptoPago.UNICO,
            concepto: conceptoUnico.nombre,
            monto: Number(conceptoUnico.montoPredeterminado),
          });
        }
      }
    }

    const tieneSemestral = pagos.some(pago =>
      pago.concepto?.tipo === TipoConceptoPago.SEMESTRAL &&
      pago.concepto?.nombre?.toLowerCase().includes(periodoNumero.toLowerCase())
    );

    if (!tieneSemestral) {
      const conceptoSemestral = conceptos.find(concepto => concepto.tipo === TipoConceptoPago.SEMESTRAL);
      if (conceptoSemestral) {
        pagosFaltantes.push({
          tipo: TipoConceptoPago.SEMESTRAL,
          concepto: `${conceptoSemestral.nombre} - ${periodoNumero}/${dto.gestion}`,
          monto: Number(conceptoSemestral.montoPredeterminado),
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

  async calcularMaterias(dto: CalcularMateriasDto): Promise<ResultadoCalcularMaterias> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { id: dto.estudianteId },
      relations: ['plan_estudio', 'carrera'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.repositorioGestion.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.obtenerNumeroPeriodoActual(gestion);
    const periodo = gestion.periodos?.find((periodoEncontrado) => periodoEncontrado.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const esEstudianteNuevo = estudiante.gestionAdmision === dto.gestion;

    if (esEstudianteNuevo) {
      return this.calcularMateriasEstudianteNuevo(estudiante, dto, periodoNumero);
    }

    return this.calcularMateriasEstudianteAntiguo(estudiante, dto, gestion, periodoNumero);
  }

  private async calcularMateriasEstudianteNuevo(
    estudiante: Estudiante,
    dto: CalcularMateriasDto,
    periodoNumero: string,
  ): Promise<ResultadoCalcularMaterias> {
    const materiasPlan = await this.repositorioMateriaPlan.find({
      where: { planEstudioId: estudiante.planEstudioId },
      relations: ['materia', 'prerrequisito'],
      order: { semestre: 'ASC' },
    });

    const materiasPrimerSemestre = materiasPlan.filter(materiaPlan => materiaPlan.semestre === 1);

    const materias: MateriaAInscribir[] = materiasPrimerSemestre.map(materiaPlan => ({
      materiaPlanId: materiaPlan.id,
      materiaId: materiaPlan.materiaId,
      materiaCodigo: materiaPlan.materia?.codigo || '',
      materiaNombre: materiaPlan.materia?.nombre || '',
      semestre: materiaPlan.semestre,
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

  private async calcularMateriasEstudianteAntiguo(
    estudiante: Estudiante,
    dto: CalcularMateriasDto,
    gestion: Gestion,
    periodoNumero: string,
  ): Promise<ResultadoCalcularMaterias> {
    const numeroPeriodoAnterior = periodoNumero === 'II' ? 'I' : null;
    const gestionAnterior = numeroPeriodoAnterior ? gestion.anio : String(parseInt(gestion.anio) - 1);

    const materiasReprobadas: ResultadoCalcularMaterias['materiasReprobadas'] = [];
    let totalReprobadas = 0;
    let semestreActual = 1;

    if (numeroPeriodoAnterior) {
      const inscripcionesAnteriores = await this.repositorioInscripcion.find({
        where: {
          estudianteId: estudiante.id,
          gestion: gestionAnterior,
        },
        relations: ['materia', 'materiaPlan'],
      });

      for (const inscripcion of inscripcionesAnteriores) {
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

    const materiasPlan = await this.repositorioMateriaPlan.find({
      where: { planEstudioId: estudiante.planEstudioId },
      relations: ['materia', 'prerrequisito'],
      order: { semestre: 'ASC' },
    });

    const materias: MateriaAInscribir[] = [];
    const materiasBloqueadas: ResultadoCalcularMaterias['materiasBloqueadas'] = [];

    const idsMateriasReprobadas = materiasReprobadas.map(reprobada => reprobada.materiaId);

    if (totalReprobadas >= 3) {
      for (const reprobada of materiasReprobadas) {
        const materiaDelPlan = materiasPlan.find(materiaPlan => materiaPlan.materiaId === reprobada.materiaId);
        if (materiaDelPlan) {
          materias.push({
            materiaPlanId: materiaDelPlan.id,
            materiaId: reprobada.materiaId,
            materiaCodigo: materiaDelPlan.materia?.codigo || '',
            materiaNombre: materiaDelPlan.materia?.nombre || '',
            semestre: materiaDelPlan.semestre,
            esReprobada: true,
            notaAnteriorReprobada: reprobada.nota,
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

    const idsMateriasAprobadas: number[] = [];
    if (numeroPeriodoAnterior) {
      const inscripcionesAnteriores = await this.repositorioInscripcion.find({
        where: {
          estudianteId: estudiante.id,
          gestion: gestionAnterior,
        },
      });

      for (const inscripcion of inscripcionesAnteriores) {
        if (inscripcion.estado === EstadoInscripcion.APROBADO) {
          idsMateriasAprobadas.push(inscripcion.materiaId);
        }
      }
    }

    const semestresCursados = await this.repositorioInscripcion
      .createQueryBuilder('inscripcion')
      .select('DISTINCT inscripcion.semestre', 'semestre')
      .where('inscripcion.estudianteId = :estudianteId', { estudianteId: estudiante.id })
      .getRawOne();

    const semestreAInscribir = materiasReprobadas.length > 0 ? semestreActual - 1 : semestreActual;

    const materiasSemestre = materiasPlan.filter(materiaPlan => materiaPlan.semestre === semestreAInscribir);

    for (const materia of materiasSemestre) {
      if (idsMateriasReprobadas.includes(materia.materiaId)) {
        continue;
      }

      let prerrequisitoBloqueado = false;
      let nombrePrerrequisito: string | undefined;

      if (materia.prerrequisitoId) {
        const prerrequisitoAprobado = idsMateriasAprobadas.includes(materia.prerrequisitoId);
        const prerrequisitoReprobado = idsMateriasReprobadas.includes(materia.prerrequisitoId);

        if (!prerrequisitoAprobado && !prerrequisitoReprobado) {
          const prerrequisito = await this.repositorioMateria.findOne({
            where: { id: materia.prerrequisitoId },
          });
          prerrequisitoBloqueado = true;
          nombrePrerrequisito = prerrequisito?.nombre || 'Prerrequisito';

          materiasBloqueadas.push({
            materiaId: materia.materiaId,
            materiaNombre: materia.materia?.nombre || '',
            razon: `Prerrequisito no aprobado: ${prerrequisito?.nombre}`,
          });

          continue;
        }

        if (prerrequisitoReprobado) {
          const prerrequisito = await this.repositorioMateria.findOne({
            where: { id: materia.prerrequisitoId },
          });
          prerrequisitoBloqueado = true;
          nombrePrerrequisito = prerrequisito?.nombre || 'Prerrequisito';
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

    for (const reprobada of materiasReprobadas) {
      const materiaDelPlan = materiasPlan.find(materiaPlan => materiaPlan.materiaId === reprobada.materiaId);
      if (materiaDelPlan) {
        materias.push({
          materiaPlanId: materiaDelPlan.id,
          materiaId: reprobada.materiaId,
          materiaCodigo: materiaDelPlan.materia?.codigo || '',
          materiaNombre: materiaDelPlan.materia?.nombre || '',
          semestre: materiaDelPlan.semestre,
          esReprobada: true,
          notaAnteriorReprobada: reprobada.nota,
          prerrequisitoBloqueado: false,
        });
      }
    }

    materias.sort((materiaA, materiaB) => materiaA.semestre - materiaB.semestre);

    return {
      puedeInscribir: true,
      semestreActual: semestreAInscribir,
      materias,
      materiasReprobadas,
      materiasBloqueadas,
      totalReprobadas,
      mensaje: materiasReprobadas.length > 0
        ? `Tienes ${totalReprobadas} materias reprobadas. Cursarás ${materias.length} materias (${materiasSemestre.length - materiasBloqueadas.length} del semestre + ${materiasReprobadas.length} reprobadas en paralelo).`
        : 'Cursarás las materias correspondientes al semestre actual.',
    };
  }

  async crearInscripcionLote(dto: CrearInscripcionLoteDto): Promise<ResultadoCrearInscripcion> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { id: dto.estudianteId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestion = await this.repositorioGestion.findOne({
      where: { anio: dto.gestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      throw new NotFoundException(`Gestión ${dto.gestion} no encontrada`);
    }

    const periodoNumero = dto.periodo || this.obtenerNumeroPeriodoActual(gestion);
    const periodo = gestion.periodos?.find((periodoEncontrado) => periodoEncontrado.numero === periodoNumero);

    if (!periodo) {
      throw new NotFoundException(`Período ${periodoNumero} no encontrado`);
    }

    const grupo = await this.repositorioGrupo.findOne({
      where: { id: dto.grupoId },
      relations: ['turno', 'carrera'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const inscripciones: { id: number; materiaNombre: string; nombreGrupo: string }[] = [];

    for (const materia of dto.materias) {
      const existente = await this.repositorioInscripcion.findOne({
        where: {
          estudianteId: dto.estudianteId,
          materiaId: materia.materiaId,
          gestion: dto.gestion,
        },
      });

      if (existente) {
        continue;
      }

      const inscripcion = this.repositorioInscripcion.create({
        estudianteId: dto.estudianteId,
        materiaId: materia.materiaId,
        grupoId: dto.grupoId,
        gestion: dto.gestion,
        semestre: materia.semestre,
        estado: EstadoInscripcion.CURSANDO,
      });

      const guardada = await this.repositorioInscripcion.save(inscripcion);
      inscripciones.push({
        id: guardada.id,
        materiaNombre: materia.materiaNombre,
        nombreGrupo: `${grupo.paralelo}-${dto.gestion}`,
      });
    }

    const numDocumento = `BOL-INS-${dto.gestion}-${periodoNumero}-${estudiante.codigoInscripcion}-${Date.now()}`;

    const boleta = this.repositorioDocumento.create({
      estudianteId: dto.estudianteId,
      tipo: TipoDocumento.BOLETA_INSCRIPCION,
      numeroDocumento: numDocumento,
      gestion: dto.gestion,
      gestionId: gestion.id,
    });

    const boletaGuardada = await this.repositorioDocumento.save(boleta);

    return {
      exito: true,
      inscripciones,
      boletaId: boletaGuardada.id,
      mensaje: `Se crearon ${inscripciones.length} inscripciones para ${periodoNumero}/${dto.gestion}`,
    };
  }

  async obtenerBoletaInscripcion(estudianteId: number, gestion: string, periodo?: string): Promise<any> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { id: estudianteId },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gestionEntidad = await this.repositorioGestion.findOne({
      where: { anio: gestion },
      relations: ['periodos'],
    });

    if (!gestionEntidad) {
      throw new NotFoundException(`Gestión ${gestion} no encontrada`);
    }

    const periodoNumero = periodo || this.obtenerNumeroPeriodoActual(gestionEntidad);
    const periodoEntidad = gestionEntidad.periodos?.find((periodoEncontrado) => periodoEncontrado.numero === periodoNumero);

      const inscripciones = await this.repositorioInscripcion.find({
      where: {
        estudianteId: estudianteId,
        gestion: gestion,
      },
      relations: ['materia', 'grupo', 'grupo.turno'],
    });

    const boleta = await this.repositorioDocumento.findOne({
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
        periodoNombre: periodoEntidad?.nombre,
      },
      boleta: boleta ? {
        numero: boleta.numeroDocumento,
        fechaEmision: boleta.fechaEmision,
        estado: boleta.estado,
      } : null,
      materias: inscripciones.map(inscripcion => ({
        id: inscripcion.id,
        codigo: inscripcion.materia?.codigo,
        nombre: inscripcion.materia?.nombre,
        turno: inscripcion.grupo?.turno?.codigo,
        turnoNombre: inscripcion.grupo?.turno?.nombre,
        paralelo: inscripcion.grupo?.paralelo,
        grupo: `${inscripcion.grupo?.paralelo}-${gestion}`,
        estado: inscripcion.estado,
      })),
      totalMaterias: inscripciones.length,
    };
  }

  private obtenerNumeroPeriodoActual(gestion: Gestion): string {
    const ahora = new Date();
    const periodo = gestion.periodos?.find((periodoEncontrado) => {
      const inicio = new Date(periodoEncontrado.fechaInicio);
      const fin = new Date(periodoEncontrado.fechaFin);
      return ahora >= inicio && ahora <= fin;
    });
    return periodo?.numero || 'I';
  }

  async obtenerGruposPorCarreraYSemestre(
    carreraId: number,
    gestion: string,
    semestre: number,
    turnoId?: number,
  ): Promise<Grupo[]> {
    const consulta = this.repositorioGrupo
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .where('grupo.carreraId = :carreraId', { carreraId })
      .andWhere('grupo.gestion = :gestion', { gestion })
      .andWhere('grupo.semestre = :semestre', { semestre });

    if (turnoId) {
      consulta.andWhere('grupo.turnoId = :turnoId', { turnoId });
    }

    return consulta.getMany();
  }

  async obtenerPeriodoAbierto(anioGestion: string): Promise<Periodo | null> {
    const gestion = await this.repositorioGestion.findOne({
      where: { anio: anioGestion },
      relations: ['periodos'],
    });

    if (!gestion) {
      return null;
    }

    return gestion.periodos?.find(periodo => periodo.estado === EstadoGestion.ABIERTA) || null;
  }
}
