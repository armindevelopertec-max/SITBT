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

const etiquetasTipo: Record<string, { etiqueta: string; color: string }> = {
  boleta_inscripcion: { etiqueta: 'Boleta Inscripción', color: 'bg-blue-100 text-blue-800' },
  recibo_pago: { etiqueta: 'Recibo Pago', color: 'bg-green-100 text-green-800' },
  carnet: { etiqueta: 'Carnet', color: 'bg-purple-100 text-purple-800' },
  certificado: { etiqueta: 'Certificado', color: 'bg-yellow-100 text-yellow-800' },
  constancia: { etiqueta: 'Constancia', color: 'bg-cyan-100 text-cyan-800' },
  record_academico: { etiqueta: 'Record Académico', color: 'bg-orange-100 text-orange-800' },
};

const etiquetasEstado: Record<string, { etiqueta: string; color: string }> = {
  generado: { etiqueta: 'Generado', color: 'bg-gray-100 text-gray-800' },
  impreso: { etiqueta: 'Impreso', color: 'bg-blue-100 text-blue-800' },
  entregado: { etiqueta: 'Entregado', color: 'bg-green-100 text-green-800' },
  anulado: { etiqueta: 'Anulado', color: 'bg-red-100 text-red-800' },
};

export default function PaginaDocumentos() {
  const { cargando, obtenerDocumentos, obtenerEstadisticas } = usarDocumentos();
  const [documentos, setDocumentos] = useState<DocumentoEmitido[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => {
    obtenerDocumentos({
      pagina: pagina,
      limite: 20,
      tipo: filtroTipo || undefined,
      estado: filtroEstado || undefined,
    }).then((resultado) => {
      setDocumentos(resultado.datos);
      setTotal(resultado.total);
    }).catch(console.error);
  }, [pagina, filtroTipo, filtroEstado]);

  useEffect(() => {
    obtenerEstadisticas().then(setEstadisticas).catch(console.error);
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
      {estadisticas && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{estadisticas.total || 0}</div>
            <div className="text-sm text-gray-500">Total documentos</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'boleta_inscripcion')?.cantidad || 0}
            </div>
            <div className="text-sm text-blue-600">Boletas</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'recibo_pago')?.cantidad || 0}
            </div>
            <div className="text-sm text-green-600">Recibos</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'carnet')?.cantidad || 0}
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
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Todos los tipos' },
                { value: 'boleta_inscripcion', etiqueta: 'Boleta Inscripción' },
                { value: 'recibo_pago', etiqueta: 'Recibo Pago' },
                { value: 'carnet', etiqueta: 'Carnet' },
                { value: 'certificado', etiqueta: 'Certificado' },
              ]}
              placeholder="Tipo de documento"
            />
            <Selector
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Todos' },
                { value: 'generado', etiqueta: 'Generado' },
                { value: 'impreso', etiqueta: 'Impreso' },
                { value: 'entregado', etiqueta: 'Entregado' },
                { value: 'anulado', etiqueta: 'Anulado' },
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
              {cargando ? (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8">
                    Cargando...
                  </CeldaTabla>
                </FilaTabla>
              ) : documentos.length === 0 ? (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                    No hay documentos
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                documentos.map((documento) => (
                  <FilaTabla key={documento.id}>
                    <CeldaTabla className="font-medium">{documento.numeroDocumento}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia className={etiquetasTipo[documento.tipo]?.color}>
                        {etiquetasTipo[documento.tipo]?.etiqueta || documento.tipo}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      {documento.estudiante
                        ? `${documento.estudiante.persona?.nombres} ${documento.estudiante.persona?.apellidoPaterno}`
                        : `ID: ${documento.estudianteId}`}
                    </CeldaTabla>
                    <CeldaTabla>{documento.gestion}</CeldaTabla>
                    <CeldaTabla>
                      {documento.fechaEmision
                        ? format(new Date(documento.fechaEmision), "d 'de' MMMM 'de' yyyy", { locale: es })
                        : '-'}
                    </CeldaTabla>
                    <CeldaTabla>
                      <Insignia className={etiquetasEstado[documento.estado]?.color}>
                        {etiquetasEstado[documento.estado]?.etiqueta || documento.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/documentos/${documento.id}`}>
                          <Boton variante="fantasma" tamano="pequeno">
                            <Eye className="w-4 h-4" />
                          </Boton>
                        </Link>
                        {documento.estado !== 'entregado' && documento.estado !== 'anulado' && (
                          <Boton variante="fantasma" tamano="pequeno" title="Imprimir">
                            <Printer className="w-4 h-4" />
                          </Boton>
                        )}
                        {documento.estado === 'impreso' && (
                          <Boton variante="fantasma" tamano="pequeno" title="Registrar entrega" className="text-green-600">
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
          Mostrando {documentos.length} documentos
        </div>
        <div className="flex gap-2">
          <Boton
            variante="contorno"
            tamano="pequeno"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </Boton>
          <Boton
            variante="contorno"
            tamano="pequeno"
            onClick={() => setPagina((p) => p + 1)}
            disabled={documentos.length < 20}
          >
            Siguiente
          </Boton>
        </div>
      </div>
    </div>
  );
}
