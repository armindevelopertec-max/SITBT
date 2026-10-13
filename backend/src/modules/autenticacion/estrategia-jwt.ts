import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Usuario)
    private userRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'sitbt_secret_key_2024'),
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['persona'],
    });

    if (!user || user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }

    return {
      id: user.id,
      username: user.nombreUsuario,
      person_id: user.personaId,
    };
  }
}
