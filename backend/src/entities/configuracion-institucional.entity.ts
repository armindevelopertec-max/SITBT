import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('configuracion_institucional')
export class ConfiguracionInstitucional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 50, name: 'nombre_corto' })
  nombre_corto: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'lema' })
  lema: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_url' })
  logo_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'direccion' })
  direccion: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'telefono' })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'departamento' })
  departamento: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'correo' })
  correo: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'sitio_web' })
  website: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ciudad' })
  ciudad: string;

  @Column({ type: 'varchar', length: 100, default: 'Bolivia', name: 'pais' })
  pais: string;

  @Column({ type: 'text', nullable: true, name: 'descripcion' })
  descripcion: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
