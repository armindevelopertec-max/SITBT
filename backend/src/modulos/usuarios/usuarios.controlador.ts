import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioUsuarios } from './usuarios.servicio';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoUsuario } from '../../entidades/usuario.entidad';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador')
@ApiBearerAuth()
export class ControladorUsuarios {
  constructor(private readonly servicioUsuarios: ServicioUsuarios) {}

  @Post()
  crear(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.servicioUsuarios.crear(crearUsuarioDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoUsuario,
  ) {
    return this.servicioUsuarios.obtenerTodos(+pagina, +limite, estado);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioUsuarios.obtenerActivos();
  }

  @Get('nombre-usuario/:nombreUsuario')
  buscarPorNombreUsuario(@Param('nombreUsuario') nombreUsuario: string) {
    return this.servicioUsuarios.buscarPorNombreUsuario(nombreUsuario);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioUsuarios.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarUsuarioDto: ActualizarUsuarioDto) {
    return this.servicioUsuarios.actualizar(id, actualizarUsuarioDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioUsuarios.eliminar(id);
  }

  @Post(':id/cambiar-contrasena')
  cambiarContrasena(@Param('id', ParseIntPipe) id: number, @Body() cuerpo: { nuevaContrasena: string }) {
    return this.servicioUsuarios.cambiarContrasena(id, cuerpo.nuevaContrasena);
  }

  @Post(':id/asignar-rol/:rolId')
  asignarRol(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.servicioUsuarios.asignarRol(id, rolId);
  }

  @Delete(':id/remover-rol/:rolId')
  removerRol(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.servicioUsuarios.removerRol(id, rolId);
  }

  @Get(':id/roles')
  obtenerRolesUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.servicioUsuarios.obtenerRolesUsuario(id);
  }
}
