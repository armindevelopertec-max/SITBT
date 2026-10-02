'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocuments, EmittedDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, CheckCircle, XCircle, FileText, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoLabels: Record<string, string> = {
  boleta_inscripcion: 'Boleta de Inscripción',
  recibo_pago: 'Recibo de Pago',
  carnet: 'Carnet de Estudiante',
  certificado: 'Certificado',
  constancia: 'Constancia',
  record_academico: 'Record Académico',
};

const estadoLabels: Record<string, { label: string; color: string }> = {
  generado: { label: 'Generado', color: 'bg-gray-100 text-gray-800' },
  impreso: { label: 'Impreso', color: 'bg-blue-100 text-blue-800' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  anulado: { label: 'Anulado', color: 'bg-red-100 text-red-800' },
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getDocument, markAsPrinted, markAsDelivered, annulDocument } = useDocuments();

  const [document, setDocument] = useState<EmittedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDocument(params.id as string);
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [params.id]);

  const handlePrint = async () => {
    if (!document) return;
    setActionLoading(true);
    try {
      const updated = await markAsPrinted(document.id, 1);
      setDocument(updated);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!document) return;
    const entregadoA = prompt('Nombre de quien recibe:');
    if (!entregadoA) return;
    setActionLoading(true);
    try {
      const updated = await markAsDelivered(document.id, entregadoA);
      setDocument(updated);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnul = async () => {
    if (!document) return;
    const observaciones = prompt('Motivo de anulación:');
    if (!observaciones) return;
    setActionLoading(true);
    try {
      const updated = await annulDocument(document.id, observaciones);
      setDocument(updated);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">Documento no encontrado</p>
      </div>
    );
  }

  const estado = estadoLabels[document.estado];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/documentos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Documento</h1>
          <p className="text-gray-500">ID: {document.id.slice(0, 8)}...</p>
        </div>
        <Badge className={estado?.color}>
          {estado?.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {tipoLabels[document.tipo] || document.tipo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número de documento</p>
                  <p className="font-semibold">{document.numeroDocumento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gestión</p>
                  <p className="font-semibold">{document.gestion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de emisión</p>
                  <p className="font-semibold">
                    {document.fechaEmision
                      ? format(new Date(document.fechaEmision), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold">{tipoLabels[document.tipo] || document.tipo}</p>
                </div>
              </div>

              {document.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="font-medium">{document.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {document.estudiante && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {document.estudiante.persona?.names}{' '}
                  {document.estudiante.persona?.lastname_paternal}{' '}
                  {document.estudiante.persona?.lastname_maternal}
                </p>
                <p className="text-sm text-gray-500">
                  {document.estudiante.persona?.ci}
                </p>
                <p className="text-sm text-gray-500">
                  Código: {document.estudiante.inscription_code}
                </p>
              </CardContent>
            </Card>
          )}

          {document.fechaEntrega && (
            <Card>
              <CardHeader>
                <CardTitle>Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Entregado a: {document.entregadoA}</p>
                <p className="text-sm text-gray-500">
                  Fecha: {format(new Date(document.fechaEntrega), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.estado === 'generado' && (
                <Button
                  className="w-full"
                  onClick={handlePrint}
                  disabled={actionLoading}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Marcar como impreso
                </Button>
              )}

              {document.estado === 'impreso' && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleDeliver}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registrar entrega
                </Button>
              )}

              {(document.estado === 'generado' || document.estado === 'impreso') && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleAnnul}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Anular documento
                </Button>
              )}

              <Button variant="outline" className="w-full" disabled={!document.pdfPath}>
                <FileText className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
