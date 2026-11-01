import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Rol } from './rol.entidad';

export enum AccionPermiso {
  CREAR = 'crear',
  LEER = 'leer',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
}

export enum EstadoPermiso {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Index(['rolId', 'modulo', 'accion'], { unique: true })
@Entity('permissions')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id' })
  rolId: number;

  @ManyToOne(() => Rol, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ type: 'varchar', length: 50, name: 'module' })
  modulo: string;

  @Column({ type: 'enum', enum: AccionPermiso, name: 'accion' })
  accion: AccionPermiso;

  @Column({ type: 'enum', enum: EstadoPermiso, default: EstadoPermiso.ACTIVO })
  estado: EstadoPermiso;
}
