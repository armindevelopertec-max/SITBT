import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloAutenticacion } from './modules/autenticacion/autenticacion.module';
import { ModuloPersonas } from './modules/personas/personas.module';
import { ModuloEstudiantes } from './modules/estudiantes/estudiantes.module';
import { ModuloPersonal } from './modules/personal/personal.module';
import { ModuloUsuarios } from './modules/usuarios/usuarios.module';
import { ModuloRoles } from './modules/roles/roles.module';
import { ModuloCarreras } from './modules/carreras/carreras.module';
import { ModuloPlanesEstudio } from './modules/planes-estudio/planes-estudio.module';
import { ModuloMaterias } from './modules/materias/materias.module';
import { ModuloTurnos } from './modules/turnos/turnos.module';
import { ModuloGrupos } from './modules/grupos/grupos.module';
import { ModuloInscripciones } from './modules/inscripciones/inscripciones.module';
import { ModuloCalificaciones } from './modules/calificaciones/calificaciones.module';
import { ModuloAsignacionesDocentes } from './modules/asignaciones-docentes/asignaciones-docentes.module';
import { ModuloCertificados } from './modules/certificados/certificados.module';
import { ModuloCredenciales } from './modules/credenciales/credenciales.module';
import { ModuloPagos } from './modules/pagos/pagos.module';
import { ModuloConvalidaciones } from './modules/convalidaciones/convalidaciones.module';
import { ModuloAuditoria } from './modules/auditoria/auditoria.module';
import { ModuloAlmacenamiento } from './modules/almacenamiento/almacenamiento.module';
import { ModuloConfiguracionInstitucional } from './modules/configuracion-institucional/configuracion-institucional.module';
import { ModuloGestiones } from './modules/gestiones/gestiones.module';
import { ModuloAdmision } from './modules/admision/admision.module';
import { ModuloConsentimiento } from './modules/consentimiento/consentimiento.module';
import { ModuloDocumentos } from './modules/documentos/documentos.module';
import { ModuloNotificaciones } from './modules/notificaciones/notificaciones.module';
import { ModuloPreinscripcion } from './modules/preinscripcion/preinscripcion.module';

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
    ModuloUsuarios,
    ModuloRoles,
    ModuloCarreras,
    ModuloPlanesEstudio,
    ModuloMaterias,
    ModuloTurnos,
    ModuloGrupos,
    ModuloInscripciones,
    ModuloCalificaciones,
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
