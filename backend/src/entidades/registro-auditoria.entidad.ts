import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entidad';

@Entity('registro_auditoria')
export class RegistroAuditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 50, name: 'accion' })
  accion: string;

  @Column({ type: 'varchar', length: 50 , name: 'tabla' })
  tabla: string;

  @Column({ type: 'int', nullable: true, name: 'registro_id' })
  registroId: number;

  @Column({ type: 'text', nullable: true, name: 'valor_anterior' })
  valorAnterior: string;

  @Column({ type: 'text', nullable: true, name: 'valor_nuevo' })
  valorNuevo: string;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;
}
