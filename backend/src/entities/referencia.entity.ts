import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';

@Entity('student_references')
export class Referencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact1_name' })
  contact1_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact1_phone' })
  contact1_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact2_name' })
  contact2_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact2_phone: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
