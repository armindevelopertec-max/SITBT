import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutenticacionServicio } from './autenticacion.service';
import { GuardaJwt } from './guarda-jwt';

@ApiTags('Autenticacion')
@Controller('autenticacion')
export class ControladorAutenticacion {
  constructor(private autenticacionServicio: AutenticacionServicio) {}

  @Post('login')
  async login(@Body() body: { nombreUsuario: string; password: string }) {
    return this.autenticacionServicio.login(body.nombreUsuario, body.password);
  }

  @Post('register')
  async register(@Body() body: { nombreUsuario: string; password: string; personaId: number }) {
    return this.autenticacionServicio.register(body);
  }

  @Get('profile')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    return this.autenticacionServicio.getProfile(req.usuario.id);
  }
}
