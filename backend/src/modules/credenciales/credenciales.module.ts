import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from '../../entities/credencial.entity';
import { ServicioCredenciales } from './credenciales.service';
import { ControladorCredenciales } from './credenciales.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Usuario } from '../../entities/usuario.entity';
import { Gestion } from '../../entities/gestion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Estudiante, Usuario, Gestion])],
  controllers: [ControladorCredenciales],
  providers: [ServicioCredenciales],
  exports: [ServicioCredenciales],
})
export class ModuloCredenciales {}