'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Loader2, Search, X } from 'lucide-react';

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  estado: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  carrera?: {
    nombre: string;
  };
}

interface DatosFormulario {
  estudianteId: number | null;
  gestion: string;
  gestionId: number | null;
  semestre: number | null;
  fechaEmision: string;
  validoHasta: string;
  fotoUrl: string;
  notas: string;
}

interface Gestion {
  id: number;
  anio: string;
  tipoPeriodo: string;
  estado: string;
  esActual: boolean;
  periodos?: { id: number; numero: string; nombre: string }[];
}

export default function PaginaNuevaCredencial() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datosFormulario, setDatosFormulario] = useState<DatosFormulario>({
    estudianteId: null,
    gestion: new Date().getFullYear().toString(),
    gestionId: null,
    semestre: null,
    fechaEmision: new Date().toISOString().split('T')[0],
    validoHasta: `${new Date().getFullYear()}-12-31`,
    fotoUrl: '',
    notas: '',
  });

  const [gestiones, setGestiones] = useState<Gestion[]>([]);

  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  useEffect(() => {
    obtenerEstudiantes();
    obtenerGestiones();
  }, []);

  const obtenerEstudiantes = async () => {
    try {
      setCargandoEstudiantes(true);
      const respuesta = await api.get('/estudiantes', { params: { limite: 100 } });
      setEstudiantes(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  const obtenerGestiones = async () => {
    try {
      const respuesta = await api.get('/gestiones');
      const datos = respuesta.data.datos || respuesta.data || [];
      setGestiones(datos);
      const gestionActual = datos.find((g: Gestion) => g.esActual);
      if (gestionActual) {
        setDatosFormulario(prev => ({ ...prev, gestion: gestionActual.anio, gestionId: gestionActual.id }));
      }
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
    }
  };

  const estudiantesFiltrados = useMemo(() => {
    if (!busquedaEstudiante.trim()) return estudiantes.slice(0, 10);
    const q = busquedaEstudiante.toLowerCase();
    return estudiantes.filter((estudiante) => {
      const persona = estudiante.persona;
      if (!persona) return false;
      const nombreCompleto = `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase();
      return nombreCompleto.includes(q) || (persona.ci || '').includes(q) || estudiante.codigoInscripcion.toLowerCase().includes(q);
    }).slice(0, 10);
  }, [estudiantes, busquedaEstudiante]);

  const seleccionarEstudiante = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setDatosFormulario({ ...datosFormulario, estudianteId: estudiante.id });
    setBusquedaEstudiante('');
    setErrores({ ...errores, estudianteId: '' });
  };

  const deseleccionarEstudiante = () => {
    setEstudianteSeleccionado(null);
    setDatosFormulario({ ...datosFormulario, estudianteId: null });
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!datosFormulario.estudianteId) nuevosErrores.estudianteId = 'Debe seleccionar un estudiante';
    if (!datosFormulario.gestion) nuevosErrores.gestion = 'La gestión es requerida';
    if (!datosFormulario.semestre) nuevosErrores.semestre = 'El semestre es requerido';
    if (!datosFormulario.fechaEmision) nuevosErrores.fechaEmision = 'La fecha de emisión es requerida';
    if (!datosFormulario.validoHasta) nuevosErrores.validoHasta = 'La fecha de validez es requerida';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setCargando(true);
    try {
      const cuerpo = {
        estudianteId: datosFormulario.estudianteId,
        gestion: datosFormulario.gestion,
        gestionId: datosFormulario.gestionId,
        semestre: datosFormulario.semestre,
        fechaEmision: datosFormulario.fechaEmision,
        validoHasta: datosFormulario.validoHasta,
        fotoUrl: datosFormulario.fotoUrl || undefined,
        estado: 'emitida',
        emitidoPor: 1,
        impreso: false,
        notas: datosFormulario.notas || undefined,
      };

      await api.post('/credenciales', cuerpo);
      router.push('/credenciales');
    } catch (error: any) {
      console.error('Error al crear la credencial:', error);
      if (error.response?.data?.mensaje) {
        setErrores({ submit: error.response.data.mensaje });
      } else {
        setErrores({ submit: 'Error al crear la credencial' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Credenciales', href: '/credenciales' },
          { etiqueta: 'Nueva Credencial' }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Credencial</h1>
      </div>

      <form onSubmit={enviarFormulario} className="space-y-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Seleccionar Estudiante</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            {estudianteSeleccionado ? (
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {estudianteSeleccionado.persona?.nombres?.charAt(0) || '?'}{estudianteSeleccionado.persona?.apellidoPaterno?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {estudianteSeleccionado.persona?.nombres} {estudianteSeleccionado.persona?.apellidoPaterno} {estudianteSeleccionado.persona?.apellidoMaterno}
                    </p>
                    <p className="text-sm text-gray-500">
                      {estudianteSeleccionado.persona?.ci} · {estudianteSeleccionado.codigoInscripcion}
                    </p>
                    <p className="text-sm text-gray-500">{estudianteSeleccionado.carrera?.nombre || 'Sin carrera'}</p>
                  </div>
                </div>
                <Boton type="button" variante="fantasma" tamano="icono" onClick={deseleccionarEstudiante}>
                  <X className="w-4 h-4" />
                </Boton>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Entrada
                    placeholder="Buscar estudiante por nombre, CI o código..."
                    className="pl-10"
                    value={busquedaEstudiante}
                    onChange={(e) => setBusquedaEstudiante(e.target.value)}
                  />
                </div>
                {errores.estudianteId && <p className="text-sm text-red-600 mt-1">{errores.estudianteId}</p>}

                {busquedaEstudiante && (
                  <div className="mt-2 border rounded-lg overflow-hidden shadow-lg">
                    {cargandoEstudiantes ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Buscando...
                      </div>
                    ) : estudiantesFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No se encontraron estudiantes
                      </div>
                    ) : (
                      estudiantesFiltrados.map((estudiante) => (
                        <div
                          key={estudiante.id}
                          onClick={() => seleccionarEstudiante(estudiante)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {estudiante.persona?.nombres?.charAt(0) || '?'}{estudiante.persona?.apellidoPaterno?.charAt(0) || ''}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno} {estudiante.persona?.apellidoMaterno}
                            </p>
                            <p className="text-xs text-gray-500">{estudiante.codigoInscripcion}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Datos de la Credencial</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestión *
                </label>
<select
                  className={`w-full h-10 px-3 border rounded-lg text-sm ${errores.gestion ? 'border-red-500' : ''}`}
                  value={datosFormulario.gestion ? `${datosFormulario.gestion}-${datosFormulario.semestre}` : ''}
                  onChange={(e) => {
                    const [anio, sem] = e.target.value.split('-');
                    const semestre = parseInt(sem) || null;
                    setDatosFormulario(prev => ({ ...prev, gestion: anio, semestre }));
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {gestiones.flatMap((gestion) =>
                    (gestion.periodos || []).map((periodo: any) => (
                      <option key={`${gestion.id}-${periodo.numero}`} value={`${gestion.anio}-${periodo.numero === 'I' ? 1 : 2}`}>
                        {periodo.numero}/{gestion.anio}
                      </option>
                    ))
                  )}
                </select>
                {errores.gestion && <p className="text-sm text-red-600 mt-1">{errores.gestion}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semestre *
                </label>
                <select
                  className={`w-full h-10 px-3 border rounded-lg text-sm ${errores.semestre ? 'border-red-500' : ''}`}
                  value={datosFormulario.semestre || ''}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, semestre: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">1° Semestre</option>
                  <option value="2">2° Semestre</option>
                  <option value="3">3° Semestre</option>
                  <option value="4">4° Semestre</option>
                  <option value="5">5° Semestre</option>
                  <option value="6">6° Semestre</option>
                </select>
                {errores.semestre && <p className="text-sm text-red-600 mt-1">{errores.semestre}</p>}
              </div>
              <div>
                <Entrada
                  etiqueta="Fecha de Emisión *"
                  type="date"
                  value={datosFormulario.fechaEmision}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, fechaEmision: e.target.value })}
                  error={errores.fechaEmision}
                />
              </div>
              <div>
                <Entrada
                  etiqueta="Válida Hasta *"
                  type="date"
                  value={datosFormulario.validoHasta}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, validoHasta: e.target.value })}
                  error={errores.validoHasta}
                />
              </div>
            </div>

            <div>
              <Entrada
                etiqueta="URL de Foto"
                value={datosFormulario.fotoUrl}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, fotoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                className="w-full h-20 px-3 py-2 border rounded-lg text-sm"
                value={datosFormulario.notas}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        {errores.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errores.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Boton variante="contorno" type="button" onClick={() => router.back()}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={cargando}>
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Credencial
              </>
            )}
          </Boton>
        </div>
      </form>
    </div>
  );
}
