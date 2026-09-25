import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Personal } from './personal.entity';

export enum GradeStatusRegular {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
}

export enum GradeStatus2T {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
  NO_APLICA = 'no_aplica',
}

export enum GradeStatusDefinitivo {
  APROBADO = 'aprobado',
  REPROBADO = 'reprobado',
  NO_PRESENTO = 'no_presento',
}

@Entity('grades')
export class Calificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enrollment_id: number;

  @ManyToOne(() => Inscripcion)
  @JoinColumn({ name: 'enrollment_id' })
  inscripcion: Inscripcion;

  @Column({ type: 'int', nullable: true })
  partial_1: number;

  @Column({ type: 'int', nullable: true })
  partial_2: number;

  @Column({ type: 'int', nullable: true })
  final_average: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  observation: string;

  @Column({ type: 'enum', enum: GradeStatusRegular, nullable: true })
  status_regular: GradeStatusRegular;

  @Column({ type: 'boolean', default: false, name: 'second_turn_eligible' })
  second_turn_eligible: boolean;

  @Column({ type: 'int', nullable: true, name: 'second_turn_score' })
  second_turn_score: number;

  @Column({ type: 'boolean', default: false, name: 'second_turn_applied' })
  second_turn_applied: boolean;

  @Column({ type: 'enum', enum: GradeStatus2T, default: GradeStatus2T.NO_APLICA, name: 'status_2t' })
  status_2t: GradeStatus2T;

  @Column({ type: 'int', nullable: true, name: 'definitive_grade' })
  definitive_grade: number;

  @Column({ type: 'enum', enum: GradeStatusDefinitivo, nullable: true, name: 'status_definitivo' })
  status_definitivo: GradeStatusDefinitivo;

  @Column({ nullable: true })
  registered_by: number;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'registered_by' })
  docente: Personal;

  @CreateDateColumn({ name: 'registered_at' })
  registered_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
