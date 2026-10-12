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

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'persona_id' })
  person_id: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'nombre_usuario' })
  username: string;

  @Column({ type: 'varchar', length: 255, name: 'contrasena_hash' })
  password_hash: string;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO , name: 'estado' })
  status: EstadoUsuario;

  @Column({ type: 'timestamp', nullable: true, name: 'ultimo_acceso' })
  last_login: Date;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
