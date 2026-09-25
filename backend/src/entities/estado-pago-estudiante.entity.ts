import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';

@Entity('student_payment_status')
export class EstadoPagoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'student_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'boolean', default: false, name: 'form_registration_paid' })
  form_registration_paid: boolean;

  @Column({ type: 'boolean', default: false, name: 'credential_paid' })
  credential_paid: boolean;

  @Column({ type: 'boolean', default: false, name: 'inscription_enabled' })
  inscription_enabled: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
