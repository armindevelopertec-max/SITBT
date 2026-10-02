import { useState } from 'react';
import { api } from '@/lib/api';

export interface EmittedDocument {
  id: string;
  estudiante_id: number;
  estudiante?: any;
  tipo: 'boleta_inscripcion' | 'recibo_pago' | 'carnet' | 'certificado' | 'constancia' | 'record_academico';
  numeroDocumento: string;
  gestion: string;
  gestion_id?: number;
  fechaEmision: string;
  pdfPath?: string;
  entregadoA?: string;
  fechaEntrega?: string;
  estado: 'generado' | 'impreso' | 'entregado' | 'anulado';
  observaciones?: string;
  created_at?: string;
}

export function useDocuments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (params?: {
    page?: number;
    limit?: number;
    tipo?: string;
    gestion?: string;
    estudianteId?: number;
    estado?: string;
  }): Promise<{ data: EmittedDocument[]; total: number }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/documents', { params });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener documentos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id: string): Promise<EmittedDocument> => {
    const response = await api.get<EmittedDocument>(`/documents/${id}`);
    return response.data;
  };

  const generateBoleta = async (estudianteId: number, gestion: string, gestionId?: number) => {
    const response = await api.post('/documents/generate-boleta', {
      estudianteId,
      gestion,
      gestionId,
    });
    return response.data;
  };

  const generateRecibo = async (estudianteId: number, gestion: string, paymentId: number, gestionId?: number) => {
    const response = await api.post('/documents/generate-recibo', {
      estudianteId,
      gestion,
      paymentId,
      gestionId,
    });
    return response.data;
  };

  const markAsPrinted = async (id: string, impresoPor: number) => {
    const response = await api.post(`/documents/${id}/print`, { impresoPor });
    return response.data;
  };

  const markAsDelivered = async (id: string, entregadoA: string) => {
    const response = await api.post(`/documents/${id}/deliver`, { entregadoA });
    return response.data;
  };

  const annulDocument = async (id: string, observaciones?: string) => {
    const response = await api.post(`/documents/${id}/annul`, { observaciones });
    return response.data;
  };

  const getStatistics = async (gestion?: string) => {
    const response = await api.get('/documents/statistics', { params: { gestion } });
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
