import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entidad';

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
  tipoDocumento: string;

  @Column({ type: 'boolean', default: false, name: 'delivered' })
  entregado: boolean;

  @Column({ type: 'date', nullable: true, name: 'delivered_date' })
  fechaEntrega: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'file_url' })
  archivoUrl: string;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
