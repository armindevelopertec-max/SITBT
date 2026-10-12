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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Turnos')
@Controller('turnos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.shiftsService.findAll(+page, +limit);
  }

  @Get('all')
  findAllShifts() {
    return this.shiftsService.findAllShifts();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.shiftsService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.remove(id);
  }
}