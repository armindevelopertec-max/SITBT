import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';

@Entity('certificates')
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column()
  issued_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'issued_by' })
  emisor: Usuario;

  @CreateDateColumn()
  created_at: Date;
}
