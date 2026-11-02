'use client';

import { useEffect, useState } from 'react';
import { usarDocumentos, DocumentoEmitido } from '@/ganchos/usarDocumentos';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import { CampoFiltro } from '@/componentes/iu/barra-filtros';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import {
  Tabla,
  CuerpoTabla,
  CeldaTabla,
  CeldaEncabezado,
  EncabezadoTabla,
  FilaTabla,
} from '@/componentes/iu/tabla';
import { Selector } from '@/componentes/iu/selector';
import { FileText, Eye, Printer, CheckCircle, XCircle, Plus, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const etiquetasTipo: Record<string, { etiqueta: string; color: string }> = {
  boleta_inscripcion: { etiqueta: 'Boleta Inscripción', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  recibo_pago: { etiqueta: 'Recibo Pago', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  carnet: { etiqueta: 'Carnet', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200' },
  certificado: { etiqueta: 'Certificado', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
  constancia: { etiqueta: 'Constancia', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200' },
  record_academico: { etiqueta: 'Record Académico', color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200' },
};

const etiquetasEstado: Record<string, { etiqueta: string; color: string }> = {
  generado: { etiqueta: 'Generado', color: 'bg-muted text-foreground' },
  impreso: { etiqueta: 'Impreso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
  entregado: { etiqueta: 'Entregado', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
  anulado: { etiqueta: 'Anulado', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
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
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground">Gestión de documentos emitidos</p>
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
          <div className="bg-card rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-foreground">{estadisticas.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total documentos</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'boleta_inscripcion')?.cantidad || 0}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Boletas</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'recibo_pago')?.cantidad || 0}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Recibos</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticas.porTipo?.find((elemento: any) => elemento.tipo === 'carnet')?.cantidad || 0}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Carnets</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Tarjeta className="mb-6">
        <ContenidoTarjeta className="pt-6">
          <div className="flex flex-wrap gap-4">
            <CampoFiltro
              etiqueta="Tipo de documento"
              value={filtroTipo}
              onChange={setFiltroTipo}
              placeholder="Todos los tipos"
              className="w-full sm:w-56"
              opciones={[
                { value: 'boleta_inscripcion', etiqueta: 'Boleta Inscripción' },
                { value: 'recibo_pago', etiqueta: 'Recibo Pago' },
                { value: 'carnet', etiqueta: 'Carnet' },
                { value: 'certificado', etiqueta: 'Certificado' },
              ]}
            />
            <CampoFiltro
              etiqueta="Estado"
              value={filtroEstado}
              onChange={setFiltroEstado}
              placeholder="Todos"
              className="w-full sm:w-48"
              opciones={[
                { value: 'generado', etiqueta: 'Generado' },
                { value: 'impreso', etiqueta: 'Impreso' },
                { value: 'entregado', etiqueta: 'Entregado' },
                { value: 'anulado', etiqueta: 'Anulado' },
              ]}
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
                  <CeldaTabla colSpan={7} className="text-center py-8 text-muted-foreground">
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
                          <Boton variante="fantasma" tamano="pequeno" title="Registrar entrega" className="text-green-600 dark:text-green-400">
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
        <div className="text-sm text-muted-foreground">
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
