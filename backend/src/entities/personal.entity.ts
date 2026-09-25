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

export enum StaffPosition {
  DOCENTE = 'docente',
  SECRETARIA = 'secretaria',
  DIRECTOR_ACADEMICO = 'director_academico',
  RECTOR = 'rector',
  APOYO = 'apoyo',
  BIBLIOTECARIO = 'bibliotecario',
}

export enum StaffStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  LICENCIA = 'licencia',
}

@Entity('staff')
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'person_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profession: string;

  @Column({ type: 'enum', enum: StaffPosition })
  position: StaffPosition;

  @Column({ type: 'date' })
  hire_date: Date;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVO })
  status: StaffStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
