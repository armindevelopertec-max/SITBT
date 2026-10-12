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

@Entity('student_guardians')
export class Apoderado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'father_names' })
  father_names: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'father_lastname_paternal' })
  father_lastname_paternal: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'father_lastname_maternal' })
  father_lastname_maternal: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'father_ci' })
  father_ci: string;

  @Column({ type: 'varchar', length: 5, nullable: true, name: 'father_ci_issued' })
  father_ci_issued: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'father_phone' })
  father_phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'father_address' })
  father_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'mother_names' })
  mother_names: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'mother_lastname_paternal' })
  mother_lastname_paternal: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'mother_lastname_maternal' })
  mother_lastname_maternal: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'mother_ci' })
  mother_ci: string;

  @Column({ type: 'varchar', length: 5, nullable: true, name: 'mother_ci_issued' })
  mother_ci_issued: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'mother_phone' })
  mother_phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mother_address: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
