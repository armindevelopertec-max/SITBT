import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('registro_auditoria')
export class RegistroAuditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'usuario_id' })
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 50, name: 'accion' })
  action: string;

  @Column({ type: 'varchar', length: 50 , name: 'tabla' })
  table: string;

  @Column({ type: 'int', nullable: true, name: 'registro_id' })
  record_id: number;

  @Column({ type: 'text', nullable: true, name: 'valor_anterior' })
  old_value: string;

  @Column({ type: 'text', nullable: true, name: 'valor_nuevo' })
  new_value: string;

  @CreateDateColumn({ name: 'fecha' })
  date: Date;
}
