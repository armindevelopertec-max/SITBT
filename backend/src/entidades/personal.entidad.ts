import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from './persona.entidad';

/**
 * Cargos sugeridos de personal.
 *
 * NO son una lista cerrada: el cargo real es el `codigo` de un rol activo
 * (ver tabla `roles` y la pantalla /roles). Estos valores solo sirven como
 * referencia; el servicio valida el cargo contra los roles existentes.
 */
export enum CargoPersonal {
  DOCENTE = 'docente',
  SECRETARIA = 'secretaria',
  DIRECTOR_ACADEMICO = 'director_academico',
  RECTOR = 'rector',
  APOYO = 'apoyo',
  BIBLIOTECARIO = 'bibliotecario',
}

export enum EstadoPersonal {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  LICENCIA = 'licencia',
}

@Entity('personal')
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'personaId' })
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'profesion' })
  profesion: string;

  @Column({ type: 'varchar', length: 50, name: 'cargo' })
  cargo: string;

  @Column({ type: 'date', name: 'fecha_contrato' })
  fechaContrato: Date;

  @Column({ type: 'varchar', length: 20, name: 'estado' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
