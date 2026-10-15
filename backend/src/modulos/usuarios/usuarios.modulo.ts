import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { ServicioUsuarios } from './usuarios.servicio';
import { ControladorUsuarios } from './usuarios.controlador';
import { Persona } from '../../entidades/persona.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, Persona])],
  controllers: [ControladorUsuarios],
  providers: [ServicioUsuarios],
  exports: [ServicioUsuarios],
})
export class ModuloUsuarios {}