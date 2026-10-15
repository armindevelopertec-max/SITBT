'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarDocumentos } from '@/hooks/usarDocumentos';
import { api } from '@/lib/api';
import { Boton } from '@/components/ui/boton';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { ArrowLeft, FileText, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function PaginaEmitirDocumento() {
  const router = useRouter();
  const { generarBoleta, generarRecibo } = usarDocumentos();

  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [estudianteId, setEstudianteId] = useState<string>('');
  const [gestion, setGestion] = useState<string>(new Date().getFullYear().toString());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);

  const buscarEstudiantes = async () => {
    if (!busquedaEstudiante || busquedaEstudiante.length < 2) return;
    setBuscando(true);
    try {
      const respuesta = await api.get('/estudiantes', {
        params: { buscar: busquedaEstudiante, limite: 10 },
      });
      setEstudiantes(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busquedaEstudiante) buscarEstudiantes();
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaEstudiante]);

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoDocumento || !estudianteId) return;

    setCargando(true);
    setError(null);

    try {
      if (tipoDocumento === 'boleta_inscripcion') {
        await generarBoleta(parseInt(estudianteId), gestion);
      } else if (tipoDocumento === 'recibo_pago') {
        await generarRecibo(parseInt(estudianteId), gestion, 0);
      }
      router.push('/documentos');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al generar documento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/documentos">
          <Boton variante="fantasma" tamano="pequeno">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Boton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emitir Documento</h1>
          <p className="text-gray-500">Generar nuevo documento</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Tarjeta className="max-w-2xl">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Datos del documento
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <form onSubmit={enviarFormulario} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento *
              </label>
              <Selector
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Seleccionar tipo' },
                  { value: 'boleta_inscripcion', etiqueta: 'Boleta de Inscripción' },
                  { value: 'recibo_pago', etiqueta: 'Recibo de Pago' },
                  { value: 'carnet', etiqueta: 'Carnet de Estudiante' },
                  { value: 'certificado', etiqueta: 'Certificado' },
                  { value: 'constancia', etiqueta: 'Constancia' },
                ]}
                placeholder="Seleccionar tipo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar por nombre o CI..."
                  className="pl-10"
                  value={busquedaEstudiante}
                  onChange={(e) => {
                    setBusquedaEstudiante(e.target.value);
                    setEstudianteId('');
                  }}
                />
              </div>

              {estudiantes.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {estudiantes.map((estudiante) => (
                    <button
                      key={estudiante.id}
                      type="button"
                      onClick={() => {
                        setEstudianteId(estudiante.id.toString());
                        setBusquedaEstudiante(
                          `${estudiante.persona?.nombres} ${estudiante.persona?.apellidoPaterno} - ${estudiante.persona?.ci}`
                        );
                        setEstudiantes([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <p className="font-medium">
                        {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno} {estudiante.persona?.apellidoMaterno}
                      </p>
                      <p className="text-sm text-gray-500">
                        CI: {estudiante.persona?.ci} - Código: {estudiante.codigoInscripcion}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {estudianteId && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Estudiante seleccionado
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gestión *
              </label>
              <Selector
                value={gestion}
                onChange={(e) => setGestion(e.target.value)}
                opciones={[
                  { value: (new Date().getFullYear() - 1).toString(), etiqueta: (new Date().getFullYear() - 1).toString() },
                  { value: new Date().getFullYear().toString(), etiqueta: new Date().getFullYear().toString() },
                  { value: (new Date().getFullYear() + 1).toString(), etiqueta: (new Date().getFullYear() + 1).toString() },
                ]}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/documentos">
                <Boton variante="contorno" type="button">
                  Cancelar
                </Boton>
              </Link>
              <Boton type="submit" disabled={cargando || !tipoDocumento || !estudianteId}>
                {cargando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generar documento
              </Boton>
            </div>
          </form>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}
