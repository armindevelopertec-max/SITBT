'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/libreria/api';
import { usarConfiguracionInstitucional } from '@/ganchos/usarConfiguracionInstitucional';
import { Boton } from '@/componentes/iu/boton';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';

interface FilaActa {
  inscripcionMateriaId: number;
  estudianteId: number;
  estadoInscripcion: string;
  estudiante?: {
    codigoInscripcion?: string;
    persona?: {
      nombres?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string;
      ci?: string;
    };
  };
  calificacion: {
    parcial1?: number | null;
    parcial1Estado?: string;
    parcial2?: number | null;
    parcial2Estado?: string;
    promedioFinal?: number | null;
    observacion?: string | null;
    notaSegundaTurno?: number | null;
    estado2T?: string | null;
    notaDefinitiva?: number | null;
  } | null;
}

interface LibroActa {
  materiaImpartida: {
    materia?: { codigo?: string; nombre?: string };
    grupo?: {
      codigo?: string;
      semestre?: number;
      paralelo?: string;
      carrera?: { nombre?: string };
      turno?: { nombre?: string };
      periodo?: { numero?: string };
    };
    gestion: string;
    docente?: { persona?: { nombres?: string; apellidoPaterno?: string; apellidoMaterno?: string } };
  };
  libro: { estado: string };
  filas: FilaActa[];
}

const ETIQUETAS_ESTADO_LIBRO: Record<string, string> = {
  sin_iniciar: 'Sin iniciar',
  borrador: 'Sin iniciar',
  en_registro: 'En registro',
  pendiente_revision: 'Pendiente de revisión',
  cerrado: 'Cerrado',
  reabierto: 'Reabierto',
};

const ETIQUETAS_OBSERVACION: Record<string, string> = {
  aprobo: 'APROBÓ',
  reprobo: 'REPROBÓ',
  no_se_presento: 'NO SE PRESENTÓ',
  puede_ir_2t: 'PUEDE IR A 2T',
  pendiente: 'PENDIENTE',
};

const nombrePersona = (persona?: { nombres?: string; apellidoPaterno?: string; apellidoMaterno?: string } | null) => {
  if (!persona) return '—';
  const { nombres, apellidoPaterno, apellidoMaterno } = persona;
  return [apellidoPaterno, apellidoMaterno, nombres].filter(Boolean).join(' ');
};

const textoNota = (valor: number | null | undefined, estado?: string): string => {
  if (valor != null) return String(valor);
  if (estado === 'ausente') return 'AUS';
  if (estado === 'justificado') return 'JUS';
  return '—';
};

