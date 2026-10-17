import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Calificacion } from './calificacion.entidad';
import { Usuario } from './usuario.entidad';

@Entity('auditoria_calificacion')
export class AuditoriaCalificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'calificacion_id' })
  calificacionId: number;

  @ManyToOne(() => Calificacion)
  @JoinColumn({ name: 'calificacion_id' })
  calificacion: Calificacion;

  @Column({ type: 'varchar', length: 60, name: 'campo_cambiado' })
  campoCambiado: string;

  @Column({ type: 'text', nullable: true, name: 'valor_anterior' })
  valorAnterior: string | null;

  @Column({ type: 'text', nullable: true, name: 'valor_nuevo' })
  valorNuevo: string | null;

  @Column({ type: 'text', nullable: true, name: 'motivo' })
  motivo: string | null;

  @Column({ type: 'int', nullable: true, name: 'usuario_id' })
  usuarioId: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @CreateDateColumn({ name: 'cambiado_en' })
  cambiadoEn: Date;
}
