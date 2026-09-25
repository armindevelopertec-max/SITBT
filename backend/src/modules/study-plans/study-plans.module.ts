import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEstudio } from '../../entities/plan-estudio.entity';
import { StudyPlansService } from './study-plans.service';
import { StudyPlansController } from './study-plans.controller';
import { Carrera } from '../../entities/carrera.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEstudio, Carrera])],
  controllers: [StudyPlansController],
  providers: [StudyPlansService],
  exports: [StudyPlansService],
})
export class StudyPlansModule {}