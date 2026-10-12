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

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
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

  @Post(':id/change-password')
  changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: { newPassword: string }) {
    return this.usersService.changePassword(id, body.newPassword);
  }

  @Post(':id/assign-role/:roleId')
  assignRole(@Param('id', ParseIntPipe) id: number, @Param('roleId', ParseIntPipe) roleId: number) {
    return this.usersService.assignRole(id, roleId);
  }

  @Delete(':id/remove-role/:roleId')
  removeRole(@Param('id', ParseIntPipe) id: number, @Param('roleId', ParseIntPipe) roleId: number) {
    return this.usersService.removeRole(id, roleId);
  }

  @Get(':id/roles')
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserRoles(id);
  }
}