import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Estudiante, EstadoEstudiante } from '../../entidades/estudiante.entidad';
import { Pago, EstadoPago } from '../../entidades/pago.entidad';
import { ConceptoPago, TipoConceptoPago, EstadoConceptoPago } from '../../entidades/concepto-pago.entidad';
import { Inscripcion, EstadoInscripcion } from '../../entidades/inscripcion.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Grupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { Turno } from '../../entidades/turno.entidad';
import { Periodo } from '../../entidades/periodo.entidad';
import { Gestion, EstadoGestion } from '../../entidades/gestion.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Calificacion } from '../../entidades/calificacion.entidad';
import { DocumentoEmitido, TipoDocumento } from '../../entidades/documento-emitido.entidad';
import { ServicioGrupos } from '../grupos/grupos.servicio';
import { ServicioMateriasImpartidas } from '../materias-impartidas/materias-impartidas.servicio';
import { VerificarPagosDto, ResultadoVerificarPagos } from './dto/verificar-pagos.dto';
import { CalcularMateriasDto, ResultadoCalcularMaterias, MateriaAInscribir } from './dto/calcular-materias.dto';
import {
  CrearInscripcionLoteDto,
  ResultadoCrearInscripcion,
  AsignacionGrupoDto,
} from './dto/crear-lote-inscripcion.dto';

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
    @InjectRepository(GrupoEstudiante)
    private repositorioGrupoEstudiante: Repository<GrupoEstudiante>,
    @InjectRepository(PlanEstudio)
    private repositorioPlanEstudio: Repository<PlanEstudio>,
    private readonly servicioGrupos: ServicioGrupos,
    private readonly servicioMateriasImpartidas: ServicioMateriasImpartidas,
    private readonly fuenteDatos: DataSource,
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
      where: { estado: EstadoConceptoPago.ACTIVO },
    });

    const pagosRealizados: ResultadoVerificarPagos['pagosRealizados'] = [];
    const pagosFaltantes: ResultadoVerificarPagos['pagosFaltantes'] = [];

    for (const pago of pagos) {
      // Un pago semestral solo cuenta si corresponde al período solicitado.
      if (
        pago.concepto?.tipo === TipoConceptoPago.SEMESTRAL &&
        !this.pagoCubrePeriodo(pago, periodoNumero)
      ) {
        continue;
      }
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

    const tieneSemestral = pagos.some(
      (pago) =>
        pago.concepto?.tipo === TipoConceptoPago.SEMESTRAL &&
        this.pagoCubrePeriodo(pago, periodoNumero),
    );

    if (!tieneSemestral) {
      const conceptoSemestral =
        conceptos.find(
          (concepto) =>
            concepto.tipo === TipoConceptoPago.SEMESTRAL &&
            this.nombreCubrePeriodo(concepto.nombre, periodoNumero),
        ) || conceptos.find((concepto) => concepto.tipo === TipoConceptoPago.SEMESTRAL);
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
    // En periodo II lo anterior es el periodo I de la misma gestión; en periodo I,
    // el periodo II de la gestión anterior. La tabla `inscripciones` no guarda el
    // periodo, por lo que se toma la gestión anterior completa.
    const gestionAnterior = periodoNumero === 'II' ? gestion.anio : String(parseInt(gestion.anio) - 1);

    const materiasReprobadas: ResultadoCalcularMaterias['materiasReprobadas'] = [];
    const idsMateriasAprobadas: number[] = [];
    let totalReprobadas = 0;
    let semestreActual = 1;

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
      } else if (inscripcion.estado === EstadoInscripcion.APROBADO) {
        idsMateriasAprobadas.push(inscripcion.materiaId);
      }

      const semestreCursado = inscripcion.materiaPlan?.semestre ?? inscripcion.semestre;
      if (semestreCursado) {
        semestreActual = Math.max(semestreActual, semestreCursado + 1);
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

  /**
   * Registra los pagos pendientes del estudiante para el período indicado.
   *
   * Se usa al confirmar la preinscripción: así el estudiante queda con la
   * matrícula y la matrícula semestral pagadas y no hay que registrarlas por
   * separado en la pantalla de Pagos.
   *
   * Devuelve los pagos registrados (los que faltaban).
   */
  async registrarPagosPendientes(
    estudianteId: number,
    gestion: string,
    periodo: string,
    recibidoPor: number,
  ): Promise<Array<{ concepto: string; monto: number }>> {
    const verificador = await this.verificarPagos({
      estudianteId,
      gestion,
      periodo,
    } as any);

    if (verificador.pagosFaltantes.length === 0) {
      return [];
    }

    const conceptos = await this.repositorioConcepto.find({
      where: { estado: EstadoConceptoPago.ACTIVO },
    });

    const registrados: Array<{ concepto: string; monto: number }> = [];

    for (const faltante of verificador.pagosFaltantes) {
      const tipo = faltante.tipo as TipoConceptoPago;

      // Para el concepto semestral se busca el que corresponda al período; si
      // no hay uno específico, se usa el semestral genérico.
      const concepto =
        conceptos.find((c) => c.tipo === tipo && this.nombreCubrePeriodo(c.nombre, periodo)) ||
        conceptos.find((c) => c.tipo === tipo);

      if (!concepto) {
        continue;
      }

      const monto = Number(concepto.montoPredeterminado);

      await this.repositorioPago.save(
        this.repositorioPago.create({
          estudianteId,
          conceptoId: concepto.id,
          gestion,
          periodo: tipo === TipoConceptoPago.SEMESTRAL ? periodo : undefined,
          monto,
          fechaPago: new Date(),
          metodoPago: 'efectivo' as any,
          estado: EstadoPago.PAGADO,
          recibidoPor,
        } as any),
      );

      registrados.push({ concepto: concepto.nombre, monto });
    }

    return registrados;
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

    // Contrato nuevo por grupo/semestre; se conserva el contrato anterior
    // (un único grupo) por compatibilidad.
    const asignaciones: AsignacionGrupoDto[] =
      dto.asignaciones && dto.asignaciones.length > 0
        ? dto.asignaciones
        : dto.grupoId && dto.materias
          ? [{ grupoId: dto.grupoId, materias: dto.materias }]
          : [];

    if (asignaciones.length === 0) {
      throw new BadRequestException('Debe indicar al menos un grupo con sus materias');
    }

    const grupos = new Map<number, Grupo>();
    for (const asignacion of asignaciones) {
      const grupo = await this.repositorioGrupo.findOne({
        where: { id: asignacion.grupoId },
        relations: ['turno', 'carrera'],
      });
      if (!grupo) {
        throw new NotFoundException(`Grupo ${asignacion.grupoId} no encontrado`);
      }
      if (estudiante.carreraId && grupo.carreraId !== estudiante.carreraId) {
        throw new BadRequestException('El grupo seleccionado no pertenece a la carrera del estudiante');
      }
      grupos.set(asignacion.grupoId, grupo);
    }

    // Un estudiante no puede llevar dos grupos del mismo turno en el mismo
    // semestre: las materias se imparten a la misma hora y se chocarían.
    // Sí puede llevar materias de turnos distintos en paralelo.
    const claveTurnoSemestre = new Map<string, number>();
    for (const asignacion of asignaciones) {
      const grupo = grupos.get(asignacion.grupoId)!;
      const clave = `${grupo.turnoId}|${grupo.semestre}`;

      const existente = claveTurnoSemestre.get(clave);
      if (existente) {
        const grupoExistente = grupos.get(existente)!;
        throw new BadRequestException(
          `Los grupos "${grupoExistente.codigo}" y "${grupo.codigo}" son del mismo turno ` +
            `(${grupo.turno?.nombre ?? 'sin turno'}) y semestre ${grupo.semestre}: ` +
            'sus materias se imparten a la misma hora y no pueden llevar ambos.',
        );
      }
      claveTurnoSemestre.set(clave, asignacion.grupoId);
    }

    // Un estudiante no puede llevar dos grupos del mismo turno en el mismo
    // semestre por más Assignment de asignaciones.
    for (const asignacion of asignaciones) {
      const grupo = grupos.get(asignacion.grupoId)!;
      const yaEnEseTurno = await this.repositorioGrupoEstudiante.find({
        where: { estudianteId: dto.estudianteId },
        relations: ['grupo'],
      });

      const choca = yaEnEseTurno.find((inscripcionGrupo) => {
        const otroGrupo = inscripcionGrupo.grupo;
        return (
          otroGrupo &&
          otroGrupo.turnoId === grupo.turnoId &&
          otroGrupo.semestre === grupo.semestre &&
          otroGrupo.gestion === dto.gestion &&
          otroGrupo.id !== grupo.id
        );
      });

      if (choca) {
        throw new BadRequestException(
          `El estudiante ya está en el grupo "${choca.grupo!.codigo}", del mismo turno ` +
            `(${grupo.turno?.nombre ?? 'sin turno'}) y semestre ${grupo.semestre}. ` +
            'No puede llevar dos grupos del mismo turno a la vez.',
        );
      }
    }

    // Un estudiante ya inscrito en el período no puede volver a preinscribirse.
    const idsGrupoDelPeriodo = await this.obtenerIdsGrupoDelPeriodo(
      dto.gestion,
      periodoNumero,
    );
    const inscripcionesDelPeriodo = await this.repositorioInscripcion.find({
      where: { estudianteId: dto.estudianteId, gestion: dto.gestion },
    });
    const yaInscritoEnElPeriodo = inscripcionesDelPeriodo.filter((inscripcion) =>
      idsGrupoDelPeriodo.has(inscripcion.grupoId),
    );

    if (yaInscritoEnElPeriodo.length > 0) {
      throw new BadRequestException(
        `El estudiante ya está inscrito en ${yaInscritoEnElPeriodo.length} ` +
          `materia${yaInscritoEnElPeriodo.length === 1 ? '' : 's'} del período ` +
          `${periodoNumero}/${dto.gestion}. No se puede volver a preinscribir.`,
      );
    }

    // 1) Registrar las inscripciones por materia y la boleta en una transacción.
    //    La matriculación en el grupo (roster) se hace dentro de la misma
    //    transacción: si algo falla, no queda el estudiante en un grupo sin
    //    materias inscritas.
    const inscripciones: { id: number; materiaNombre: string; nombreGrupo: string }[] = [];
    let boletaId: string | undefined;
    let boletaNumero: string | undefined;
    let asignadosGrupo = 0;

    await this.fuenteDatos.transaction(async (gestor) => {
      // Materias ya inscritas en la gestión (en cualquier grupo): una misma
      // materia no puede cursarse dos veces en la misma gestión, aunque se
      // elijan grupos de turnos distintos.
      const inscripcionesPrevias = await gestor.find(Inscripcion, {
        where: { estudianteId: dto.estudianteId, gestion: dto.gestion },
      });
      const materiasYaInscritas = new Set(
        inscripcionesPrevias.map((inscripcion) => inscripcion.materiaId),
      );

      for (const asignacion of asignaciones) {
        const grupo = grupos.get(asignacion.grupoId)!;

        // Matricular al estudiante en el grupo (roster). Se hace dentro de la
        // transacción para que no quede en un grupo si la inscripción falla.
        const yaAsignado = await gestor.findOne(GrupoEstudiante, {
          where: { grupoId: asignacion.grupoId, estudianteId: dto.estudianteId },
        });
        if (!yaAsignado) {
          await gestor.save(
            gestor.create(GrupoEstudiante, {
              grupoId: asignacion.grupoId,
              estudianteId: dto.estudianteId,
            }),
          );
          asignadosGrupo++;
        }

        for (const materia of asignacion.materias) {
          if (materiasYaInscritas.has(materia.materiaId)) {
            throw new BadRequestException(
              `La materia "${materia.materiaNombre}" ya está inscrita en la gestión ${dto.gestion}. ` +
                'Una materia solo se puede cursar una vez por gestión.',
            );
          }

          const existente = await gestor.findOne(Inscripcion, {
            where: {
              estudianteId: dto.estudianteId,
              materiaId: materia.materiaId,
              grupoId: asignacion.grupoId,
              gestion: dto.gestion,
            },
          });

          if (existente) {
            continue;
          }

          const inscripcion = gestor.create(Inscripcion, {
            estudianteId: dto.estudianteId,
            materiaId: materia.materiaId,
            materiaPlanId: materia.materiaPlanId ?? null,
            grupoId: asignacion.grupoId,
            gestion: dto.gestion,
            semestre: materia.semestre,
            estado: EstadoInscripcion.CURSANDO,
          });

          const guardada = await gestor.save(inscripcion);
          materiasYaInscritas.add(materia.materiaId);
          inscripciones.push({
            id: guardada.id,
            materiaNombre: materia.materiaNombre,
            nombreGrupo: `${grupo.paralelo}-${dto.gestion}`,
          });
        }
      }

      // La boleta solo se emite cuando hubo inscripciones nuevas (evita duplicados
      // al reenviar el mismo formulario).
      if (inscripciones.length > 0) {
        const numeroDocumento = `BOL-INS-${dto.gestion}-${periodoNumero}-${estudiante.codigoInscripcion}-${Date.now()}`;
        const boleta = gestor.create(DocumentoEmitido, {
          estudianteId: dto.estudianteId,
          tipo: TipoDocumento.BOLETA_INSCRIPCION,
          numeroDocumento,
          gestion: dto.gestion,
          gestionId: gestion.id,
        });
        const boletaGuardada = await gestor.save(boleta);
        boletaId = boletaGuardada.id;
        boletaNumero = boletaGuardada.numeroDocumento;
      }
    });

    // 3) Reflejar al estudiante en el libro de calificaciones de las materias
    //    impartidas que ya existan para esos grupos.
    let inscritosLibro = 0;
    for (const asignacion of asignaciones) {
      inscritosLibro += await this.servicioMateriasImpartidas.sincronizarEstudianteEnGrupo(
        asignacion.grupoId,
        dto.estudianteId,
      );
    }

    // 4) Registrar los pagos pendientes del período (matrícula y matrícula
    //    semestral) para que el estudiante quede al día al inscribed.
    const pagosRegistrados: Array<{ concepto: string; monto: number }> = [];
    if (dto.registrarPagos !== false && dto.recibidoPor) {
      const registrados = await this.registrarPagosPendientes(
        dto.estudianteId,
        dto.gestion,
        periodoNumero,
        dto.recibidoPor,
      );
      pagosRegistrados.push(...registrados);
    }

    const detallePagos =
      pagosRegistrados.length > 0
        ? ` Se registraron ${pagosRegistrados.length} pago(s) por Bs ${pagosRegistrados
            .reduce((suma, pago) => suma + pago.monto, 0)
            .toFixed(2)}.`
        : '';

    return {
      exito: true,
      inscripciones,
      boletaId,
      boletaNumero,
      asignadosGrupo,
      inscritosLibro,
      pagosRegistrados,
      mensaje:
        (inscripciones.length > 0
          ? `Se crearon ${inscripciones.length} inscripción(es) para ${periodoNumero}/${dto.gestion}`
          : `El estudiante ya estaba inscrito en las materias seleccionadas (${periodoNumero}/${dto.gestion})`) +
        detallePagos,
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

  private nombreCubrePeriodo(nombre: string | undefined, periodoNumero: string): boolean {
    if (!nombre) {
      return false;
    }
    // Se acepta el concepto como genérico (sin número romano) o específico del
    // periodo. Se compara por tokens para evitar falsos positivos como
    // "Matrícula I" coincidiendo con el periodo "II".
    const tokens = nombre
      .toUpperCase()
      .split(/[^A-Z0-9]+/)
      .filter(Boolean);
    const romanos = tokens.filter((token) => token === 'I' || token === 'II');
    if (romanos.length === 0) {
      return true;
    }
    const buscado = periodoNumero.toUpperCase();
    return romanos.some((romano) => romano === buscado);
  }

  /**
   * Determina si un pago cubre el período solicitado. Se prefiere el campo
   * `periodo` del pago; si no estuviera definido (registros antiguos) se
   * recurre al nombre del concepto como respaldo.
   */
  private pagoCubrePeriodo(pago: Pago, periodoNumero: string): boolean {
    if (pago.periodo) {
      return pago.periodo.toUpperCase() === periodoNumero.toUpperCase();
    }
    return this.nombreCubrePeriodo(pago.concepto?.nombre, periodoNumero);
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

  /**
   * Estado de inscripción del estudiante en la gestión y período indicados.
   *
   * Se usa en la pantalla de preinscripción para avisar desde el inicio, al
   * buscar al estudiante, que ya está inscrito y no necesita repetir el
   * proceso.
   */
  /**
   * Estudiantes inscritos en el período actual, con paginación.
   *
   * Se usa en la pantalla de preinscripción para listar a quién ya se le
   * hizo la inscripción, sin necesidad de buscarlos uno por uno.
   */
  async listarInscritos(
    gestion: string,
    pagina = 1,
    limite = 20,
    buscar?: string,
    carreraId?: number,
  ): Promise<{
    datos: Array<{
      id: number;
      codigoInscripcion: string;
      nombres: string;
      apellidos: string;
      ci: string;
      carrera: string;
      carreraId: number;
      totalMaterias: number;
      grupos: Array<{ id: number; codigo: string; paralelo: string; semestre: number }>;
    }>;
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    // Un estudiante puede tener varias inscripciones: se listan una sola vez.
    // Se usa SQL directo porque el orden por columnas de la persona unida no
    // se puede resolver con el mapeo de entidades de TypeORM.
    const condiciones: string[] = [
      'gestion.anio = $1',
      'periodo.numero = $2',
    ];
    const parametros: unknown[] = [
      gestion,
      await this.obtenerNumeroPeriodoDeGestion(gestion),
    ];

    if (carreraId) {
      parametros.push(carreraId);
      condiciones.push(`estudiante.carrera_id = $${parametros.length}`);
    }

    if (buscar && buscar.trim()) {
      const texto = `%${buscar.trim().toLowerCase()}%`;
      parametros.push(texto);
      const p = parametros.length;
      condiciones.push(
        '(LOWER(estudiante.codigo_inscripcion) LIKE ' + p +
          ' OR LOWER(persona.ci) LIKE ' + p +
          ' OR LOWER(persona.nombres) LIKE ' + p +
          ' OR LOWER(persona.apellido_paterno) LIKE ' + p +
          ' OR LOWER(persona.apellido_materno) LIKE ' + p + ')',
      );
    }

    const clausulaWhere = condiciones.join(' AND ');

    const consultaBase = `
      FROM inscripciones inscripcion
      JOIN estudiantes estudiante ON estudiante.id = inscripcion.estudiante_id
      JOIN personas persona ON persona.id = estudiante."personaId"
      LEFT JOIN carreras carrera ON carrera.id = estudiante.carrera_id
      JOIN grupos grupo ON grupo.id = inscripcion.grupo_id
      JOIN periodos periodo ON periodo.id = grupo.periodo_id
      JOIN gestiones gestion ON gestion.id = periodo."gestionId"
      WHERE ${clausulaWhere}
    `;

    const [{ total }] = (await this.fuenteDatos.query(
      `SELECT COUNT(DISTINCT estudiante.id) AS total ${consultaBase}`,
      parametros,
    )) as [{ total: string }];
    const totalNumero = Number(total) || 0;

    const filas = (await this.fuenteDatos.query(
      `SELECT DISTINCT ON (estudiante.id)
          estudiante.id,
          estudiante."codigo_inscripcion" AS "codigoInscripcion",
          estudiante.carrera_id AS "carreraId",
          persona.nombres AS nombres,
          persona.apellido_paterno AS "apellidoPaterno",
          persona.apellido_materno AS "apellidoMaterno",
          persona.ci AS ci,
          carrera.nombre AS carrera
       ${consultaBase}
       ORDER BY estudiante.id, persona.apellido_paterno, persona.apellido_materno, persona.nombres
       LIMIT ${limite} OFFSET ${(pagina - 1) * limite}`,
      parametros,
    )) as Array<{
      id: number;
      codigoInscripcion: string;
      carreraId: number;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      ci: string;
      carrera: string | null;
    }>;

    // Materias y grupos por estudiante de la página actual.
    const idsEstudiante = filas.map((fila) => fila.id);
    const inscriptionsDeEstudiantes =
      idsEstudiante.length > 0
        ? await this.repositorioInscripcion.find({
            where: { estudianteId: In(idsEstudiante), gestion },
            relations: ['grupo'],
          })
        : [];

    const porEstudiante = new Map<
      number,
      { totalMaterias: number; grupos: Map<number, { id: number; codigo: string; paralelo: string; semestre: number }> }
    >();

    for (const inscripcion of inscriptionsDeEstudiantes) {
      const grupo = inscripcion.grupo;
      if (!grupo) continue;

      const registro = porEstudiante.get(inscripcion.estudianteId) ?? {
        totalMaterias: 0,
        grupos: new Map(),
      };
      registro.totalMaterias++;
      if (!registro.grupos.has(grupo.id)) {
        registro.grupos.set(grupo.id, {
          id: grupo.id,
          codigo: grupo.codigo ?? '',
          paralelo: grupo.paralelo,
          semestre: grupo.semestre,
        });
      }
      porEstudiante.set(inscripcion.estudianteId, registro);
    }

    return {
      datos: filas.map((fila) => {
        const registro = porEstudiante.get(fila.id);
        return {
          id: fila.id,
          codigoInscripcion: fila.codigoInscripcion ?? '',
          nombres: fila.nombres ?? '',
          apellidos: `${fila.apellidoPaterno ?? ''} ${fila.apellidoMaterno ?? ''}`.trim(),
          ci: fila.ci ?? '',
          carrera: fila.carrera ?? '',
          carreraId: fila.carreraId ?? 0,
          totalMaterias: registro?.totalMaterias ?? 0,
          grupos: registro ? Array.from(registro.grupos.values()) : [],
        };
      }),
      total: totalNumero,
      pagina,
      limite,
      totalPaginas: Math.max(1, Math.ceil(totalNumero / limite)),
    };
  }

  /** Número del período abierto de la gestión. */
  private async obtenerNumeroPeriodoDeGestion(gestion: string): Promise<string> {
    const periodo = await this.obtenerPeriodoAbierto(gestion);
    return periodo?.numero ?? 'I';
  }

  async obtenerEstadoInscripcion(
    estudianteId: number,
    gestion: string,
    periodo?: string,
  ): Promise<{
    yaInscrito: boolean;
    totalInscripciones: number;
    grupos: Array<{
      id: number;
      codigo: string;
      paralelo: string;
      semestre: number;
      turnoId: number;
      turnoNombre: string;
    }>;
    materias: Array<{ id: number; materiaId: number; nombre: string; estado: string }>;
  }> {
    const inscritos = await this.repositorioInscripcion.find({
      where: { estudianteId, gestion },
      relations: ['materia', 'grupo', 'grupo.turno'],
      order: { id: 'ASC' },
    });

    // Cuando se indica período, se filtran las inscripciones por el período
    // del grupo al que pertenecen.
    let delPeriodo = inscritos;
    if (periodo) {
      const idsGrupoDelPeriodo = await this.obtenerIdsGrupoDelPeriodo(gestion, periodo);
      delPeriodo = inscritos.filter((inscripcion) =>
        idsGrupoDelPeriodo.has(inscripcion.grupoId),
      );
    }

    const gruposUnicos = new Map<
      number,
      {
        id: number;
        codigo: string;
        paralelo: string;
        semestre: number;
        turnoId: number;
        turnoNombre: string;
      }
    >();
    for (const inscripcion of delPeriodo) {
      const grupo = inscripcion.grupo;
      if (grupo && !gruposUnicos.has(grupo.id)) {
        gruposUnicos.set(grupo.id, {
          id: grupo.id,
          codigo: grupo.codigo ?? '',
          paralelo: grupo.paralelo,
          semestre: grupo.semestre,
          turnoId: grupo.turnoId,
          turnoNombre: grupo.turno?.nombre ?? '',
        });
      }
    }

    return {
      yaInscrito: delPeriodo.length > 0,
      totalInscripciones: delPeriodo.length,
      grupos: Array.from(gruposUnicos.values()),
      materias: delPeriodo.map((inscripcion) => ({
        id: inscripcion.id,
        materiaId: inscripcion.materiaId,
        nombre: inscripcion.materia?.nombre ?? '',
        estado: inscripcion.estado,
      })),
    };
  }

  /** Ids de los grupos que pertenecen al período indicado de la gestión. */
  private async obtenerIdsGrupoDelPeriodo(
    gestion: string,
    periodo: string,
  ): Promise<Set<number>> {
    const grupos = await this.repositorioGrupo
      .createQueryBuilder('grupo')
      .innerJoin('periodos', 'periodo', 'periodo.id = grupo.periodo_id')
      .innerJoin('gestiones', 'gestion', 'gestion.id = periodo."gestionId"')
      .where('gestion.anio = :gestion', { gestion })
      .andWhere('periodo.numero = :periodo', { periodo })
      .getMany();

    return new Set(grupos.map((grupo) => grupo.id));
  }

  async obtenerGruposPorCarreraYSemestre(
    carreraId: number,
    gestion: string,
    semestre?: number,
    turnoId?: number,
    crearSiFaltan?: boolean,
    planEstudioId?: number,
    semestres?: number[],
  ): Promise<Grupo[]> {
    // Si no hay grupos para los semestres solicitados, se crean
    // automáticamente: un grupo por turno y paralelo A.
    if (crearSiFaltan !== false) {
      await this.asegurarGrupos(carreraId, gestion, semestre, planEstudioId, semestres);
    }

    const consulta = this.repositorioGrupo
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .where('grupo.carreraId = :carreraId', { carreraId })
      .andWhere('grupo.gestion = :gestion', { gestion });

    if (semestre) {
      consulta.andWhere('grupo.semestre = :semestre', { semestre });
    }

    if (turnoId) {
      consulta.andWhere('grupo.turnoId = :turnoId', { turnoId });
    }

    return consulta.orderBy('grupo.semestre', 'ASC').addOrderBy('grupo.paralelo', 'ASC').getMany();
  }

  /**
   * Crea los grupos que falten para los semestres indicados.
   *
   * Se generan un grupo por cada turno activo con paralelo 'A', siguiendo el
   * mismo criterio que la generación manual de grupos. Es idempotente: si el
   * grupo ya existe no se duplica.
   */
  private async asegurarGrupos(
    carreraId: number,
    gestion: string,
    semestre?: number,
    planEstudioId?: number,
    semestres?: number[],
  ): Promise<void> {
    const periodo = await this.obtenerPeriodoAbierto(gestion);
    if (!periodo) {
      return;
    }

    const semestresObjetivo = semestres?.length
      ? semestres
      : semestre
        ? [semestre]
        : [];

    if (semestresObjetivo.length === 0) {
      return;
    }

    // Plan de estudio del estudiante: el más bajo de la carrera.
    let planId = planEstudioId;
    if (!planId) {
      const plan = await this.repositorioPlanEstudio.findOne({
        where: { carreraId },
        order: { id: 'ASC' },
      });
      planId = plan?.id;
    }
    if (!planId) {
      return;
    }

    const turnos = await this.repositorioTurno.find({ order: { id: 'ASC' } });
    if (turnos.length === 0) {
      return;
    }

    const existentes = await this.repositorioGrupo.find({
      where: { carreraId, gestion },
    });
    const clavesExistentes = new Set(
      existentes.map(
        (grupo) => `${grupo.semestre}|${grupo.turnoId}|${grupo.paralelo}`,
      ),
    );

    for (const semestre of semestresObjetivo) {
      for (const turno of turnos) {
        const clave = `${semestre}|${turno.id}|A`;
        if (clavesExistentes.has(clave)) {
          continue;
        }
        clavesExistentes.add(clave);

        // Se delega la creación al servicio de grupos para que el código y las
        // validaciones sean los mismos que en la generación manual.
        try {
          await this.servicioGrupos.crear({
            carreraId,
            planEstudioId: planId,
            semestre,
            turnoId: turno.id,
            paralelo: 'A',
            periodoId: periodo.id,
            capacidad: 30,
          } as any);
        } catch (error) {
          console.warn(
            `  ! No se pudo crear el grupo del semestre ${semestre}, turno ${turno.codigo}:`,
            (error as Error).message,
          );
        }
      }
    }
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
