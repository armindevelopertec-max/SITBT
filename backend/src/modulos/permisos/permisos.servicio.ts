import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionPermiso, EstadoPermiso, Permiso } from '../../entidades/permiso.entidad';
import { Rol } from '../../entidades/rol.entidad';
import { ActualizarPermisosDto } from './dto/actualizar-permisos.dto';
import { CATALOGO_PERMISOS, ModuloPermiso } from './catalogo-permisos';

@Injectable()
export class ServicioPermisos {
  constructor(
    @InjectRepository(Permiso)
    private repositorioPermiso: Repository<Permiso>,
    @InjectRepository(Rol)
    private repositorioRol: Repository<Rol>,
  ) {}

  obtenerCatalogo(): ModuloPermiso[] {
    return CATALOGO_PERMISOS;
  }

  async obtenerPorRol(rolId: number): Promise<Permiso[]> {
    await this.obtenerRol(rolId);

    return this.repositorioPermiso.find({
      where: { rolId, estado: EstadoPermiso.ACTIVO },
      order: { modulo: 'ASC', accion: 'ASC' },
    });
  }

  async actualizarPorRol(
    rolId: number,
    datos: ActualizarPermisosDto,
  ): Promise<Permiso[]> {
    const rol = await this.obtenerRol(rolId);

    if (rol.codigo === 'administrador') {
      throw new BadRequestException(
        'El rol administrador tiene acceso total y no requiere permisos',
      );
    }

    const unicos = new Map<string, { modulo: string; accion: AccionPermiso }>();

    for (const item of datos.permisos) {
      const modulo = CATALOGO_PERMISOS.find(
        (catalogo) => catalogo.modulo === item.modulo,
      );

      if (!modulo) {
        throw new BadRequestException(
          `El módulo "${item.modulo}" no existe en el catálogo de permisos`,
        );
      }

      if (!modulo.acciones.includes(item.accion)) {
        throw new BadRequestException(
          `La acción "${item.accion}" no es válida para el módulo "${item.modulo}"`,
        );
      }

      unicos.set(`${item.modulo}:${item.accion}`, {
        modulo: item.modulo,
        accion: item.accion,
      });
    }

    const permisos = Array.from(unicos.values());

    await this.repositorioPermiso.manager.transaction(async (gestor) => {
      const repositorio = gestor.getRepository(Permiso);

      await repositorio.delete({ rolId });

      if (permisos.length > 0) {
        await repositorio.save(
          permisos.map((permiso) =>
            repositorio.create({
              rolId,
              modulo: permiso.modulo,
              accion: permiso.accion,
              estado: EstadoPermiso.ACTIVO,
            }),
          ),
        );
      }
    });

    return this.obtenerPorRol(rolId);
  }

  private async obtenerRol(rolId: number): Promise<Rol> {
    const rol = await this.repositorioRol.findOne({ where: { id: rolId } });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
    }

    return rol;
  }
}
