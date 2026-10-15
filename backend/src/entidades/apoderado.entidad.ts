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

@Entity('student_guardians')
export class Apoderado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'father_names' })
  nombresPadre: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'father_lastname_paternal' })
  apellidoPaternoPadre: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'father_lastname_maternal' })
  apellidoMaternoPadre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'father_ci' })
  ciPadre: string;

  @Column({ type: 'varchar', length: 5, nullable: true, name: 'father_ci_issued' })
  ciExpedidoPadre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'father_telefono' })
  telefonoPadre: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'father_direccion' })
  direccionPadre: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'mother_names' })
  nombresMadre: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'mother_lastname_paternal' })
  apellidoPaternoMadre: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'mother_lastname_maternal' })
  apellidoMaternoMadre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'mother_ci' })
  ciMadre: string;

  @Column({ type: 'varchar', length: 5, nullable: true, name: 'mother_ci_issued' })
  ciExpedidoMadre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'mother_telefono' })
  telefonoMadre: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'mother_direccion' })
  direccionMadre: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
