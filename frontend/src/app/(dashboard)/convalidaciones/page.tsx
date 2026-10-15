'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';

const datosConvalidaciones = [
  { id: 1, estudiante: 'Juan Perez', materiaOrigen: 'Cálculo I', materiaConvalidada: 'Matemáticas I', institucion: 'UMSA', fecha: '2024-02-15', estado: 'aprobado' },
  { id: 2, estudiante: 'Maria Lopez', materiaOrigen: 'Física Básica', materiaConvalidada: 'Física I', institucion: 'UCB', fecha: '2024-03-01', estado: 'pendiente' },
  { id: 3, estudiante: 'Carlos Mendez', materiaOrigen: 'Algebra Lineal', materiaConvalidada: 'Matemáticas II', institucion: 'UPSA', fecha: '2024-02-20', estado: 'rechazado' },
];

const coloresEstado: Record<string, 'exito' | 'advertencia' | 'error'> = {
  aprobado: 'exito',
  pendiente: 'advertencia',
  rechazado: 'error',
};

export default function PaginaConvalidaciones() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Convalidaciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Convalidaciones</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Convalidación
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Convalidaciones</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada placeholder="Buscar convalidación..." className="pl-10" />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Estudiante</CeldaEncabezado>
                <CeldaEncabezado>Materia Origen</CeldaEncabezado>
                <CeldaEncabezado>Materia Convalidada</CeldaEncabezado>
                <CeldaEncabezado>Institución</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {datosConvalidaciones.map((convalidacion) => (
                <FilaTabla key={convalidacion.id}>
                  <CeldaTabla className="font-medium">{convalidacion.estudiante}</CeldaTabla>
                  <CeldaTabla>{convalidacion.materiaOrigen}</CeldaTabla>
                  <CeldaTabla>{convalidacion.materiaConvalidada}</CeldaTabla>
                  <CeldaTabla>{convalidacion.institucion}</CeldaTabla>
                  <CeldaTabla>{convalidacion.fecha}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante={coloresEstado[convalidacion.estado]} className="capitalize">
                      {convalidacion.estado}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" title="Aprobar">
                        <Check className="w-4 h-4 text-green-500" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" title="Rechazar">
                        <X className="w-4 h-4 text-red-500" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono">
                        <Edit2 className="w-4 h-4" />
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
