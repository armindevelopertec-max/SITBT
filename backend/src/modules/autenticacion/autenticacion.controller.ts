import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutenticacionServicio } from './autenticacion.service';
import { GuardaJwt } from './guarda-jwt';

@ApiTags('Autenticacion')
@Controller('autenticacion')
export class ControladorAutenticacion {
  constructor(private autenticacionServicio: AutenticacionServicio) {}

  @Post('iniciar-sesion')
  async iniciarSesion(@Body() cuerpo: { nombreUsuario: string; contrasena: string }) {
    return this.autenticacionServicio.iniciarSesion(cuerpo.nombreUsuario, cuerpo.contrasena);
  }

  @Post('registrar')
  async registrar(@Body() cuerpo: { nombreUsuario: string; contrasena: string; personaId: number }) {
    return this.autenticacionServicio.registrar(cuerpo);
  }

  @Get('perfil')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async obtenerPerfil(@Request() peticion) {
    return this.autenticacionServicio.obtenerPerfil(peticion.user.id);
  }
}
