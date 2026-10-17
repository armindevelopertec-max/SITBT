import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HuellaPersonal,
  EstadoHuella,
} from '../../entidades/huella-personal.entidad';
import {
  MarcacionPersonal,
  TipoMarcacion,
  MetodoMarcacion,
} from '../../entidades/marcacion-personal.entidad';
import { Personal, EstadoPersonal } from '../../entidades/personal.entidad';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { CrearHuellaDto } from './dto/crear-huella.dto';
import { ActualizarHuellaDto } from './dto/actualizar-huella.dto';

export interface EstadoPersonalHoy {
  personalId: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  ci: string;
  cargo: string;
  fotoUrl: string | null;
  dentro: boolean;
  horaEntrada: Date | null;
  horaSalida: Date | null;
  ultimaMarcacion: Date | null;
}

// Zona horaria institucional (Bolivia). Se usa para saber "qué es hoy".
const ZONA_HORARIA = 'America/La_Paz';
const HOY_SQL = `(m."fecha_hora" AT TIME ZONE '${ZONA_HORARIA}')::date = (now() AT TIME ZONE '${ZONA_HORARIA}')::date`;

@Injectable()
export class ServicioAsistencias {
  constructor(
    @InjectRepository(HuellaPersonal)
    private repositorioHuella: Repository<HuellaPersonal>,
    @InjectRepository(MarcacionPersonal)
    private repositorioMarcacion: Repository<MarcacionPersonal>,
    @InjectRepository(Personal)
    private repositorioPersonal: Repository<Personal>,
  ) {}

  // ------------------------------------------------------------------
  // Marcaciones
  // ------------------------------------------------------------------

  /** Registra una marcación (biométrica o manual). Alterna entrada/salida si no se fuerza el tipo. */
  async marcar(dto: MarcarAsistenciaDto) {
    let personalId = dto.personalId;
    let huella: HuellaPersonal | null = null;

    if (dto.codigoBiometrico) {
      huella = await this.repositorioHuella.findOne({
        where: {
          codigoBiometrico: dto.codigoBiometrico,
          estado: EstadoHuella.ACTIVA,
        },
      });
      if (!huella) {
        throw new NotFoundException('Huella no registrada o inactiva');
      }
      personalId = huella.personalId;
    }

    if (!personalId) {
      throw new BadRequestException(
        'Debe enviar "codigoBiometrico" o "personalId"',
      );
    }

    const personal = await this.repositorioPersonal.findOne({
      where: { id: personalId },
      relations: ['persona'],
    });
    if (!personal) {
      throw new NotFoundException(`Personal con ID ${personalId} no encontrado`);
    }

    const tipo = dto.tipo ?? (await this.determinarSiguienteTipo(personalId));

    const marcacion = this.repositorioMarcacion.create({
      personalId,
      huellaId: huella ? huella.id : null,
      tipo,
      metodo: huella ? MetodoMarcacion.BIOMETRICO : MetodoMarcacion.MANUAL,
      dispositivo: dto.dispositivo ?? null,
      observacion: dto.observacion ?? null,
      fechaHora: new Date(),
    });
    const guardada = await this.repositorioMarcacion.save(marcacion);

    return {
      marcacion: guardada,
      personal: {
        id: personal.id,
        nombres: personal.persona?.nombres,
        apellidoPaterno: personal.persona?.apellidoPaterno,
        apellidoMaterno: personal.persona?.apellidoMaterno,
        ci: personal.persona?.ci,
        cargo: personal.cargo,
      },
      tipo,
      hora: guardada.fechaHora,
    };
  }

  /** Si la última marcación de hoy fue salida (o no marcó), corresponde entrada; si no, salida. */
  private async determinarSiguienteTipo(
    personalId: number,
  ): Promise<TipoMarcacion> {
    const ultima = await this.repositorioMarcacion
      .createQueryBuilder('m')
      .where('m."personalId" = :personalId', { personalId })
      .andWhere(HOY_SQL)
      .orderBy('m."fecha_hora"', 'DESC')
      .getOne();

    if (!ultima || ultima.tipo === TipoMarcacion.SALIDA) {
      return TipoMarcacion.ENTRADA;
    }
    return TipoMarcacion.SALIDA;
  }

