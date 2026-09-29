import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from '../../entities/estudiante.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Persona } from '../../entities/persona.entity';
import { Carrera } from '../../entities/carrera.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Persona, Carrera, PlanEstudio, Usuario, UsuarioRol, Rol])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}