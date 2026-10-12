import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Persona } from './persona.entity';
import { UsuarioRol } from './usuario-rol.entity';

export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BLOQUEADO = 'bloqueado',
}

@Entity('users')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'person_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  status: EstadoUsuario;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
