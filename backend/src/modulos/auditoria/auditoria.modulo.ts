import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAuditoria } from '../../entidades/registro-auditoria.entidad';
import { ServicioAuditoria } from './auditoria.servicio';
import { ControladorAuditoria } from './auditoria.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAuditoria])],
  controllers: [ControladorAuditoria],
  providers: [ServicioAuditoria],
  exports: [ServicioAuditoria],
})
export class ModuloAuditoria {}