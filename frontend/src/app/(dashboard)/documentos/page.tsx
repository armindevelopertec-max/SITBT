'use client';

import { useEffect, useState } from 'react';
import { usarDocumentos, DocumentoEmitido } from '@/hooks/usarDocumentos';
import { Boton } from '@/components/ui/boton';
import { Insignia } from '@/components/ui/insignia';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import {
  Tabla,
  CuerpoTabla,
  CeldaTabla,
  CeldaEncabezado,
  EncabezadoTabla,
  FilaTabla,
} from '@/components/ui/tabla';
import { Selector } from '@/components/ui/selector';
import { FileText, Eye, Printer, CheckCircle, XCircle, Plus, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoLabels: Record<string, { label: string; color: string }> = {
  boleta_inscripcion: { label: 'Boleta Inscripción', color: 'bg-blue-100 text-blue-800' },
  recibo_pago: { label: 'Recibo Pago', color: 'bg-green-100 text-green-800' },
  carnet: { label: 'Carnet', color: 'bg-purple-100 text-purple-800' },
  certificado: { label: 'Certificado', color: 'bg-yellow-100 text-yellow-800' },
  constancia: { label: 'Constancia', color: 'bg-cyan-100 text-cyan-800' },
  record_academico: { label: 'Record Académico', color: 'bg-orange-100 text-orange-800' },
};

const estadoLabels: Record<string, { label: string; color: string }> = {
  generado: { label: 'Generado', color: 'bg-gray-100 text-gray-800' },
  impreso: { label: 'Impreso', color: 'bg-blue-100 text-blue-800' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  anulado: { label: 'Anulado', color: 'bg-red-100 text-red-800' },
};

export default function DocumentsPage() {
  const { loading, fetchDocuments, getStatistics } = usarDocumentos();
  const [documents, setDocuments] = useState<DocumentoEmitido[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDocuments({
      page,
      limit: 20,
      tipo: tipoFilter || undefined,
      estado: estadoFilter || undefined,
    }).then((result) => {
      setDocuments(result.data);
      setTotal(result.total);
    }).catch(console.error);
  }, [page, tipoFilter, estadoFilter]);

  useEffect(() => {
    getStatistics().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Gestión de documentos emitidos</p>
        </div>
        <Link href="/documentos/emitir">
          <Boton className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Emitir documento
          </Boton>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-500">Total documentos</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byType?.find((t: any) => t.tipo === 'boleta_inscripcion')?.count || 0}
            </div>
            <div className="text-sm text-blue-600">Boletas</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.byType?.find((t: any) => t.tipo === 'recibo_pago')?.count || 0}
            </div>
            <div className="text-sm text-green-600">Recibos</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byType?.find((t: any) => t.tipo === 'carnet')?.count || 0}
            </div>
            <div className="text-sm text-purple-600">Carnets</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Tarjeta className="mb-6">
        <ContenidoTarjeta className="pt-6">
          <div className="flex gap-4">
            <Selector
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos los tipos' },
                { value: 'boleta_inscripcion', label: 'Boleta Inscripción' },
                { value: 'recibo_pago', label: 'Recibo Pago' },
                { value: 'carnet', label: 'Carnet' },
                { value: 'certificado', label: 'Certificado' },
              ]}
              placeholder="Tipo de documento"
            />
            <Selector
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'generado', label: 'Generado' },
                { value: 'impreso', label: 'Impreso' },
                { value: 'entregado', label: 'Entregado' },
                { value: 'anulado', label: 'Anulado' },
              ]}
              placeholder="Estado"
            />
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Tabla */}
      <Tarjeta>
        <ContenidoTarjeta className="pt-6">
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Número</CeldaEncabezado>
                <CeldaEncabezado>Tipo</CeldaEncabezado>
                <CeldaEncabezado>Estudiante</CeldaEncabezado>
                <CeldaEncabezado>Gestión</CeldaEncabezado>
                <CeldaEncabezado>Fecha</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {loading ? (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8">
                    Cargando...
                  </CeldaTabla>
                </FilaTabla>
              ) : documents.length === 0 ? (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                    No hay documentos
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                documents.map((doc) => (
                  <FilaTabla key={doc.id}>
                    <CeldaTabla className="font-medium">{doc.numeroDocumento}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia className={tipoLabels[doc.tipo]?.color}>
                        {tipoLabels[doc.tipo]?.label || doc.tipo}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      {doc.estudiante
                        ? `${doc.estudiante.persona?.nombres} ${doc.estudiante.persona?.apellidoPaterno}`
                        : `ID: ${doc.estudianteId}`}
                    </CeldaTabla>
                    <CeldaTabla>{doc.gestion}</CeldaTabla>
                    <CeldaTabla>
                      {doc.fechaEmision
                        ? format(new Date(doc.fechaEmision), "d 'de' MMMM 'de' yyyy", { locale: es })
                        : '-'}
                    </CeldaTabla>
                    <CeldaTabla>
                      <Insignia className={estadoLabels[doc.estado]?.color}>
                        {estadoLabels[doc.estado]?.label || doc.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/documentos/${doc.id}`}>
                          <Boton variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Boton>
                        </Link>
                        {doc.estado !== 'entregado' && doc.estado !== 'anulado' && (
                          <Boton variant="ghost" size="sm" title="Imprimir">
                            <Printer className="w-4 h-4" />
                          </Boton>
                        )}
                        {doc.estado === 'impreso' && (
                          <Boton variant="ghost" size="sm" title="Registrar entrega" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Boton>
                        )}
                      </div>
                    </CeldaTabla>
                  </FilaTabla>
                ))
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Mostrando {documents.length} documentos
        </div>
        <div className="flex gap-2">
          <Boton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Boton>
          <Boton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={documents.length < 20}
          >
            Siguiente
          </Boton>
        </div>
      </div>
    </div>
  );
}
