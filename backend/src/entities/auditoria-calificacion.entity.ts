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

@Entity('auditoria_calificacion')
export class AuditoriaCalificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'calificacion_id' })
  grade_id: number;

  @ManyToOne(() => Calificacion)
  @JoinColumn({ name: 'calificacion_id' })
  calificacion: Calificacion;

  @Column({ type: 'varchar', length: 30, name: 'campo_cambiado' })
  field_changed: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'valor_anterior' })
  old_value: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'valor_nuevo' })
  new_value: string;

  @Column({ })
  user_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  usuario: Usuario;

  @CreateDateColumn({ name: 'cambiado_en' })
  changed_at: Date;
}
