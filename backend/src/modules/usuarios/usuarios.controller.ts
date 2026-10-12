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
import { ServicioUsuarios } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoUsuario } from '../../entities/usuario.entity';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorUsuarios {
  constructor(private readonly usersService: ServicioUsuarios) {}

  @Post()
  create(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usersService.create(crearUsuarioDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: EstadoUsuario,
  ) {
    return this.usersService.findAll(+page, +limit, status);
  }

  @Get('active')
  findActive() {
    return this.usersService.findActive();
  }

  @Get('nombre-usuario/:nombreUsuario')
  findByNombreUsuario(@Param('nombreUsuario') nombreUsuario: string) {
    return this.usersService.findByNombreUsuario(nombreUsuario);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarUsuarioDto: ActualizarUsuarioDto) {
    return this.usersService.update(id, actualizarUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/cambiar-contrasena')
  cambiarContrasena(@Param('id', ParseIntPipe) id: number, @Body() body: { nuevaContrasena: string }) {
    return this.usersService.cambiarContrasena(id, body.nuevaContrasena);
  }

  @Post(':id/asignar-rol/:rolId')
  asignarRol(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.usersService.asignarRol(id, rolId);
  }

  @Delete(':id/remover-rol/:rolId')
  removerRol(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.usersService.removerRol(id, rolId);
  }

  @Get(':id/roles')
  obtenerRolesUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.obtenerRolesUsuario(id);
  }
}