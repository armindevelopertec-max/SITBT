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
  pagoFormularioInscripcion: boolean;

  @Column({ type: 'boolean', default: false, name: 'credential_paid' })
  pagoCredencial: boolean;

  @Column({ type: 'boolean', default: false, name: 'inscription_enabled' })
  inscripcionHabilitada: boolean;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
