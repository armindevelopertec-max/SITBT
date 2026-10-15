import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../../entidades/rol.entidad';
import { ServicioRoles } from './roles.servicio';
import { ControladorRoles } from './roles.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [ControladorRoles],
  providers: [ServicioRoles],
  exports: [ServicioRoles],
})
export class ModuloRoles {}