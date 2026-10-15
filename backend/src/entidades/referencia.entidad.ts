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
  contacto1Nombre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact1_telefono' })
  contacto1Telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contact2_name' })
  contacto2Nombre: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'contact2_telefono' })
  contacto2Telefono: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
