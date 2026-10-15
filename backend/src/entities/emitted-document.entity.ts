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
  RECORD_ACADEMICO = 'record_academico',
}

export enum EstadoDocumento {
  GENERADO = 'generado',
  IMPRESO = 'impreso',
  ENTREGADO = 'entregado',
  ANULADO = 'anulado',
}

@Entity('documentos_emitidos')
export class DocumentoEmitido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'enum', enum: TipoDocumento })
  tipo: TipoDocumento;

  @Column({ type: 'varchar', length: 50, name: 'numero_documento' })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ nullable: true })
  gestionId: number;

  @ManyToOne(() => Gestion)
  @JoinColumn({ name: 'gestionId' })
  gestionRelacionada: Gestion;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fechaEmision' })
  fechaEmision: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'ruta_pdf' })
  rutaPdf: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'entregadoA' })
  entregadoA: string;

  @Column({ type: 'timestamp', nullable: true, name: 'fechaEntrega' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: EstadoDocumento, default: EstadoDocumento.GENERADO })
  estado: EstadoDocumento;

  @Column({ nullable: true })
  impresoPor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'impreso_por' })
  impresor: Usuario;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true, name: 'pago_relacionado_id' })
  pagoRelacionadoId: number;

  @Column({ nullable: true, name: 'credencial_relacionada_id' })
  credencialRelacionadaId: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
