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

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 50 , name: 'tipo' })
  type: string;

  @Column({ type: 'date', name: 'fecha' })
  date: Date;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'codigo' })
  code: string;

  @Column({ name: 'emitido_por' })
  issued_by: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  emisor: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;
}
