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

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 50, name: 'document_type' })
  document_tipo: string;

  @Column({ type: 'boolean', default: false })
  delivered: boolean;

  @Column({ type: 'fecha', nullable: true, name: 'delivered_date' })
  delivered_fecha: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'file_url' })
  file_url: string;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
