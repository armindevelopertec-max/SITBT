import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Estudiante } from './estudiante.entidad';
import { Usuario } from './usuario.entidad';

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @Column({ type: 'varchar', length: 50 , name: 'tipo' })
  tipo: string;

  @Column({ type: 'date', name: 'fecha' })
  fecha: Date;

  @Column({ type: 'varchar', length: 30, unique: true, name: 'codigo' })
  codigo: string;

  @Column({ name: 'emitido_por' })
  emitidoPor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  emisor: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
