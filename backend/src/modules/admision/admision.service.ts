import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { SolicitudAdmision, EstadoAdmision } from '../../entities/admission-request.entity';
import { CrearAdmisionDto } from './dto/crear-admision.dto';
import { ActualizarAdmisionDto } from './dto/actualizar-admision.dto';
import { Persona, Gender } from '../../entities/persona.entity';
import { Estudiante, StudentMatriculaStatus, StudentOrigin } from '../../entities/estudiante.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Carrera } from '../../entities/carrera.entity';
import { ConfiguracionInstitucional } from '../../entities/configuracion-institucional.entity';

@Injectable()
export class ServicioAdmision {
  constructor(
    @InjectRepository(SolicitudAdmision)
    private admissionRepository: Repository<SolicitudAdmision>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async create(createDto: CrearAdmisionDto): Promise<SolicitudAdmision> {
    const { names, lastname_paternal, lastname_maternal, ...rest } = createDto as any;

    const existingStudent = await this.estudianteRepository
      .createQueryBuilder('student')
      .innerJoin('student.persona', 'person')
      .where('person.ci = :ci', { ci: createDto.ci })
      .andWhere('student.estado = :status', { status: 'activo' })
      .getOne();

    if (existingStudent) {
      throw new BadRequestException('Esta persona ya está registrada como estudiante activo en otra carrera');
    }

    if (createDto.correo) {
      const existingEmail = await this.personaRepository
        .createQueryBuilder('person')
        .innerJoin('person.estudiantes', 'student')
        .where('person.correo = :email', { email: createDto.correo })
        .andWhere('student.estado = :status', { status: 'activo' })
        .getOne();
      if (existingEmail) {
        throw new BadRequestException('Ya existe un estudiante activo con este correo electrónico');
      }
    }

    if (createDto.telefono) {
      const existingPhone = await this.personaRepository
        .createQueryBuilder('person')
        .innerJoin('person.estudiantes', 'student')
        .where('person.telefono = :phone', { phone: createDto.telefono })
        .andWhere('student.estado = :status', { status: 'activo' })
        .getOne();
      if (existingPhone) {
        throw new BadRequestException('Ya existe un estudiante activo con este número de celular');
      }
    }

    const request = this.admissionRepository.create({
      ...rest,
      nombre: names,
      apellido_paterno: lastname_paternal,
      apellido_materno: lastname_maternal,
      birthdate: new Date(createDto.fechaNacimiento),
    } as Partial<SolicitudAdmision>);
    return this.admissionRepository.save(request);
  }

  async findAll(
    page = 1,
    limit = 20,
    estado?: EstadoAdmision,
    origen?: string,
  ): Promise<{ data: SolicitudAdmision[]; total: number; page: number; limit: number }> {
    const query = this.admissionRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.carrera', 'carrera');

    if (estado) {
      query.andWhere('request.estado = :estado', { estado });
    }

    if (origen) {
      query.andWhere('request.origen = :origen', { origen });
    }

    const [data, total] = await query
      .orderBy('request.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<SolicitudAdmision> {
    const request = await this.admissionRepository.findOne({
      where: { id },
      relations: ['carrera'],
    });
    if (!request) {
      throw new NotFoundException(`Solicitud de admisión con ID ${id} no encontrada`);
    }
    return request;
  }

  async update(id: string, updateDto: ActualizarAdmisionDto): Promise<SolicitudAdmision> {
    const request = await this.findOne(id);

    if (updateDto.estado && updateDto.estado !== request.estado) {
      if (updateDto.estado === EstadoAdmision.RECHAZADO && !updateDto.observaciones) {
        throw new BadRequestException('Observaciones requeridas al rechazar');
      }
    }

    Object.assign(request, updateDto);
    return this.admissionRepository.save(request);
  }

  async verify(id: string, verificadoPor: number, observaciones?: string): Promise<SolicitudAdmision> {
    return this.update(id, {
      estado: EstadoAdmision.VERIFICADO,
      verificado_por: verificadoPor,
      observaciones,
    } as ActualizarAdmisionDto);
  }

  async reject(id: string, verificadoPor: number, observaciones: string): Promise<SolicitudAdmision> {
    if (!observaciones) {
      throw new BadRequestException('Observaciones requeridas al rechazar');
    }
    return this.update(id, {
      estado: EstadoAdmision.RECHAZADO,
      verificado_por: verificadoPor,
      observaciones,
    } as ActualizarAdmisionDto);
  }

  async convertToStudent(id: string, admissionGestion: string): Promise<{ student: Estudiante; persona: Persona }> {
    const request = await this.findOne(id);

    if (request.estado === EstadoAdmision.CONVERTIDO) {
      throw new BadRequestException('Esta solicitud ya fue convertida a estudiante');
    }

    if (request.estado !== EstadoAdmision.VERIFICADO) {
      throw new BadRequestException('La solicitud debe estar verificada para convertir a estudiante');
    }

    if (!request.carreraId) {
      throw new BadRequestException('La solicitud debe tener una carrera asignada');
    }

    const existingStudent = await this.estudianteRepository.findOne({
      where: { admission_request_id: id }
    });
    if (existingStudent) {
      throw new BadRequestException('Ya existe un estudiante creado para esta solicitud');
    }

    if (request.correo) {
      const existingEmail = await this.personaRepository
        .createQueryBuilder('person')
        .innerJoin('person.estudiantes', 'student')
        .where('person.correo = :email', { email: request.correo })
        .andWhere('student.estado = :status', { status: 'activo' })
        .getOne();
      if (existingEmail) {
        throw new BadRequestException('Ya existe un estudiante activo con este correo electrónico');
      }
    }

    if (request.telefono) {
      const existingPhone = await this.personaRepository
        .createQueryBuilder('person')
        .innerJoin('person.estudiantes', 'student')
        .where('person.telefono = :phone', { phone: request.telefono })
        .andWhere('student.estado = :status', { status: 'activo' })
        .getOne();
      if (existingPhone) {
        throw new BadRequestException('Ya existe un estudiante activo con este número de celular');
      }
    }

    let persona = await this.personaRepository.findOne({ where: { ci: request.ci } });

    const existingStudentInCareer = await this.estudianteRepository
      .createQueryBuilder('student')
      .innerJoin('student.persona', 'person')
      .where('person.ci = :ci', { ci: request.ci })
      .andWhere('student.carreraId = :careerId', { careerId: request.carreraId })
      .andWhere('student.estado = :status', { status: 'activo' })
      .getOne();

    if (existingStudentInCareer) {
      throw new BadRequestException('Esta persona ya está registrada como estudiante activo en esta carrera');
    }

    if (!persona) {
      const finalBirthplace = request.lugarNacimiento === 'Otra' && request.birthplace_other ? request.birthplace_other : request.lugarNacimiento;
      const finalNationality = request.nacionalidad === 'Otra' && request.nationality_other ? request.nationality_other : request.nacionalidad;

      persona = this.personaRepository.create({
        ci: request.ci,
        names: request.nombre,
        lastname_paternal: request.lastname_paternal || request.nombre.split(' ')[0] || request.nombre,
        lastname_maternal: request.lastname_maternal || request.nombre.split(' ').slice(1).join(' ') || '',
        birthdate: new Date(request.fechaNacimiento),
        birthplace: finalBirthplace,
        gender: request.genero as Gender,
        marital_status: request.estadoCivil as any,
        nationality: finalNationality,
        phone: request.telefono,
        email: request.correo,
        address: request.direccion,
      });
      persona = (await this.personaRepository.save(persona)) as Persona;
    }

    const studyPlan = await this.estudianteRepository.manager.findOne(
      PlanEstudio,
      { where: { carreraId: request.carreraId, status: 'vigente' as any } }
    );

    if (!studyPlan) {
      throw new BadRequestException('No existe un plan de estudio vigente para la carrera seleccionada');
    }

    const inscriptionCode = await this.generateInscriptionCode(request);

    const estudianteData: DeepPartial<Estudiante> = {
      person_id: persona.id,
      bachelor_title_number: undefined,
      bachelor_title_date: undefined,
      admission_gestion: admissionGestion,
      folder_number: undefined,
      inscription_code: inscriptionCode,
      form01_code: undefined,
      career_id: request.carreraId,
      study_plan_id: studyPlan.id,
      admission_date: new Date(),
      status: 'activo' as any,
      estado_matricula: StudentMatriculaStatus.MATRICULADO,
      origen: request.origen === 'web' ? StudentOrigin.WEB : StudentOrigin.SECRETARIA,
      admission_request_id: request.id,
      verificado_por: request.verificado_por || undefined,
      fecha_verificacion: new Date(),
      fecha_pre_registro: request.created_at,
    };

    const estudiante = this.estudianteRepository.create(estudianteData);

    const savedStudent = (await this.estudianteRepository.save(estudiante)) as Estudiante;

    request.estado = EstadoAdmision.CONVERTIDO;
    request.estudianteConvertidoId = savedStudent.id;
    await this.admissionRepository.save(request);

    return { student: savedStudent, persona };
  }

  private async generateInscriptionCode(request: SolicitudAdmision): Promise<string> {
    const carrera = await this.estudianteRepository.manager.findOne(
      Carrera,
      { where: { id: request.carreraId } }
    ) as Carrera | null;

    if (!carrera) {
      throw new BadRequestException('Carrera no encontrada');
    }

    const gestion = new Date().getFullYear().toString();
    const yearSuffix = gestion.slice(-2);

    const initials = (
      (request.lastname_paternal?.[0] || '') +
      (request.lastname_maternal?.[0] || '') +
      (request.nombre?.[0] || '')
    ).toUpperCase();

    const careerCode = carrera.nombre.substring(0, 2).toUpperCase();

    const ciLast2 = request.ci.slice(-2);

    let code = `${initials}-${careerCode}${yearSuffix}${ciLast2}`;

    let counter = 1;
    while (await this.estudianteRepository.findOne({ where: { inscription_code: code } })) {
      code = `${initials}-${careerCode}${yearSuffix}${ciLast2}-${counter}`;
      counter++;
    }

    return code;
  }

  async remove(id: string): Promise<void> {
    const request = await this.findOne(id);
    await this.admissionRepository.remove(request);
  }

  async getStatistics(): Promise<{
    total: number;
    pendientes: number;
    verificados: number;
    rechazados: number;
    convertidos: number;
  }> {
    const total = await this.admissionRepository.count();
    const pendientes = await this.admissionRepository.count({ where: { estado: EstadoAdmision.PENDIENTE } });
    const verificados = await this.admissionRepository.count({ where: { estado: EstadoAdmision.VERIFICADO } });
    const rechazados = await this.admissionRepository.count({ where: { estado: EstadoAdmision.RECHAZADO } });
    const convertidos = await this.admissionRepository.count({ where: { estado: EstadoAdmision.CONVERTIDO } });

    return { total, pendientes, verificados, rechazados, convertidos };
  }
}
