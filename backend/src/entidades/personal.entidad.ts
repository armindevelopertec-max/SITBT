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
  cargo: CargoPersonal;

  @Column({ type: 'date', name: 'fecha_contrato' })
  fechaContrato: Date;

  @Column({ type: 'varchar', length: 20, name: 'estado' })
  estado: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
