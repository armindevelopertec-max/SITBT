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
  codigo: string;

  @Column({ type: 'varchar', length: 100 , name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 150, name: 'titulo' })
  titulo: string;

  @Column({ type: 'text', nullable: true , name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'int', default: 3600, name: 'horas_carga' })
  horasCarga: number;

  @Column({ type: 'enum', enum: EstadoCarrera, default: EstadoCarrera.ACTIVO, name: 'estado' })
  estado: EstadoCarrera;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
