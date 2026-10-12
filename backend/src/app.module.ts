import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloAutenticacion } from './modules/autenticacion/autenticacion.module';
import { PersonsModule } from './modules/persons/persons.module';
import { StudentsModule } from './modules/students/students.module';
import { ModuloPersonal } from './modules/personal/personal.module';
import { ModuloUsuarios } from './modules/usuarios/usuarios.module';
import { ModuloRoles } from './modules/roles/roles.module';
import { ModuloCarreras } from './modules/carreras/carreras.module';
import { ModuloPlanesEstudio } from './modules/planes-estudio/planes-estudio.module';
import { ModuloMaterias } from './modules/materias/materias.module';
import { ModuloTurnos } from './modules/turnos/turnos.module';
import { ModuloGrupos } from './modules/grupos/grupos.module';
import { ModuloInscripciones } from './modules/inscripciones/inscripciones.module';
import { GradesModule } from './modules/grades/grades.module';
import { TeachingAssignmentsModule } from './modules/teaching-assignments/teaching-assignments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ConvalidationsModule } from './modules/convalidations/convalidations.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { InstitutionSettingsModule } from './modules/institution-settings/institution-settings.module';
import { GestionesModule } from './modules/gestiones/gestiones.module';
import { ModuloAdmision } from './modules/admision/admision.module';
import { ConsentModule } from './modules/consent/consent.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PreinscripcionModule } from './modules/preinscripcion/preinscripcion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'sitbt'),
        password: configService.get('DB_PASSWORD', 'sitbt_password'),
        database: configService.get('DB_DATABASE', 'sitbt_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        timezone: 'America/La_Paz',
      }),
      inject: [ConfigService],
    }),
    ModuloAutenticacion,
    PersonsModule,
    StudentsModule,
    ModuloPersonal,
    ModuloUsuarios,
    ModuloRoles,
    ModuloCarreras,
    ModuloPlanesEstudio,
    ModuloMaterias,
    ModuloTurnos,
    ModuloGrupos,
    ModuloInscripciones,
    GradesModule,
    TeachingAssignmentsModule,
    CertificatesModule,
    CredentialsModule,
    PaymentsModule,
    ConvalidationsModule,
    AuditModule,
    StorageModule,
    InstitutionSettingsModule,
    GestionesModule,
    ModuloAdmision,
    ConsentModule,
    DocumentsModule,
    NotificationsModule,
    PreinscripcionModule,
  ],
})
export class AppModule {}
