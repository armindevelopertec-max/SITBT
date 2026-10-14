import { useState } from 'react';
import { api } from '@/lib/api';

export interface DocumentoEmitido {
  id: string;
  estudianteId: number;
  estudiante?: any;
  tipo: 'boleta_inscripcion' | 'recibo_pago' | 'carnet' | 'certificado' | 'constancia' | 'record_academico';
  numeroDocumento: string;
  gestion: string;
  gestionId?: number;
  fechaEmision: string;
  rutaPdf?: string;
  entregadoA?: string;
  fechaEntrega?: string;
  estado: 'generado' | 'impreso' | 'entregado' | 'anulado';
  observaciones?: string;
  creadoEn?: string;
}

export function usarDocumentos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (params?: {
    pagina?: number;
    limite?: number;
    tipo?: string;
    gestion?: string;
    estudianteId?: number;
    estado?: string;
  }): Promise<{ datos: DocumentoEmitido[]; total: number }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/documentos', { params });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al obtener documentos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id: string): Promise<DocumentoEmitido> => {
    const response = await api.get<DocumentoEmitido>(`/documentos/${id}`);
    return response.data;
  };

  const generateBoleta = async (estudianteId: number, gestion: string, gestionId?: number) => {
    const response = await api.post('/documentos/generar-boleta', {
      estudianteId,
      gestion,
      gestionId,
    });
    return response.data;
  };

  const generateRecibo = async (estudianteId: number, gestion: string, paymentId: number, gestionId?: number) => {
    const response = await api.post('/documentos/generar-recibo', {
      estudianteId,
      gestion,
      paymentId,
      gestionId,
    });
    return response.data;
  };

  const markAsPrinted = async (id: string, impresoPor: number) => {
    const response = await api.post(`/documentos/${id}/imprimir`, { impresoPor });
    return response.data;
  };

  const markAsDelivered = async (id: string, entregadoA: string) => {
    const response = await api.post(`/documentos/${id}/entregar`, { entregadoA });
    return response.data;
  };

  const annulDocument = async (id: string, observaciones?: string) => {
    const response = await api.post(`/documentos/${id}/anular`, { observaciones });
    return response.data;
  };

  const getStatistics = async (gestion?: string) => {
    const response = await api.get('/documentos/estadisticas', { params: { gestion } });
    return response.data;
  };

  return {
    loading,
    error,
    fetchDocuments,
    getDocument,
    generateBoleta,
    generateRecibo,
    markAsPrinted,
    markAsDelivered,
    annulDocument,
    getStatistics,
  };
}
