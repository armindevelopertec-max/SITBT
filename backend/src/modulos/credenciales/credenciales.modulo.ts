import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from '../../entidades/credencial.entidad';
import { ServicioCredenciales } from './credenciales.servicio';
import { ControladorCredenciales } from './credenciales.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { Gestion } from '../../entidades/gestion.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Estudiante, Usuario, Gestion])],
  controllers: [ControladorCredenciales],
  providers: [ServicioCredenciales],
  exports: [ServicioCredenciales],
})
export class ModuloCredenciales {}