import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Usuario } from '../../entidades/usuario.entidad';
import { EstadoRol } from '../../entidades/rol.entidad';
import { EstadoPermiso, Permiso } from '../../entidades/permiso.entidad';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(
    private servicioConfiguracion: ConfigService,
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(Permiso)
    private repositorioPermiso: Repository<Permiso>,
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
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }

    const rolesActivos = (usuario.usuarioRoles ?? []).filter(
      (usuarioRol) => usuarioRol.rol?.estado === EstadoRol.ACTIVO,
    );

    const rolIds = rolesActivos
      .map((usuarioRol) => usuarioRol.rol?.id)
      .filter((id): id is number => typeof id === 'number');

    const permisos =
      rolIds.length > 0
        ? await this.repositorioPermiso.find({
            where: {
              rolId: In(rolIds),
              estado: EstadoPermiso.ACTIVO,
            },
          })
        : [];

    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      personaId: usuario.personaId,
      roles: rolesActivos
        .map((usuarioRol) => usuarioRol.rol?.codigo)
        .filter((codigo): codigo is string => Boolean(codigo)),
      permisos: [
        ...new Set(permisos.map((permiso) => `${permiso.modulo}:${permiso.accion}`)),
      ],
    };
  }
}
