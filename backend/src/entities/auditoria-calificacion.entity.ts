import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Calificacion } from './calificacion.entity';
import { Usuario } from './usuario.entity';

@Entity('grade_audit')
export class AuditoriaCalificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade_id: number;

  @ManyToOne(() => Calificacion)
  @JoinColumn({ name: 'grade_id' })
  calificacion: Calificacion;

  @Column({ type: 'varchar', length: 30, name: 'field_changed' })
  field_changed: string;

  @Column({ type: 'varchar', length: 50, name: 'old_value', nullable: true })
  old_value: string;

  @Column({ type: 'varchar', length: 50, name: 'new_value', nullable: true })
  new_value: string;

  @Column()
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'changed_at' })
  changed_at: Date;
}
