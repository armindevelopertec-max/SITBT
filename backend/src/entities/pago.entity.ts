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
import { ConceptoPago } from './concepto-pago.entity';
import { Usuario } from './usuario.entity';

export enum PaymentMethod {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
}

export enum PaymentStatus {
  PAGADO = 'pagado',
  ANULADO = 'anulado',
  PENDIENTE = 'pendiente',
}

@Entity('payments')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column()
  concept_id: number;

  @ManyToOne(() => ConceptoPago)
  @JoinColumn({ name: 'concept_id' })
  concepto: ConceptoPago;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', name: 'payment_date' })
  payment_date: Date;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'receipt_number' })
  receipt_number: string;

  @Column()
  received_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'received_by' })
  receptor: Usuario;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PAGADO })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
