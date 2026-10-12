import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entity';

@Entity('student_payment_estado')
export class EstadoPagoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 10 })
  gestion: string;

  @Column({ type: 'boolean', default: false, name: 'form_registration_paid' })
  form_registration_paid: boolean;

  @Column({ type: 'boolean', default: false, name: 'credential_paid' })
  credential_paid: boolean;

  @Column({ type: 'boolean', default: false })
  inscription_enabled: boolean;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
