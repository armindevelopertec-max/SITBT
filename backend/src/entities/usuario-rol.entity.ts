import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.entity';

@Entity('usuario_roles')
export class UsuarioRol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'rol_id' })
  role_id: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @CreateDateColumn({ name: 'asignado_en' })
  assigned_at: Date;
}
