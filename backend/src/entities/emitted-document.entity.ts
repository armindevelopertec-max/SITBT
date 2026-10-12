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

export enum TipoDocumento {
  BOLETA_INSCRIPCION = 'boleta_inscripcion',
  RECIBO_PAGO = 'recibo_pago',
  CARNET = 'carnet',
  CERTIFICADO = 'certificado',
  CONSTANCIA = 'constancia',
  recordAcademico = 'record_academico',
}

export enum EstadoDocumento {
  GENERADO = 'generado',
  IMPRESO = 'impreso',
  ENTREGADO = 'entregado',
  ANULADO = 'anulado',
}

@Entity('documentos_emitidos')
export class EmittedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'enum', enum: TipoDocumento })
  type: TipoDocumento;

  @Column({ type: 'varchar', length: 50, name: 'numero_documento' })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ nullable: true })
  gestion_id: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestion_id' })
  gestionEntity: Gestion;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'ruta_pdf' })
  pdfPath: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'entregado_a' })
  entregadoA: string;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_entrega' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: EstadoDocumento, default: EstadoDocumento.GENERADO })
  status: EstadoDocumento;

  @Column({ nullable: true })
  impreso_por: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'impreso_por' })
  impresor: Usuario;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true, name: 'pago_relacionado_id' })
  related_payment_id: number;

  @Column({ nullable: true, name: 'credencial_relacionada_id' })
  related_credential_id: number;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
