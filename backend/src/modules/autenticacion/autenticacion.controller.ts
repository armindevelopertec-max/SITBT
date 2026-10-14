import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutenticacionServicio } from './autenticacion.service';
import { GuardaJwt } from './guarda-jwt';

@ApiTags('Autenticacion')
@Controller('autenticacion')
export class ControladorAutenticacion {
  constructor(private autenticacionServicio: AutenticacionServicio) {}

  @Post('login')
  async login(@Body() body: { nombreUsuario: string; contrasena: string }) {
    return this.autenticacionServicio.login(body.nombreUsuario, body.contrasena);
  }

  @Post('registrar')
  async registrar(@Body() body: { nombreUsuario: string; contrasena: string; personaId: number }) {
    return this.autenticacionServicio.register(body);
  }

  @Get('perfil')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    return this.autenticacionServicio.getProfile(req.user.id);
  }
}
