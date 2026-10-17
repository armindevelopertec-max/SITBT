import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HuellaPersonal } from '../../entidades/huella-personal.entidad';
import { MarcacionPersonal } from '../../entidades/marcacion-personal.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { ServicioAsistencias } from './asistencias.servicio';
import { ControladorAsistencias } from './asistencias.controlador';
import { ControladorHuellasPersonal } from './huellas-personal.controlador';

@Module({
  imports: [
    TypeOrmModule.forFeature([HuellaPersonal, MarcacionPersonal, Personal]),
  ],
  controllers: [ControladorAsistencias, ControladorHuellasPersonal],
  providers: [ServicioAsistencias],
  exports: [ServicioAsistencias],
})
export class ModuloAsistencias {}
