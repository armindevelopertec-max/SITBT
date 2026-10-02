import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionRequest } from '../../entities/admission-request.entity';
import { Persona } from '../../entities/persona.entity';
import { Estudiante } from '../../entities/estudiante.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdmissionRequest, Persona, Estudiante, Inscripcion])],
  controllers: [AdmissionController],
  providers: [AdmissionService],
  exports: [AdmissionService],
})
export class AdmissionModule {}
