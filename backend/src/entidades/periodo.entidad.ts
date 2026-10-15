import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gestion } from './gestion.entidad';
import { EstadoGestion } from './enumeraciones/estado-gestion.enumeracion';

@Entity('periodos')
export class Periodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'gestionId' })
  gestionId: number;

  @ManyToOne(() => Gestion, (gestion) => gestion.periodos)
  @JoinColumn({ name: 'gestionId' })
  gestion: Gestion;

  @Column({ type: 'varchar', length: 10, name: 'numero' })
  numero: string;

  @Column({ type: 'varchar', length: 50, nullable: true , name: 'nombre' })
  nombre: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: Date;

  @Column('enum', {
    enum: EstadoGestion,
    default: EstadoGestion.PENDIENTE,
    name: 'estado',
  })
  estado: EstadoGestion;

  @Column({ type: 'text', nullable: true, name: 'notas' })
  notas: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
