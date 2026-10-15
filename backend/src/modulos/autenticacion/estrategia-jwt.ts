import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entidades/usuario.entidad';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(
    private servicioConfiguracion: ConfigService,
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: servicioConfiguracion.get('JWT_SECRET', 'sitbt_secret_key_2024'),
    });
  }

  async validate(cargaUtil: { usuarioId: number; nombreUsuario: string }) {
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: cargaUtil.usuarioId },
      relations: ['persona'],
    });

    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }

    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      personaId: usuario.personaId,
    };
  }
}
