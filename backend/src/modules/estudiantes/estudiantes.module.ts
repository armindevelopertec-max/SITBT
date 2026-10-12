import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from '../../entities/estudiante.entity';
import { ServicioEstudiantes } from './estudiantes.service';
import { ControladorEstudiantes } from './estudiantes.controller';
import { Persona } from '../../entities/persona.entity';
import { Carrera } from '../../entities/carrera.entity';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';
import { Credencial } from '../../entities/credencial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Persona, Carrera, PlanEstudio, Usuario, UsuarioRol, Rol, Credencial])],
  controllers: [ControladorEstudiantes],
  providers: [ServicioEstudiantes],
  exports: [ServicioEstudiantes],
})
export class ModuloEstudiantes {}