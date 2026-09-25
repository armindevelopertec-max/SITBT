import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('audit_log')
export class RegistroAuditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  table: string;

  @Column({ type: 'int', nullable: true, name: 'record_id' })
  record_id: number;

  @Column({ type: 'text', nullable: true, name: 'old_value' })
  old_value: string;

  @Column({ type: 'text', nullable: true, name: 'new_value' })
  new_value: string;

  @CreateDateColumn()
  date: Date;
}
