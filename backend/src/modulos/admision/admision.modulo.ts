import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdmision } from '../../entidades/solicitud-admision.entidad';
import { Persona } from '../../entidades/persona.entidad';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { ServicioAdmision } from './admision.servicio';
import { ControladorAdmision } from './admision.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAdmision, Persona, Estudiante, Inscripcion])],
  controllers: [ControladorAdmision],
  providers: [ServicioAdmision],
  exports: [ServicioAdmision],
})
export class ModuloAdmision {}
