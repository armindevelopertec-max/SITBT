'use client';

import { useEffect, useState } from 'react';
import { useDocuments, EmittedDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select } from '@/components/ui/select';
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
  const { loading, fetchDocuments, getStatistics } = useDocuments();
  const [documents, setDocuments] = useState<EmittedDocument[]>([]);
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
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Emitir documento
          </Button>
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select
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
            <Select
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Gestión</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay documentos
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.numeroDocumento}</TableCell>
                    <TableCell>
                      <Badge className={tipoLabels[doc.tipo]?.color}>
                        {tipoLabels[doc.tipo]?.label || doc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.estudiante
                        ? `${doc.estudiante.persona?.names} ${doc.estudiante.persona?.lastname_paternal}`
                        : `ID: ${doc.estudiante_id}`}
                    </TableCell>
                    <TableCell>{doc.gestion}</TableCell>
                    <TableCell>
                      {doc.fechaEmision
                        ? format(new Date(doc.fechaEmision), "d 'de' MMMM 'de' yyyy", { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoLabels[doc.estado]?.color}>
                        {estadoLabels[doc.estado]?.label || doc.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/documentos/${doc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {doc.estado !== 'entregado' && doc.estado !== 'anulado' && (
                          <Button variant="ghost" size="sm" title="Imprimir">
                            <Printer className="w-4 h-4" />
                          </Button>
                        )}
                        {doc.estado === 'impreso' && (
                          <Button variant="ghost" size="sm" title="Registrar entrega" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Mostrando {documents.length} documentos
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={documents.length < 20}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
