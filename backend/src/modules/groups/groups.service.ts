import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../../entities/grupo.entity';
import { GrupoEstudiante } from '../../entities/grupo-estudiante.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
    @InjectRepository(GrupoEstudiante)
    private groupStudentRepository: Repository<GrupoEstudiante>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Grupo> {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    careerId?: number,
    semester?: number,
  ): Promise<{ data: Grupo[]; total: number; page: number; limit: number }> {
    const query = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.career', 'career')
      .leftJoinAndSelect('group.study_plan', 'study_plan')
      .leftJoinAndSelect('group.shift', 'shift');

    if (gestion) {
      query.andWhere('group.gestion = :gestion', { gestion });
    }

    if (careerId) {
      query.andWhere('group.career_id = :careerId', { careerId });
    }

    if (semester) {
      query.andWhere('group.semester = :semester', { semester });
    }

    const [data, total] = await query
      .orderBy('group.gestion', 'DESC')
      .addOrderBy('group.semester', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Grupo> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['career', 'study_plan', 'shift'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Grupo> {
    const group = await this.findOne(id);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupRepository.remove(group);
  }

  async addStudent(groupId: number, studentId: number): Promise<GrupoEstudiante> {
    const groupStudent = this.groupStudentRepository.create({
      group_id: groupId,
      student_id: studentId,
    });
    return this.groupStudentRepository.save(groupStudent);
  }

  async removeStudent(groupId: number, studentId: number): Promise<void> {
    const groupStudent = await this.groupStudentRepository.findOne({
      where: { group_id: groupId, student_id: studentId },
    });
    if (groupStudent) {
      await this.groupStudentRepository.remove(groupStudent);
    }
  }

  async getStudents(groupId: number): Promise<GrupoEstudiante[]> {
    return this.groupStudentRepository.find({
      where: { group_id: groupId },
      relations: ['student', 'student.person'],
    });
  }

  async findByCareerAndShift(
    careerId: number,
    gestion: string,
    semester: number,
    shiftId: number,
  ): Promise<Grupo[]> {
    return this.groupRepository.find({
      where: { career_id: careerId, gestion, semester, shift_id: shiftId },
      relations: ['shift'],
    });
  }

  async getGroupStats(groupId: number): Promise<{ total: number; capacity: number }> {
    const group = await this.findOne(groupId);
    const count = await this.groupStudentRepository.count({
      where: { group_id: groupId },
    });
    return { total: count, capacity: group.capacity };
  }
}