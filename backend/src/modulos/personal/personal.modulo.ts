import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from '../../entidades/personal.entidad';
import { ServicioPersonal } from './personal.servicio';
import { ControladorPersonal } from './personal.controlador';
import { Persona } from '../../entidades/persona.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Rol } from '../../entidades/rol.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Personal, Persona, Usuario, UsuarioRol, Rol])],
  controllers: [ControladorPersonal],
  providers: [ServicioPersonal],
  exports: [ServicioPersonal],
})
export class ModuloPersonal {}