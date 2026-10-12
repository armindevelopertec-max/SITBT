import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAuditoria } from '../../entities/registro-auditoria.entity';
import { ServicioAuditoria } from './auditoria.service';
import { ControladorAuditoria } from './auditoria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAuditoria])],
  controllers: [ControladorAuditoria],
  providers: [ServicioAuditoria],
  exports: [ServicioAuditoria],
})
export class ModuloAuditoria {}