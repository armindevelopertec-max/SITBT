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
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { PersonStatus } from '../../entities/persona.entity';

@ApiTags('Personas')
@Controller('personas')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: PersonStatus,
  ) {
    return this.personsService.findAll(+page, +limit, status);
  }

  @Get('search')
  search(@Query('q') query: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.personsService.search(query, +page, +limit);
  }

  @Get('active')
  findActive() {
    return this.personsService.findActive();
  }

  @Get('ci/:ci')
  findByCi(@Param('ci') ci: string) {
    return this.personsService.findByCi(ci);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personsService.remove(id);
  }
}