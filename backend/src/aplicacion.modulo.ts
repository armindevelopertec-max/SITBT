import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloAutenticacion } from './modulos/autenticacion/autenticacion.modulo';
import { ModuloPersonas } from './modulos/personas/personas.modulo';
import { ModuloEstudiantes } from './modulos/estudiantes/estudiantes.modulo';
import { ModuloPersonal } from './modulos/personal/personal.modulo';
import { ModuloAsistencias } from './modulos/asistencias/asistencias.modulo';
import { ModuloUsuarios } from './modulos/usuarios/usuarios.modulo';
import { ModuloRoles } from './modulos/roles/roles.modulo';
import { ModuloCarreras } from './modulos/carreras/carreras.modulo';
import { ModuloPlanesEstudio } from './modulos/planes-estudio/planes-estudio.modulo';
import { ModuloMaterias } from './modulos/materias/materias.modulo';
import { ModuloTurnos } from './modulos/turnos/turnos.modulo';
import { ModuloGrupos } from './modulos/grupos/grupos.modulo';
import { ModuloInscripciones } from './modulos/inscripciones/inscripciones.modulo';
import { ModuloMateriasImpartidas } from './modulos/materias-impartidas/materias-impartidas.modulo';
import { ModuloAsignacionesDocentes } from './modulos/asignaciones-docentes/asignaciones-docentes.modulo';
import { ModuloCertificados } from './modulos/certificados/certificados.modulo';
import { ModuloCredenciales } from './modulos/credenciales/credenciales.modulo';
import { ModuloPagos } from './modulos/pagos/pagos.modulo';
import { ModuloConvalidaciones } from './modulos/convalidaciones/convalidaciones.modulo';
import { ModuloAuditoria } from './modulos/auditoria/auditoria.modulo';
import { ModuloAlmacenamiento } from './modulos/almacenamiento/almacenamiento.modulo';
import { ModuloConfiguracionInstitucional } from './modulos/configuracion-institucional/configuracion-institucional.modulo';
import { ModuloGestiones } from './modulos/gestiones/gestiones.modulo';
import { ModuloAdmision } from './modulos/admision/admision.modulo';
import { ModuloConsentimiento } from './modulos/consentimiento/consentimiento.modulo';
import { ModuloDocumentos } from './modulos/documentos/documentos.modulo';
import { ModuloNotificaciones } from './modulos/notificaciones/notificaciones.modulo';
import { ModuloPreinscripcion } from './modulos/preinscripcion/preinscripcion.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (servicioConfiguracion: ConfigService) => ({
        type: 'postgres',
        host: servicioConfiguracion.get('DB_HOST', 'localhost'),
        port: servicioConfiguracion.get('DB_PORT', 5432),
        username: servicioConfiguracion.get('DB_USERNAME', 'sitbt'),
        password: servicioConfiguracion.get('DB_PASSWORD', 'sitbt_password'),
        database: servicioConfiguracion.get('DB_DATABASE', 'sitbt_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: servicioConfiguracion.get('DB_LOGGING', 'false') === 'true',
        timezone: 'America/La_Paz',
      }),
      inject: [ConfigService],
    }),
    ModuloAutenticacion,
    ModuloPersonas,
    ModuloEstudiantes,
    ModuloPersonal,
    ModuloAsistencias,
    ModuloUsuarios,
    ModuloRoles,
    ModuloCarreras,
    ModuloPlanesEstudio,
    ModuloMaterias,
    ModuloTurnos,
    ModuloGrupos,
    ModuloInscripciones,
    ModuloMateriasImpartidas,
    ModuloAsignacionesDocentes,
    ModuloCertificados,
    ModuloCredenciales,
    ModuloPagos,
    ModuloConvalidaciones,
    ModuloAuditoria,
    ModuloAlmacenamiento,
    ModuloConfiguracionInstitucional,
    ModuloGestiones,
    ModuloAdmision,
    ModuloConsentimiento,
    ModuloDocumentos,
    ModuloNotificaciones,
    ModuloPreinscripcion,
  ],
})
export class ModuloAplicacion {}
