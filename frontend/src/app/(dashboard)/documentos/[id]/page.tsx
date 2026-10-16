'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usarDocumentos, DocumentoEmitido } from '@/ganchos/usarDocumentos';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { ArrowLeft, Printer, CheckCircle, XCircle, FileText, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const etiquetasTipo: Record<string, string> = {
  boleta_inscripcion: 'Boleta de Inscripción',
  recibo_pago: 'Recibo de Pago',
  carnet: 'Carnet de Estudiante',
  certificado: 'Certificado',
  constancia: 'Constancia',
  record_academico: 'Record Académico',
};

const etiquetasEstado: Record<string, { etiqueta: string; color: string }> = {
  generado: { etiqueta: 'Generado', color: 'bg-gray-100 text-gray-800' },
  impreso: { etiqueta: 'Impreso', color: 'bg-blue-100 text-blue-800' },
  entregado: { etiqueta: 'Entregado', color: 'bg-green-100 text-green-800' },
  anulado: { etiqueta: 'Anulado', color: 'bg-red-100 text-red-800' },
};

export default function PaginaDetalleDocumento() {
  const parametros = useParams();
  const router = useRouter();
  const { obtenerDocumento, marcarComoImpreso, marcarComoEntregado, anularDocumento } = usarDocumentos();

  const [documento, setDocumento] = useState<DocumentoEmitido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  useEffect(() => {
    const cargarDocumento = async () => {
      try {
        const datos = await obtenerDocumento(parametros.id as string);
        setDocumento(datos);
      } catch (error) {
        console.error('Error al obtener el documento:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarDocumento();
  }, [parametros.id]);

  const imprimir = async () => {
    if (!documento) return;
    setCargandoAccion(true);
    try {
      const actualizado = await marcarComoImpreso(documento.id, 1);
      setDocumento(actualizado);
    } catch (error) {
      console.error('Error al marcar como impreso:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al marcar como impreso'));
      }).catch(() => {
        alert('Error al marcar como impreso');
      });
    } finally {
      setCargandoAccion(false);
    }
  };

  const entregar = async () => {
    if (!documento) return;
    const entregadoA = prompt('Nombre de quien recibe:');
    if (!entregadoA) return;
    setCargandoAccion(true);
    try {
      const actualizado = await marcarComoEntregado(documento.id, entregadoA);
      setDocumento(actualizado);
    } catch (error) {
      console.error('Error al registrar la entrega:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al registrar la entrega'));
      }).catch(() => {
        alert('Error al registrar la entrega');
      });
    } finally {
      setCargandoAccion(false);
    }
  };

  const anular = async () => {
    if (!documento) return;
    const observaciones = prompt('Motivo de anulación:');
    if (!observaciones) return;
    setCargandoAccion(true);
    try {
      const actualizado = await anularDocumento(documento.id, observaciones);
      setDocumento(actualizado);
    } catch (error) {
      console.error('Error al anular el documento:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al anular el documento'));
      }).catch(() => {
        alert('Error al anular el documento');
      });
    } finally {
      setCargandoAccion(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">Documento no encontrado</p>
      </div>
    );
  }

  const estado = etiquetasEstado[documento.estado];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/documentos">
          <Boton variante="fantasma" tamano="pequeno">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Boton>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Documento</h1>
          <p className="text-gray-500">ID: {documento.id.slice(0, 8)}...</p>
        </div>
        <Insignia className={estado?.color}>
          {estado?.etiqueta}
        </Insignia>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tarjeta>
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {etiquetasTipo[documento.tipo] || documento.tipo}
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número de documento</p>
                  <p className="font-semibold">{documento.numeroDocumento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gestión</p>
                  <p className="font-semibold">{documento.gestion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de emisión</p>
                  <p className="font-semibold">
                    {documento.fechaEmision
                      ? format(new Date(documento.fechaEmision), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold">{etiquetasTipo[documento.tipo] || documento.tipo}</p>
                </div>
              </div>

              {documento.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="font-medium">{documento.observaciones}</p>
                </div>
              )}
            </ContenidoTarjeta>
          </Tarjeta>

          {documento.estudiante && (
            <Tarjeta>
              <EncabezadoTarjeta>
                <TituloTarjeta className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Estudiante
                </TituloTarjeta>
              </EncabezadoTarjeta>
              <ContenidoTarjeta>
                <p className="font-medium">
                  {documento.estudiante.persona?.nombres}{' '}
                  {documento.estudiante.persona?.apellidoPaterno}{' '}
                  {documento.estudiante.persona?.apellidoMaterno}
                </p>
                <p className="text-sm text-gray-500">
                  {documento.estudiante.persona?.ci}
                </p>
                <p className="text-sm text-gray-500">
                  Código: {documento.estudiante.codigoInscripcion}
                </p>
              </ContenidoTarjeta>
            </Tarjeta>
          )}

          {documento.fechaEntrega && (
            <Tarjeta>
              <EncabezadoTarjeta>
                <TituloTarjeta>Entrega</TituloTarjeta>
              </EncabezadoTarjeta>
              <ContenidoTarjeta>
                <p className="font-medium">Entregado a: {documento.entregadoA}</p>
                <p className="text-sm text-gray-500">
                  Fecha: {format(new Date(documento.fechaEntrega), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es })}
                </p>
              </ContenidoTarjeta>
            </Tarjeta>
          )}
        </div>

        <div>
          <Tarjeta>
            <EncabezadoTarjeta>
              <TituloTarjeta>Acciones</TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="space-y-3">
              {documento.estado === 'generado' && (
                <Boton
                  className="w-full"
                  onClick={imprimir}
                  disabled={cargandoAccion}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Marcar como impreso
                </Boton>
              )}

              {documento.estado === 'impreso' && (
                <Boton
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={entregar}
                  disabled={cargandoAccion}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registrar entrega
                </Boton>
              )}

              {(documento.estado === 'generado' || documento.estado === 'impreso') && (
                <Boton
                  variante="destructivo"
                  className="w-full"
                  onClick={anular}
                  disabled={cargandoAccion}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Anular documento
                </Boton>
              )}

              <Boton variante="contorno" className="w-full" disabled={!documento.rutaPdf}>
                <FileText className="w-4 h-4 mr-2" />
                Descargar PDF
              </Boton>
            </ContenidoTarjeta>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
