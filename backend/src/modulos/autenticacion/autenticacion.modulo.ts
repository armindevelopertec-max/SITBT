import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControladorAutenticacion } from './autenticacion.controlador';
import { AutenticacionServicio } from './autenticacion.servicio';
import { EstrategiaJwt } from './estrategia-jwt';
import { GuardaRoles } from './guarda-roles';
import { Usuario } from '../../entidades/usuario.entidad';
import { Persona } from '../../entidades/persona.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Rol } from '../../entidades/rol.entidad';
import { Permiso } from '../../entidades/permiso.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Persona, UsuarioRol, Rol, Permiso]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (servicioConfiguracion: ConfigService) => ({
        secret: servicioConfiguracion.get('JWT_SECRET', 'sitbt_secret_key_2024'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ControladorAutenticacion],
  providers: [AutenticacionServicio, EstrategiaJwt, GuardaRoles],
  exports: [AutenticacionServicio, EstrategiaJwt, GuardaRoles, PassportModule],
})
export class ModuloAutenticacion {}
