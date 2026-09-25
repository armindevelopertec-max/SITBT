import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Persona } from '../../entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, Persona])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}