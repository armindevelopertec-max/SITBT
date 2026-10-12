import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from './persona.entity';

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

  @Column({ name: 'persona_id' })
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'profesion' })
  profession: string;

  @Column({ type: 'varchar', length: 50, name: 'cargo' })
  position: CargoPersonal;

  @Column({ type: 'date', name: 'fecha_contrato' })
  hire_date: Date;

  @Column({ type: 'varchar', length: 20, name: 'estado' })
  status: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
