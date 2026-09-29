import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Estudiante, StudentStatus } from '../../entities/estudiante.entity';
import { Persona } from '../../entities/persona.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

export interface CreatedStudentWithUser {
  student: Estudiante;
  user: {
    username: string;
    password: string;
  };
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Estudiante)
    private studentRepository: Repository<Estudiante>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<CreatedStudentWithUser> {
    const student = this.studentRepository.create(createStudentDto);
    const savedStudent = await this.studentRepository.save(student);

    const persona = await this.personaRepository.findOne({ where: { id: createStudentDto.person_id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    const currentYear = new Date().getFullYear().toString();

    const username = `est_${savedStudent.inscription_code.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const password = `${persona.ci}-${currentYear}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepository.create({
      person_id: savedStudent.person_id,
      username,
      password_hash: passwordHash,
      status: 'activo' as any,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);

    const rolEstudiante = await this.rolRepository.findOne({ where: { code: 'estudiante' } });
    if (rolEstudiante) {
      const usuarioRol = this.usuarioRolRepository.create({
        user_id: savedUsuario.id,
        role_id: rolEstudiante.id,
      });
      await this.usuarioRolRepository.save(usuarioRol);
    }

    return {
      student: savedStudent,
      user: {
        username,
        password,
      },
    };
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: StudentStatus,
    careerId?: number,
  ): Promise<{ data: Estudiante[]; total: number; page: number; limit: number }> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.persona', 'persona')
      .leftJoinAndSelect('student.carrera', 'carrera')
      .leftJoinAndSelect('student.plan_estudio', 'plan_estudio');

    if (status) {
      query.andWhere('student.status = :status', { status });
    }

    if (careerId) {
      query.andWhere('student.career_id = :careerId', { careerId });
    }

    const [data, total] = await query
      .orderBy('student.inscription_code', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Estudiante> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByInscriptionCode(code: string): Promise<Estudiante> {
    const student = await this.studentRepository.findOne({
      where: { inscription_code: code },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!student) {
      throw new NotFoundException(`Student with inscription code ${code} not found`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Estudiante> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByCareer(careerId: number, gestion?: string): Promise<Estudiante[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.persona', 'persona')
      .where('student.career_id = :careerId', { careerId });

    if (gestion) {
      query.andWhere('student.admission_gestion = :gestion', { gestion });
    }

    return query.orderBy('student.inscription_code', 'ASC').getMany();
  }

  async findActive(): Promise<Estudiante[]> {
    return this.studentRepository.find({
      where: { status: StudentStatus.ACTIVO },
      relations: ['persona', 'carrera'],
      order: { inscription_code: 'ASC' },
    });
  }

  async countByStatus(careerId?: number): Promise<{ status: string; count: number }[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status');

    if (careerId) {
      query.where('student.career_id = :careerId', { careerId });
    }

    return query.getRawMany();
  }

  async getStudentStats(): Promise<{
    total: number;
    active: number;
    graduated: number;
    frozen: number;
  }> {
    const stats = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();

    const result = { total: 0, active: 0, graduated: 0, frozen: 0 };
    stats.forEach((s) => {
      result.total += parseInt(s.count);
      if (s.status === StudentStatus.ACTIVO) result.active = parseInt(s.count);
      if (s.status === StudentStatus.EGRESADO || s.status === StudentStatus.TITULADO) result.graduated += parseInt(s.count);
      if (s.status === StudentStatus.CONGELADO) result.frozen = parseInt(s.count);
    });

    return result;
  }
}