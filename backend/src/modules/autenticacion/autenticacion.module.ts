import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControladorAutenticacion } from './autenticacion.controller';
import { AutenticacionServicio } from './autenticacion.service';
import { EstrategiaJwt } from './estrategia-jwt';
import { Usuario } from '../../entities/usuario.entity';
import { Persona } from '../../entities/persona.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Persona, UsuarioRol, Rol]),
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
  providers: [AutenticacionServicio, EstrategiaJwt],
  exports: [AutenticacionServicio, EstrategiaJwt, PassportModule],
})
export class ModuloAutenticacion {}
