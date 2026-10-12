import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';

export enum PermissionAction {
  CREAR = 'crear',
  LEER = 'leer',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
}

export enum PermissionStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('permissions')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id' })
  rolId: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ type: 'varchar', length: 50 })
  module: string;

  @Column({ type: 'enum', enum: PermissionAction, name: 'accion' })
  accion: PermissionAction;

  @Column({ type: 'enum', enum: PermissionStatus, default: PermissionStatus.ACTIVO })
  estado: PermissionStatus;
}
