'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Plus, Search, Edit2, Trash2, FileText, Download } from 'lucide-react';

const certificatesData = [
  { id: 1, estudiante: 'Juan Perez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-01-20', estado: 'entregado' },
  { id: 2, estudiante: 'Maria Lopez', tipo: 'Certificado de Estudios', fechaEmision: '2024-03-15', estado: 'emitido' },
  { id: 3, estudiante: 'Carlos Mendez', tipo: 'Certificado de Graduación', fechaEmision: '2024-03-10', estado: 'pendiente' },
  { id: 4, estudiante: 'Ana Rodriguez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-02-28', estado: 'entregado' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'secondary' | 'error'> = {
  entregado: 'exito',
  emitido: 'advertencia',
  pendiente: 'secondary',
  anulado: 'error',
};

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Certificados' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Certificados</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Certificado
        </Boton>
      </div>

      <Tarjeta variant="bordered">
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
              {certificatesData.map((cert) => (
                <FilaTabla key={cert.id}>
                  <CeldaTabla className="font-medium">{cert.estudiante}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {cert.tipo}
                    </div>
                  </CeldaTabla>
                  <CeldaTabla>{cert.fechaEmision}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variant={estadoColors[cert.estado]} className="capitalize">
                      {cert.estado}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon" title="Descargar">
                        <Download className="w-4 h-4" />
                      </Boton>
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
