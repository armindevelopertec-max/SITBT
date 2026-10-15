'use client';

import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Plus, Search, Edit2, Trash2, FileText, Download } from 'lucide-react';

const datosCertificados = [
  { id: 1, estudiante: 'Juan Perez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-01-20', estado: 'entregado' },
  { id: 2, estudiante: 'Maria Lopez', tipo: 'Certificado de Estudios', fechaEmision: '2024-03-15', estado: 'emitido' },
  { id: 3, estudiante: 'Carlos Mendez', tipo: 'Certificado de Graduación', fechaEmision: '2024-03-10', estado: 'pendiente' },
  { id: 4, estudiante: 'Ana Rodriguez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-02-28', estado: 'entregado' },
];

const coloresEstado: Record<string, 'exito' | 'advertencia' | 'secundario' | 'error'> = {
  entregado: 'exito',
  emitido: 'advertencia',
  pendiente: 'secundario',
  anulado: 'error',
};

export default function PaginaCertificados() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Certificados' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Certificados</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Certificado
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Certificados</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada placeholder="Buscar certificado..." className="pl-10" />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Estudiante</CeldaEncabezado>
                <CeldaEncabezado>Tipo</CeldaEncabezado>
                <CeldaEncabezado>Fecha de Emisión</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {datosCertificados.map((certificado) => (
                <FilaTabla key={certificado.id}>
                  <CeldaTabla className="font-medium">{certificado.estudiante}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {certificado.tipo}
                    </div>
                  </CeldaTabla>
                  <CeldaTabla>{certificado.fechaEmision}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante={coloresEstado[certificado.estado]} className="capitalize">
                      {certificado.estado}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" title="Descargar">
                        <Download className="w-4 h-4" />
                      </Boton>
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
