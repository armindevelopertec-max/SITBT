import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AdmissionRequest, AdmissionStatus } from '../../entities/admission-request.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { Persona, Gender } from '../../entities/persona.entity';
import { Estudiante, StudentMatriculaStatus, StudentOrigin } from '../../entities/estudiante.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Carrera } from '../../entities/carrera.entity';
import { InstitutionSettings } from '../../entities/institution-settings.entity';

@Injectable()
export class AdmissionService {
  constructor(
    @InjectRepository(AdmissionRequest)
    private admissionRepository: Repository<AdmissionRequest>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Estudiante)
    private estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async create(createDto: CreateAdmissionDto): Promise<AdmissionRequest> {
    const request = this.admissionRepository.create({
      ...createDto,
      birthdate: new Date(createDto.birthdate),
    } as Partial<AdmissionRequest>);
    return this.admissionRepository.save(request);
  }

  async findAll(
    page = 1,
    limit = 20,
    estado?: AdmissionStatus,
    origen?: string,
  ): Promise<{ data: AdmissionRequest[]; total: number; page: number; limit: number }> {
    const query = this.admissionRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.carrera', 'carrera')
      .leftJoinAndSelect('request.verificador', 'verificador');

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

  async findOne(id: string): Promise<AdmissionRequest> {
    const request = await this.admissionRepository.findOne({
      where: { id },
      relations: ['carrera', 'verificador'],
    });
    if (!request) {
      throw new NotFoundException(`Admission request with ID ${id} not found`);
    }
    return request;
  }

  async update(id: string, updateDto: UpdateAdmissionDto): Promise<AdmissionRequest> {
    const request = await this.findOne(id);

    if (updateDto.estado && updateDto.estado !== request.estado) {
      if (updateDto.estado === AdmissionStatus.RECHAZADO && !updateDto.observaciones) {
        throw new BadRequestException('Observaciones requeridas al rechazar');
      }
      updateDto.verificado_por = updateDto.verificado_por || 1;
    }

    Object.assign(request, updateDto);
    return this.admissionRepository.save(request);
  }

  async verify(id: string, verificadoPor: number, observaciones?: string): Promise<AdmissionRequest> {
    return this.update(id, {
      estado: AdmissionStatus.VERIFICADO,
      verificado_por: verificadoPor,
      observaciones,
    } as UpdateAdmissionDto);
  }

  async reject(id: string, verificadoPor: number, observaciones: string): Promise<AdmissionRequest> {
    if (!observaciones) {
      throw new BadRequestException('Observaciones requeridas al rechazar');
    }
    return this.update(id, {
      estado: AdmissionStatus.RECHAZADO,
      verificado_por: verificadoPor,
      observaciones,
    } as UpdateAdmissionDto);
  }

  async convertToStudent(id: string, admissionGestion: string): Promise<{ student: Estudiante; persona: Persona }> {
    const request = await this.findOne(id);

    if (request.estado !== AdmissionStatus.VERIFICADO) {
      throw new BadRequestException('La solicitud debe estar verificada para convertir a estudiante');
    }

    if (!request.carrera_id) {
      throw new BadRequestException('La solicitud debe tener una carrera asignada');
    }

    let persona = await this.personaRepository.findOne({ where: { ci: request.ci } });

    if (!persona) {
      persona = this.personaRepository.create({
        ci: request.ci,
        names: request.names,
        lastname_paternal: request.lastname_paternal || request.names.split(' ')[0] || request.names,
        lastname_maternal: request.lastname_maternal || request.names.split(' ').slice(1).join(' ') || '',
        birthdate: new Date(request.birthdate),
        birthplace: request.birthplace,
        gender: request.gender as Gender,
        marital_status: request.marital_status as any,
        nationality: request.nationality,
        phone: request.phone,
        email: request.email,
        address: request.address,
      });
      persona = (await this.personaRepository.save(persona)) as Persona;
    }

    const studyPlan = await this.estudianteRepository.manager.findOne(
      PlanEstudio,
      { where: { career_id: request.carrera_id, status: 'vigente' as any } }
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
      career_id: request.carrera_id,
      study_plan_id: studyPlan.id,
      admission_date: new Date(),
      status: 'activo' as any,
      estado_matricula: StudentMatriculaStatus.MATRICULADO,
      origen: request.origen === 'web' ? StudentOrigin.WEB : StudentOrigin.SECRETARIA,
      admission_request_id: request.id,
      verificado_por: request.verificado_por,
      fecha_verificacion: new Date(),
      fecha_pre_registro: request.created_at,
    };

    const estudiante = this.estudianteRepository.create(estudianteData);

    const savedStudent = (await this.estudianteRepository.save(estudiante)) as Estudiante;

    request.estado = AdmissionStatus.CONVERTIDO;
    request.converted_student_id = savedStudent.id;
    await this.admissionRepository.save(request);

    return { student: savedStudent, persona };
  }

  private async generateInscriptionCode(request: AdmissionRequest): Promise<string> {
    const carrera = await this.estudianteRepository.manager.findOne(
      require('../../entities/carrera.entity'),
      { where: { id: request.carrera_id } }
    ) as Carrera | null;

    if (!carrera) {
      throw new BadRequestException('Carrera no encontrada');
    }

    const gestion = new Date().getFullYear().toString();
    const yearSuffix = gestion.slice(-2);

    const initials = (
      (request.lastname_paternal?.[0] || '') +
      (request.lastname_maternal?.[0] || '') +
      (request.names?.[0] || '')
    ).toUpperCase();

    const careerCode = carrera.name.substring(0, 2).toUpperCase();

    const ciLast2 = request.ci.slice(-2);

    return `${initials}-${careerCode}${yearSuffix}${ciLast2}`;
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
    const pendientes = await this.admissionRepository.count({ where: { estado: AdmissionStatus.PENDIENTE } });
    const verificados = await this.admissionRepository.count({ where: { estado: AdmissionStatus.VERIFICADO } });
    const rechazados = await this.admissionRepository.count({ where: { estado: AdmissionStatus.RECHAZADO } });
    const convertidos = await this.admissionRepository.count({ where: { estado: AdmissionStatus.CONVERTIDO } });

    return { total, pendientes, verificados, rechazados, convertidos };
  }
}
