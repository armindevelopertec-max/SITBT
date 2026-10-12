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

@Entity('conceptos_pago')
export class ConceptoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'codigo' })
  code: string;

  @Column({ type: 'varchar', length: 100 , name: 'nombre' })
  name: string;

  @Column({ type: 'enum', enum: PaymentConceptType , name: 'tipo' })
  type: PaymentConceptType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto_predeterminado' })
  default_amount: number;

  @Column({ type: 'text', nullable: true , name: 'descripcion' })
  description: string;

  @Column({ type: 'enum', enum: PaymentConceptStatus, default: PaymentConceptStatus.ACTIVO, name: 'estado' })
  status: PaymentConceptStatus;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
