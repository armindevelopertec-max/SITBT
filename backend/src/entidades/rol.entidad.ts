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
  codigo: string;

  @Column({ type: 'varchar', length: 50, name: 'nombre' })
  nombre: string;

  @Column({ type: 'text', nullable: true , name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'enum', enum: EstadoRol, default: EstadoRol.ACTIVO, name: 'estado' })
  estado: EstadoRol;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
