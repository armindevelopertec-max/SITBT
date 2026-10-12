import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Calificacion } from './calificacion.entity';
import { Usuario } from './usuario.entity';

@Entity('auditoria_calificacion')
export class AuditoriaCalificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'calificacion_id' })
  calificacionId: number;

  @ManyToOne(() => Calificacion)
  @JoinColumn({ name: 'calificacion_id' })
  calificacion: Calificacion;

  @Column({ type: 'varchar', length: 30, name: 'campo_cambiado' })
  campoCambiado: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'valor_anterior' })
  valorAnterior: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'valor_nuevo' })
  valorNuevo: string;

  @Column({ })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ })
  usuario: Usuario;

  @CreateDateColumn({ name: 'cambiado_en' })
  cambiadoEn: Date;
}
