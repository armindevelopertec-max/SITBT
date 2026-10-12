import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAdmision } from '../../entities/admission-request.entity';
import { Persona } from '../../entities/persona.entity';
import { Estudiante } from '../../entities/estudiante.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { ServicioAdmision } from './admision.service';
import { ControladorAdmision } from './admision.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAdmision, Persona, Estudiante, Inscripcion])],
  controllers: [ControladorAdmision],
  providers: [ServicioAdmision],
  exports: [ServicioAdmision],
})
export class ModuloAdmision {}
