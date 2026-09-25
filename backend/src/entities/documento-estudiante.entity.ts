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

@Entity('student_documents')
export class DocumentoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 50, name: 'document_type' })
  document_type: string;

  @Column({ type: 'boolean', default: false })
  delivered: boolean;

  @Column({ type: 'date', nullable: true, name: 'delivered_date' })
  delivered_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'file_url' })
  file_url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
