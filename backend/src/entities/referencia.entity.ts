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

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact1_name' })
  contact1_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact1_phone' })
  contact1_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact2_name' })
  contact2_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact2_phone' })
  contact2_phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
