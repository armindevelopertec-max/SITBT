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

@Entity('student_referencias')
export class Referencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact1_name' })
  contact1_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact1_telefono' })
  contact1_telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact2_name' })
  contact2_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact2_telefono: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
