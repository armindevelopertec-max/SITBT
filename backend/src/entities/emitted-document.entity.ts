import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';
import { Gestion } from './gestion.entity';

export enum DocumentType {
  BOLETA_INSCRIPCION = 'boleta_inscripcion',
  RECIBO_PAGO = 'recibo_pago',
  CARNET = 'carnet',
  CERTIFICADO = 'certificado',
  CONSTANCIA = 'constancia',
  recordAcademico = 'record_academico',
}

export enum DocumentStatus {
  GENERADO = 'generado',
  IMPRESO = 'impreso',
  ENTREGADO = 'entregado',
  ANULADO = 'anulado',
}

@Entity('emitted_documents')
export class EmittedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estudiante_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'enum', enum: DocumentType })
  tipo: DocumentType;

  @Column({ type: 'varchar', length: 50 })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ nullable: true })
  gestion_id: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestion_id' })
  gestionEntity: Gestion;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaEmision: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfPath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entregadoA: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.GENERADO })
  estado: DocumentStatus;

  @Column({ nullable: true })
  impreso_por: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'impreso_por' })
  impresor: Usuario;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true })
  related_payment_id: number;

  @Column({ nullable: true })
  related_credential_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
