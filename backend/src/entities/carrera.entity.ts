import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoCarrera {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('carreras')
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'codigo' })
  code: string;

  @Column({ type: 'varchar', length: 100 , name: 'nombre' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 150, name: 'titulo' })
  title: string;

  @Column({ type: 'text', nullable: true , name: 'descripcion' })
  description: string;

  @Column({ type: 'int', default: 3600, name: 'horas_carga' })
  load_hours: number;

  @Column({ type: 'enum', enum: EstadoCarrera, default: EstadoCarrera.ACTIVO, name: 'estado' })
  status: EstadoCarrera;

  @CreateDateColumn({ name: 'creado_en' })
  created_at: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updated_at: Date;
}
