import { PartialType } from '@nestjs/swagger';
import { CrearEstudianteDto } from './crear-estudiante.dto';

export class ActualizarEstudianteDto extends PartialType(CrearEstudianteDto) {
  personaId?: number;
  carreraId?: number;
  planEstudioId?: number;
  gestionAdmision?: string;
  numeroFolder?: string;
  codigoInscripcion?: string;
  codigoFormulario01?: string;
  fechaAdmision?: string;
  estado?: any;
  numeroTituloBachiller?: string;
  fechaTituloBachiller?: string;
  solicitudAdmisionId?: string;
  estadoMatricula?: any;
  origen?: any;
}
