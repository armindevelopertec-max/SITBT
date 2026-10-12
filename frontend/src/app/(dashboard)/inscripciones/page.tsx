'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const enrollmentsData = [
  { id: 1, estudiante: 'Juan Perez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-15', estado: 'confirmado' },
  { id: 2, estudiante: 'Maria Lopez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-16', estado: 'confirmado' },
  { id: 3, estudiante: 'Carlos Mendez', grupo: 'B-2024-1', materia: 'Matemáticas I', fecha: '2024-01-17', estado: 'pendiente' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'error'> = {
  confirmado: 'exito',
  pendiente: 'advertencia',
  cancelado: 'error',
};

export default function EnrollmentsPage() {
  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Inscripciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inscripciones</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Inscripción
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Inscripciones</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada placeholder="Buscar inscripción..." className="pl-10" />
            </div>
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
              {enrollmentsData.map((enrollment) => (
                <FilaTabla key={enrollment.id}>
                  <CeldaTabla className="font-medium">{enrollment.estudiante}</CeldaTabla>
                  <CeldaTabla>{enrollment.grupo}</CeldaTabla>
                  <CeldaTabla>{enrollment.materia}</CeldaTabla>
                  <CeldaTabla>{enrollment.fecha}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variant={estadoColors[enrollment.estado]} className="capitalize">
                      {enrollment.estado}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variant="ghost" size="icon">
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
