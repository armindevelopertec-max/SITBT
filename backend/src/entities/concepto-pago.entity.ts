import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentConceptType {
  UNICO = 'unico',
  SEMESTRAL = 'semestral',
}

export enum PaymentConceptStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('payment_concepts')
export class ConceptoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: PaymentConceptType })
  type: PaymentConceptType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'default_amount' })
  default_amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PaymentConceptStatus, default: PaymentConceptStatus.ACTIVO })
  status: PaymentConceptStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
