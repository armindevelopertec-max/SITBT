import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoRol {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'codigo' })
  code: string;

  @Column({ type: 'varchar', length: 50 , name: 'nombre' })
  name: string;

  @Column({ type: 'text', nullable: true , name: 'descripcion' })
  description: string;

  @Column({ type: 'enum', enum: EstadoRol, default: EstadoRol.ACTIVO, name: 'estado' })
  status: EstadoRol;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
