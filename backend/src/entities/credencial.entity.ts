import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';
import { Gestion } from './gestion.entity';

export enum CredentialStatus {
  EMITIDA = 'emitida',
  ANULADA = 'anulada',
  REEMPLAZADA = 'reemplazada',
}

@Entity('credentials')
export class Credencial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ name: 'gestion_id', nullable: true })
  gestion_id: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestion_id' })
  gestionEntity: Gestion;

  @Column({ type: 'integer' })
  semester: number;

  @Column({ type: 'date', name: 'issued_date' })
  issued_date: Date;

  @Column({ type: 'date', name: 'valid_until' })
  valid_until: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'photo_url' })
  photo_url: string;

  @Column({ type: 'enum', enum: CredentialStatus, default: CredentialStatus.EMITIDA })
  status: CredentialStatus;

  @Column()
  issued_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'issued_by' })
  emisor: Usuario;

  @Column({ type: 'boolean', default: false })
  printed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
