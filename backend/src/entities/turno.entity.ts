import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'codigo' })
  code: string;

  @Column({ type: 'varchar', length: 20 , name: 'nombre' })
  name: string;

  @Column({ type: 'time', name: 'hora_inicio' })
  start_time: string;

  @Column({ type: 'time', name: 'hora_fin' })
  end_time: string;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
