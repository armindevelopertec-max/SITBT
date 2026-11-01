import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '../../entidades/permiso.entidad';
import { Rol } from '../../entidades/rol.entidad';
import { ControladorPermisos } from './permisos.controlador';
import { ServicioPermisos } from './permisos.servicio';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, Rol])],
  controllers: [ControladorPermisos],
  providers: [ServicioPermisos],
  exports: [ServicioPermisos],
})
export class ModuloPermisos {}
