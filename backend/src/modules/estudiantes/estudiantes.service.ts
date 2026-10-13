import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Estudiante, EstadoEstudiante } from '../../entities/estudiante.entity';
import { Persona } from '../../entities/persona.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';
import { Carrera } from '../../entities/carrera.entity';
import { ConfiguracionInstitucional } from '../../entities/configuracion-institucional.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Credencial } from '../../entities/credencial.entity';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

export interface CreatedStudentWithUser {
  student: Estudiante;
  user: {
    username: string;
    password: string;
  };
}

@Injectable()
export class ServicioEstudiantes {
  constructor(
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Credencial)
    private credencialRepository: Repository<Credencial>,
  ) {}

  async create(crearEstudianteDto: CrearEstudianteDto): Promise<CreatedStudentWithUser> {
    const existingStudent = await this.estudianteRepository.findOne({
      where: { personaId: crearEstudianteDto.personaId },
    });
    if (existingStudent) {
      throw new ConflictException('Esta persona ya tiene un estudiante asociado');
    }

    const persona = await this.personaRepository.findOne({ where: { id: crearEstudianteDto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    if (crearEstudianteDto.numeroTituloBachiller) {
      const existingTitle = await this.estudianteRepository.findOne({
        where: { numeroTituloBachiller: crearEstudianteDto.numeroTituloBachiller },
      });
      if (existingTitle) {
        throw new ConflictException('Ya existe un estudiante con este número de título de bachiller');
      }
    }

    if (crearEstudianteDto.numeroFolder) {
      const existingFolder = await this.estudianteRepository.findOne({
        where: { numeroFolder: crearEstudianteDto.numeroFolder },
      });
      if (existingFolder) {
        throw new ConflictException('Ya existe un estudiante con este número de folder');
      }
    }

    let inscriptionCode = crearEstudianteDto.codigoInscripcion;
    if (!inscriptionCode) {
      inscriptionCode = await this.generateInscriptionCode(
        persona,
        crearEstudianteDto.carreraId
      );
    } else {
      const existingCode = await this.estudianteRepository.findOne({
        where: { codigoInscripcion: inscriptionCode },
      });
      if (existingCode) {
        throw new ConflictException('El código de inscripción ya existe');
      }
    }

    const studentData = { ...crearEstudianteDto, inscription_code: inscriptionCode };
    const student = this.estudianteRepository.create(studentData);
    const savedStudent = await this.estudianteRepository.save(student);

    const currentYear = new Date().getFullYear().toString();

    const username = `est_${savedStudent.codigoInscripcion.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const password = `${persona.ci}-${currentYear}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepository.create({
      personaId: savedStudent.personaId,
      nombreUsuario: username,
      contrasenaHash: passwordHash,
      estado: 'activo' as any,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);

    const rolEstudiante = await this.rolRepository.findOne({ where: { codigo: 'estudiante' } });
    if (rolEstudiante) {
      const usuarioRol = this.usuarioRolRepository.create({
        usuarioId: savedUsuario.id,
        rolId: rolEstudiante.id,
      });
      await this.usuarioRolRepository.save(usuarioRol);
    }

    return {
      student: savedStudent,
      user: {
        nombreUsuario: username,
        password: password,
      },
    } as any;
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoEstudiante,
    careerId?: number,
  ): Promise<any> {
    const query = this.estudianteRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.persona', 'persona')
      .leftJoinAndSelect('student.carrera', 'carrera')
      .leftJoinAndSelect('student.plan_estudio', 'plan_estudio');

    if (status) {
      query.andWhere('student.estado = :status', { status });
    }

    if (careerId) {
      query.andWhere('student.carreraId = :careerId', { careerId });
    }

    const [data, total] = await query
      .orderBy('student.codigoInscripcion', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Estudiante> {
    const student = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return student;
  }

  async findByInscriptionCode(code: string): Promise<Estudiante> {
    const student = await this.estudianteRepository.findOne({
      where: { codigoInscripcion: code },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!student) {
      throw new NotFoundException(`Estudiante con código de inscripción ${code} no encontrado`);
    }
    return student;
  }

  async update(id: number, actualizarEstudianteDto: ActualizarEstudianteDto): Promise<Estudiante> {
    const student = await this.findOne(id);

    if (actualizarEstudianteDto.numeroTituloBachiller) {
      const existingTitle = await this.estudianteRepository.findOne({
        where: { numeroTituloBachiller: actualizarEstudianteDto.numeroTituloBachiller },
      });
      if (existingTitle && existingTitle.id !== id) {
        throw new ConflictException('Ya existe otro estudiante con este número de título de bachiller');
      }
    }

    if (actualizarEstudianteDto.numeroFolder) {
      const existingFolder = await this.estudianteRepository.findOne({
        where: { numeroFolder: actualizarEstudianteDto.numeroFolder },
      });
      if (existingFolder && existingFolder.id !== id) {
        throw new ConflictException('Ya existe otro estudiante con este número de folder');
      }
    }

    Object.assign(student, actualizarEstudianteDto);
    return this.estudianteRepository.save(student as any) as any;
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);

    await this.credencialRepository.delete({ estudianteId: id });

    const usuario = await this.usuarioRepository.findOne({
      where: { personaId: student.personaId },
    });
    if (usuario) {
      await this.usuarioRolRepository.delete({ usuarioId: usuario.id });
      await this.usuarioRepository.remove(usuario);
    }

    const personaId = student.personaId;
    await this.estudianteRepository.remove(student);

    const persona = await this.personaRepository.findOne({ where: { id: personaId } });
    if (persona) {
      await this.personaRepository.remove(persona);
    }
  }

  async findByCareer(careerId: number, gestion?: string): Promise<Estudiante[]> {
    const query = this.estudianteRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.persona', 'persona')
      .where('student.carreraId = :careerId', { careerId });

    if (gestion) {
      query.andWhere('student.gestionAdmision = :gestion', { gestion });
    }

    return query.orderBy('student.codigoInscripcion', 'ASC').getMany();
  }

  async findActive(): Promise<Estudiante[]> {
    return this.estudianteRepository.find({
      where: { estado: EstadoEstudiante.ACTIVO },
      relations: ['persona', 'carrera'],
      order: { codigoInscripcion: 'ASC' },
    });
  }

  async countByStatus(careerId?: number): Promise<{ status: string; count: number }[]> {
    const query = this.estudianteRepository
      .createQueryBuilder('student')
      .select('student.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.estado');

    if (careerId) {
      query.where('student.carreraId = :careerId', { careerId });
    }

    return query.getRawMany();
  }

  async getStudentStats(): Promise<any> {
    const stats = await this.estudianteRepository
      .createQueryBuilder('student')
      .select('student.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.estado')
      .getRawMany();

    const result = { total: 0, active: 0, graduated: 0, frozen: 0 };
    stats.forEach((s) => {
      result.total += parseInt(s.count);
      if (s.estado === EstadoEstudiante.ACTIVO) result.active = parseInt(s.count);
      if (s.estado === EstadoEstudiante.EGRESADO || s.estado === EstadoEstudiante.TITULADO) result.graduated += parseInt(s.count);
      if (s.estado === EstadoEstudiante.CONGELADO) result.frozen = parseInt(s.count);
    });

    return result;
  }

  private async generateInscriptionCode(persona: Persona, careerId: number): Promise<string> {
    const carrera = await this.estudianteRepository.manager.findOne(
      Carrera,
      { where: { id: careerId } }
    ) as Carrera | null;

    if (!carrera) {
      throw new BadRequestException('Carrera no encontrada');
    }

    const gestion = new Date().getFullYear().toString();
    const yearSuffix = gestion.slice(-2);

    const initials = (
      (persona.apellidoPaterno?.[0] || '') +
      (persona.apellidoMaterno?.[0] || '') +
      (persona.nombres?.[0] || '')
    ).toUpperCase();

    const careerCode = carrera.nombre.substring(0, 2).toUpperCase();

    const ciLast2 = persona.ci.slice(-2);

    let code = `${initials}-${careerCode}${yearSuffix}${ciLast2}`;

    let counter = 1;
    while (await this.estudianteRepository.findOne({ where: { codigoInscripcion: code } })) {
      code = `${initials}-${careerCode}${yearSuffix}${ciLast2}-${counter}`;
      counter++;
    }

    return code;
  }
}