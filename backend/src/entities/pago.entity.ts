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

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
}

export enum EstadoPago {
  PAGADO = 'pagado',
  ANULADO = 'anulado',
  PENDIENTE = 'pendiente',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ name: 'concepto_id' })
  concept_id: number;

  @ManyToOne(() => ConceptoPago)
  @JoinColumn({ name: 'concepto_id' })
  concepto: ConceptoPago;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto' })
  amount: number;

  @Column({ type: 'timestamp', name: 'fecha_pago' })
  payment_date: Date;

  @Column({ type: 'enum', enum: MetodoPago, name: 'metodo_pago' })
  payment_method: MetodoPago;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'numero_recibo' })
  receipt_number: string;

  @Column({ name: 'recibido_por' })
  received_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'recibido_por' })
  receptor: Usuario;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PAGADO , name: 'estado' })
  status: EstadoPago;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notes: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
