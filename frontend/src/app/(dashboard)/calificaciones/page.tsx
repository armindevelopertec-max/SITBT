'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const datosCalificaciones = [
  { id: 1, estudiante: 'Juan Perez', materia: 'Programación I', tipo: 'Examen Parcial', nota: 85, fecha: '2024-03-15' },
  { id: 2, estudiante: 'Maria Lopez', materia: 'Matemáticas I', tipo: 'Práctica', nota: 92, fecha: '2024-03-16' },
  { id: 3, estudiante: 'Carlos Mendez', materia: 'Física I', tipo: 'Examen Final', nota: 78, fecha: '2024-03-17' },
  { id: 4, estudiante: 'Ana Rodriguez', materia: 'Contabilidad', tipo: 'Trabajo', nota: 88, fecha: '2024-03-18' },
];

const obtenerColorNota = (nota: number) => {
  if (nota >= 80) return 'exito';
  if (nota >= 60) return 'advertencia';
  return 'error';
};

export default function PaginaCalificaciones() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Calificaciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Calificación
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Calificaciones</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada placeholder="Buscar calificación..." className="pl-10" />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Estudiante</CeldaEncabezado>
                <CeldaEncabezado>Materia</CeldaEncabezado>
                <CeldaEncabezado>Tipo</CeldaEncabezado>
                <CeldaEncabezado>Nota</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {datosCalificaciones.map((calificacion) => (
                <FilaTabla key={calificacion.id}>
                  <CeldaTabla className="font-medium">{calificacion.estudiante}</CeldaTabla>
                  <CeldaTabla>{calificacion.materia}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante="contorno">{calificacion.tipo}</Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante={obtenerColorNota(calificacion.nota)}>{calificacion.nota}</Insignia>
                  </CeldaTabla>
                  <CeldaTabla>{calificacion.fecha}</CeldaTabla>
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