  /** Estado de hoy de todo el personal activo: quién está dentro (verde) y quién ya salió (rojo). */
  async estadoHoy() {
    const marcaciones = await this.repositorioMarcacion
      .createQueryBuilder('m')
      .where(HOY_SQL)
      .orderBy('m."fecha_hora"', 'ASC')
      .getMany();

    const personal = await this.repositorioPersonal.find({
      where: { estado: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { fechaContrato: 'ASC' },
    });

    const porPersonal = new Map<number, MarcacionPersonal[]>();
    for (const m of marcaciones) {
      const lista = porPersonal.get(m.personalId) ?? [];
      lista.push(m);
      porPersonal.set(m.personalId, lista);
    }

    const lista: EstadoPersonalHoy[] = personal.map((p) => {
      const del = porPersonal.get(p.id) ?? [];
      const entrada = del.find((m) => m.tipo === TipoMarcacion.ENTRADA);
      const salidas = del.filter((m) => m.tipo === TipoMarcacion.SALIDA);
      const salida = salidas.length ? salidas[salidas.length - 1] : null;
      const ultima = del.length ? del[del.length - 1] : null;

      return {
        personalId: p.id,
        nombres: p.persona?.nombres ?? '',
        apellidoPaterno: p.persona?.apellidoPaterno ?? '',
        apellidoMaterno: p.persona?.apellidoMaterno ?? '',
        ci: p.persona?.ci ?? '',
        cargo: p.cargo,
        fotoUrl: p.persona?.fotoUrl ?? null,
        dentro: !!ultima && ultima.tipo === TipoMarcacion.ENTRADA,
        horaEntrada: entrada ? entrada.fechaHora : null,
        horaSalida: salida ? salida.fechaHora : null,
        ultimaMarcacion: ultima ? ultima.fechaHora : null,
      };
    });

    return {
      total: lista.length,
      dentro: lista.filter((p) => p.dentro).length,
      personal: lista,
    };
  }

  /** Historial de marcaciones con filtros y paginación. */
  async historial(
    pagina = 1,
    limite = 20,
    filtros: {
      personalId?: number;
      tipo?: TipoMarcacion;
      desde?: string;
      hasta?: string;
    } = {},
  ) {
    const qb = this.repositorioMarcacion
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.personal', 'personal')
      .leftJoinAndSelect('personal.persona', 'persona')
      .leftJoinAndSelect('m.huella', 'huella');

    if (filtros.personalId) {
      qb.andWhere('m."personalId" = :personalId', {
        personalId: filtros.personalId,
      });
    }
    if (filtros.tipo) {
      qb.andWhere('m."tipo" = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.desde) {
      qb.andWhere(
        `(m."fecha_hora" AT TIME ZONE '${ZONA_HORARIA}')::date >= :desde`,
        { desde: filtros.desde },
      );
    }
    if (filtros.hasta) {
      qb.andWhere(
        `(m."fecha_hora" AT TIME ZONE '${ZONA_HORARIA}')::date <= :hasta`,
        { hasta: filtros.hasta },
      );
    }

    const [datos, total] = await qb
      .orderBy('m.fechaHora', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  /** Marcaciones registradas hoy. */
  async marcacionesHoy() {
    return this.repositorioMarcacion
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.personal', 'personal')
      .leftJoinAndSelect('personal.persona', 'persona')
      .where(HOY_SQL)
      .orderBy('m."fecha_hora"', 'DESC')
      .getMany();
  }

  async eliminarMarcacion(id: number) {
    const marcacion = await this.repositorioMarcacion.findOne({
      where: { id },
    });
    if (!marcacion) {
      throw new NotFoundException('Marcación no encontrada');
    }
    await this.repositorioMarcacion.remove(marcacion);
    return { eliminado: true };
  }

  // ------------------------------------------------------------------
  // Huellas
  // ------------------------------------------------------------------

  async crearHuella(dto: CrearHuellaDto) {
    const personal = await this.repositorioPersonal.findOne({
      where: { id: dto.personalId },
    });
    if (!personal) {
      throw new NotFoundException(
        `Personal con ID ${dto.personalId} no encontrado`,
      );
    }

    const existente = await this.repositorioHuella.findOne({
      where: { codigoBiometrico: dto.codigoBiometrico },
    });
    if (existente) {
      throw new ConflictException(
        'Ya existe una huella con ese código biométrico',
      );
    }

    const huella = this.repositorioHuella.create({
      personalId: dto.personalId,
      codigoBiometrico: dto.codigoBiometrico,
      dedo: dto.dedo ?? null,
      plantilla: dto.plantilla ?? null,
      estado: dto.estado ?? EstadoHuella.ACTIVA,
    });
    return this.repositorioHuella.save(huella);
  }

  async obtenerHuellas() {
    return this.repositorioHuella.find({
      relations: ['personal', 'personal.persona'],
      order: { creadoEn: 'DESC' },
    });
  }

  async obtenerHuellasPorPersonal(personalId: number) {
    return this.repositorioHuella.find({
      where: { personalId },
      order: { creadoEn: 'DESC' },
    });
  }

  async actualizarHuella(id: number, dto: ActualizarHuellaDto) {
    const huella = await this.repositorioHuella.findOne({ where: { id } });
    if (!huella) {
      throw new NotFoundException('Huella no encontrada');
    }

    if (dto.codigoBiometrico && dto.codigoBiometrico !== huella.codigoBiometrico) {
      const existente = await this.repositorioHuella.findOne({
        where: { codigoBiometrico: dto.codigoBiometrico },
      });
      if (existente) {
        throw new ConflictException(
          'Ya existe una huella con ese código biométrico',
        );
      }
    }

    Object.assign(huella, dto);
    return this.repositorioHuella.save(huella);
  }

  async eliminarHuella(id: number) {
    const huella = await this.repositorioHuella.findOne({ where: { id } });
    if (!huella) {
      throw new NotFoundException('Huella no encontrada');
    }
    await this.repositorioHuella.remove(huella);
    return { eliminado: true };
  }
}
