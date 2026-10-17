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

    // 1) Matricular al estudiante en cada grupo (fuente de verdad del roster que
    //    consume el módulo de materias impartidas). Es idempotente.
    let asignadosGrupo = 0;
    for (const asignacion of asignaciones) {
      const yaAsignado = await this.repositorioGrupoEstudiante.findOne({
        where: { grupoId: asignacion.grupoId, estudianteId: dto.estudianteId },
      });
      if (!yaAsignado) {
        await this.servicioGrupos.agregarEstudiante(asignacion.grupoId, dto.estudianteId);
        asignadosGrupo++;
      }
    }

    // 2) Registrar las inscripciones por materia y la boleta en una transacción.
    const inscripciones: { id: number; materiaNombre: string; nombreGrupo: string }[] = [];
    let boletaId: string | undefined;
    let boletaNumero: string | undefined;

    await this.fuenteDatos.transaction(async (gestor) => {
      for (const asignacion of asignaciones) {
        const grupo = grupos.get(asignacion.grupoId)!;
        for (const materia of asignacion.materias) {
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

    return {
      exito: true,
      inscripciones,
      boletaId,
      boletaNumero,
      asignadosGrupo,
      inscritosLibro,
      mensaje:
        inscripciones.length > 0
          ? `Se crearon ${inscripciones.length} inscripción(es) para ${periodoNumero}/${dto.gestion}`
          : `El estudiante ya estaba inscrito en las materias seleccionadas (${periodoNumero}/${dto.gestion})`,
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

  async obtenerGruposPorCarreraYSemestre(
    carreraId: number,
    gestion: string,
    semestre?: number,
    turnoId?: number,
  ): Promise<Grupo[]> {
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