export default function PaginaActaMateriaImpartida() {
  const parametros = useParams();
  const router = useRouter();
  const materiaImpartidaId = parametros.id as string;
  const { configuracion } = usarConfiguracionInstitucional();

  const [datos, setDatos] = useState<LibroActa | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const respuesta = await api.get(`/materias-impartidas/${materiaImpartidaId}/libro`);
        setDatos(respuesta.data);
      } catch (err) {
        console.error('Error al cargar el acta:', err);
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [materiaImpartidaId]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-600">No se pudo cargar el acta de calificaciones.</p>
        <Boton variante="contorno" onClick={() => router.back()}>
          Volver
        </Boton>
      </div>
    );
  }

  const { materiaImpartida, libro, filas } = datos;
  const grupo = materiaImpartida.grupo;
  const visibles = filas.filter((f) => f.estadoInscripcion !== 'retirado');

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <div className="mx-auto max-w-6xl p-4 sm:p-8 print:p-0">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Boton variante="contorno" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Boton>
          <Boton onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Boton>
        </div>

        <div className="bg-white p-8 shadow print:shadow-none">
          <header className="border-b-2 border-gray-800 pb-4 text-center">
            {configuracion?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={configuracion.logoUrl} alt="Logo" className="mx-auto mb-2 h-16 object-contain" />
            )}
            <h1 className="text-lg font-bold uppercase tracking-wide">
              {configuracion?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
            </h1>
            <p className="text-sm font-semibold uppercase mt-1">Libro de Calificaciones</p>
          </header>

          <section className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p><span className="font-semibold">Carrera:</span> {grupo?.carrera?.nombre || '—'}</p>
            <p><span className="font-semibold">Asignatura:</span> [{materiaImpartida.materia?.codigo}] {materiaImpartida.materia?.nombre}</p>
            <p><span className="font-semibold">Grupo:</span> {grupo?.codigo || '—'}</p>
            <p><span className="font-semibold">Semestre / Paralelo:</span> {grupo?.semestre}.º · {grupo?.paralelo || '—'}</p>
            <p><span className="font-semibold">Turno:</span> {grupo?.turno?.nombre || '—'}</p>
            <p><span className="font-semibold">Gestión / Periodo:</span> {materiaImpartida.gestion} {grupo?.periodo?.numero ? `· Periodo ${grupo.periodo.numero}` : ''}</p>
            <p><span className="font-semibold">Docente:</span> {nombrePersona(materiaImpartida.docente?.persona)}</p>
            <p><span className="font-semibold">Estado del libro:</span> {ETIQUETAS_ESTADO_LIBRO[libro.estado] || libro.estado}</p>
          </section>

          <table className="mt-6 w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-400 px-2 py-1 text-center w-8">N.º</th>
                <th className="border border-gray-400 px-2 py-1 text-left">Apellidos y Nombres</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-24">C.I.</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-16">1.er Parcial</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-16">2.º Parcial</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-20">Promedio Semestral</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-16">2.º Turno</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-16">Nota Final</th>
                <th className="border border-gray-400 px-2 py-1 text-center w-28">Observación</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-400 px-2 py-6 text-center text-gray-500">
                    No hay estudiantes inscritos.
                  </td>
                </tr>
              ) : (
                visibles.map((fila, indice) => {
                  const c = fila.calificacion;
                  return (
                    <tr key={fila.inscripcionMateriaId}>
                      <td className="border border-gray-400 px-2 py-1 text-center">{indice + 1}</td>
                      <td className="border border-gray-400 px-2 py-1">{nombrePersona(fila.estudiante?.persona)}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center">{fila.estudiante?.persona?.ci || '—'}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center">{textoNota(c?.parcial1, c?.parcial1Estado)}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center">{textoNota(c?.parcial2, c?.parcial2Estado)}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center font-semibold">{c?.promedioFinal ?? '—'}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center">
                        {c?.notaSegundaTurno != null
                          ? c.notaSegundaTurno
                          : c?.estado2T === 'habilitado'
                            ? 'HAB'
                            : c?.estado2T === 'ausente'
                              ? 'AUS'
                              : '—'}
                      </td>
                      <td className="border border-gray-400 px-2 py-1 text-center font-semibold">{c?.notaDefinitiva ?? '—'}</td>
                      <td className="border border-gray-400 px-2 py-1 text-center">
                        {ETIQUETAS_OBSERVACION[c?.observacion || 'pendiente'] || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <p className="mt-3 text-[11px] text-gray-600">
            Escala: 61 o más aprueba; 40 a 60 puede ir a segundo turno; menos de 40 reprueba. AUS = ausente; JUS =
            justificado. La nota del segundo turno reemplaza al promedio semestral cuando corresponde.
          </p>

          <footer className="mt-16 grid grid-cols-2 gap-16 text-center text-sm">
            <div className="border-t border-gray-800 pt-1">Docente</div>
            <div className="border-t border-gray-800 pt-1">Dirección Académica</div>
          </footer>

          <p className="mt-6 text-right text-[11px] text-gray-500">
            Generado el {new Date().toLocaleString('es-BO')}
          </p>
        </div>
      </div>
    </div>
  );
}
