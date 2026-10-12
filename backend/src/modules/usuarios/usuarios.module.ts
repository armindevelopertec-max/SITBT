import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { ServicioUsuarios } from './usuarios.service';
import { ControladorUsuarios } from './usuarios.controller';
import { Persona } from '../../entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, Persona])],
  controllers: [ControladorUsuarios],
  providers: [ServicioUsuarios],
  exports: [ServicioUsuarios],
})
export class ModuloUsuarios {}