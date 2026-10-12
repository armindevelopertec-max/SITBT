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
import { ServicioRoles } from './roles.service';
import { CrearRolDto } from './dto/create-role.dto';
import { ActualizarRolDto } from './dto/update-role.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoRol } from '../../entities/rol.entity';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorRoles {
  constructor(private readonly rolesService: ServicioRoles) {}

  @Post()
  create(@Body() crearRolDto: CrearRolDto) {
    return this.rolesService.create(crearRolDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('estado') estado?: EstadoRol) {
    return this.rolesService.findAll(+page, +limit, estado);
  }

  @Get('active')
  findActive() {
    return this.rolesService.findActive();
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.rolesService.findByCodigo(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarRolDto: ActualizarRolDto) {
    return this.rolesService.update(id, actualizarRolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}