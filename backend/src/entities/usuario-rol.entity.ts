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

@Entity('user_roles')
export class UsuarioRol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @Column()
  role_id: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'role_id' })
  rol: Rol;

  @CreateDateColumn({ name: 'assigned_at' })
  assigned_at: Date;
}
