import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioGestiones } from './gestiones.service';
import { ControladorGestiones } from './gestiones.controller';
import { Gestion } from '../../entities/gestion.entity';
import { Periodo } from '../../entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gestion, Periodo])],
  controllers: [ControladorGestiones],
  providers: [ServicioGestiones],
  exports: [ServicioGestiones],
})
export class ModuloGestiones {}
