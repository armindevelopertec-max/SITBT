import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestionesService } from './gestiones.service';
import { GestionesController } from './gestiones.controller';
import { Gestion } from '../../entities/gestion.entity';
import { Periodo } from '../../entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gestion, Periodo])],
  controllers: [GestionesController],
  providers: [GestionesService],
  exports: [GestionesService],
})
export class GestionesModule {}
