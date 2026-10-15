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
  constructor(private readonly servicioRoles: ServicioRoles) {}

  @Post()
  crear(@Body() crearRolDto: CrearRolDto) {
    return this.servicioRoles.crear(crearRolDto);
  }

  @Get()
  obtenerTodos(@Query('pagina') pagina = 1, @Query('limite') limite = 20, @Query('estado') estado?: EstadoRol) {
    return this.servicioRoles.obtenerTodos(+pagina, +limite, estado);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioRoles.obtenerActivos();
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.servicioRoles.buscarPorCodigo(codigo);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioRoles.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarRolDto: ActualizarRolDto) {
    return this.servicioRoles.actualizar(id, actualizarRolDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioRoles.eliminar(id);
  }
}
