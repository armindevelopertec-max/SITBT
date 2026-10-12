import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoConceptoPago {
  UNICO = 'unico',
  SEMESTRAL = 'semestral',
}

export enum EstadoConceptoPago {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('conceptos_pago')
export class ConceptoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'codigo' })
  codigo: string;

  @Column({ type: 'varchar', length: 100 , name: 'nombre' })
  nombre: string;

  @Column({ type: 'enum', enum: TipoConceptoPago, name: 'tipo' })
  tipo: TipoConceptoPago;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto_predeterminado' })
  montoPredeterminado: number;

  @Column({ type: 'text', nullable: true, name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'enum', enum: EstadoConceptoPago, default: EstadoConceptoPago.ACTIVO, name: 'estado' })
  estado: EstadoConceptoPago;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
