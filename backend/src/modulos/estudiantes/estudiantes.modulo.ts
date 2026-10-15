import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { ServicioEstudiantes } from './estudiantes.servicio';
import { ControladorEstudiantes } from './estudiantes.controlador';
import { Persona } from '../../entidades/persona.entidad';
import { Carrera } from '../../entidades/carrera.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Rol } from '../../entidades/rol.entidad';
import { Credencial } from '../../entidades/credencial.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Persona, Carrera, PlanEstudio, Usuario, UsuarioRol, Rol, Credencial])],
  controllers: [ControladorEstudiantes],
  providers: [ServicioEstudiantes],
  exports: [ServicioEstudiantes],
})
export class ModuloEstudiantes {}