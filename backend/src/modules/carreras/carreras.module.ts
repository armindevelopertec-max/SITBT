import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from '../../entities/carrera.entity';
import { ServicioCarreras } from './carreras.service';
import { ControladorCarreras } from './carreras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera])],
  controllers: [ControladorCarreras],
  providers: [ServicioCarreras],
  exports: [ServicioCarreras],
})
export class ModuloCarreras {}