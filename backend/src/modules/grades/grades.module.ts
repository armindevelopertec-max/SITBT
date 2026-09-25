import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calificacion } from '../../entities/calificacion.entity';
import { AuditoriaCalificacion } from '../../entities/auditoria-calificacion.entity';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { Personal } from '../../entities/personal.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calificacion, AuditoriaCalificacion, Inscripcion, Personal, Usuario])],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}