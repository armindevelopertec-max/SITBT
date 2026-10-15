import { useState } from 'react';
import { api } from '@/libreria/api';

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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerDocumentos = async (parametros?: {
    pagina?: number;
    limite?: number;
    tipo?: string;
    gestion?: string;
    estudianteId?: number;
    estado?: string;
  }): Promise<{ datos: DocumentoEmitido[]; total: number }> => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get('/documentos', { params: parametros });
      return respuesta.data;
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al obtener documentos');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const obtenerDocumento = async (id: string): Promise<DocumentoEmitido> => {
    const respuesta = await api.get<DocumentoEmitido>(`/documentos/${id}`);
    return respuesta.data;
  };

  const generarBoleta = async (estudianteId: number, gestion: string, gestionId?: number) => {
    const respuesta = await api.post('/documentos/generar-boleta', {
      estudianteId,
      gestion,
      gestionId,
    });
    return respuesta.data;
  };

  const generarRecibo = async (estudianteId: number, gestion: string, pagoId: number, gestionId?: number) => {
    const respuesta = await api.post('/documentos/generar-recibo', {
      estudianteId,
      gestion,
      paymentId: pagoId,
      gestionId,
    });
    return respuesta.data;
  };

  const marcarComoImpreso = async (id: string, impresoPor: number) => {
    const respuesta = await api.post(`/documentos/${id}/imprimir`, { impresoPor });
    return respuesta.data;
  };

  const marcarComoEntregado = async (id: string, entregadoA: string) => {
    const respuesta = await api.post(`/documentos/${id}/entregar`, { entregadoA });
    return respuesta.data;
  };

  const anularDocumento = async (id: string, observaciones?: string) => {
    const respuesta = await api.post(`/documentos/${id}/anular`, { observaciones });
    return respuesta.data;
  };

  const obtenerEstadisticas = async (gestion?: string) => {
    const respuesta = await api.get('/documentos/estadisticas', { params: { gestion } });
    return respuesta.data;
  };

  return {
    cargando,
    error,
    obtenerDocumentos,
    obtenerDocumento,
    generarBoleta,
    generarRecibo,
    marcarComoImpreso,
    marcarComoEntregado,
    anularDocumento,
    obtenerEstadisticas,
  };
}
