'use client';

import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const datosInscripciones = [
  { id: 1, estudiante: 'Juan Perez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-15', estado: 'confirmado' },
  { id: 2, estudiante: 'Maria Lopez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-16', estado: 'confirmado' },
  { id: 3, estudiante: 'Carlos Mendez', grupo: 'B-2024-1', materia: 'Matemáticas I', fecha: '2024-01-17', estado: 'pendiente' },
];

const coloresEstado: Record<string, 'exito' | 'advertencia' | 'error'> = {
  confirmado: 'exito',
  pendiente: 'advertencia',
  cancelado: 'error',
};

export default function PaginaInscripciones() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Inscripciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Inscripciones</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Inscripción
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Inscripciones</TituloTarjeta>
            <BuscadorFiltro
              placeholder="Buscar inscripción..."
            />
            </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Estudiante</CeldaEncabezado>
                <CeldaEncabezado>Grupo</CeldaEncabezado>
                <CeldaEncabezado>Materia</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {datosInscripciones.map((inscripcion) => (
                <FilaTabla key={inscripcion.id}>
                  <CeldaTabla className="font-medium">{inscripcion.estudiante}</CeldaTabla>
                  <CeldaTabla>{inscripcion.grupo}</CeldaTabla>
                  <CeldaTabla>{inscripcion.materia}</CeldaTabla>
                  <CeldaTabla>{inscripcion.fecha}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante={coloresEstado[inscripcion.estado]} className="capitalize">
                      {inscripcion.estado}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono">
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}
