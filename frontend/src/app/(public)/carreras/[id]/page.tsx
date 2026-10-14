'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { GraduationCap, Clock, Award, FileText, ArrowRight, ChevronLeft } from 'lucide-react';
import { usarInstitucion } from '@/contexts/ContextoInstitucional';

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  titulo: string;
  descripcion: string;
  horasCarga: number;
  estado: string;
}

interface Prerrequisito {
  codigo: string;
  nombre: string;
}

interface MateriaPlan {
  id: number;
  semestre: number;
  horasSemanales: number;
  codigo: string | null;
  nombre: string | null;
  prerrequisito: Prerrequisito | null;
}

interface PlanEstudio {
  id: number;
  numeroRm: string;
  fechaRm: string;
  estado: string;
}

const formatearFecha = (fecha: string): string => {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function PaginaDetalleCarrera() {
  const params = useParams();
  const { institucion } = usarInstitucion();
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [materias, setMaterias] = useState<MateriaPlan[]>([]);
  const [cargando, setCargando] = useState(true);

  const idCarrera = parseInt(params.id as string);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [respuestaCarrera, respuestaPlan] = await Promise.all([
          publicApi.get<{ datos: Carrera[] }>('/carreras', {
            params: { estado: 'activo' },
          }),
          publicApi.get<{ plan: PlanEstudio | null; materias: MateriaPlan[] }>(
            `/planes-estudio/publico/carrera/${idCarrera}`,
          ),
        ]);

        setCarrera(respuestaCarrera.data.datos.find((c) => c.id === idCarrera) || null);
        setPlan(respuestaPlan.data.plan);
        setMaterias(respuestaPlan.data.materias);
      } catch (error) {
        console.error('Error al obtener los datos de la carrera:', error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, [idCarrera]);

  const materiasPorSemestre = materias.reduce<Record<number, MateriaPlan[]>>((acumulado, materia) => {
    (acumulado[materia.semestre] ??= []).push(materia);
    return acumulado;
  }, {});
  const semestres = Object.keys(materiasPorSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  if (cargando) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!carrera) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Carrera no encontrada</h1>
          <Link href="/carreras" className="text-primary-400 hover:text-primary-300">
            Volver a carreras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900">
      {/* Encabezado */}
      <section className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-dark-800 via-dark-700 to-dark-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-500 blur-3xl" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Link href="/carreras" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-4 sm:mb-6 text-sm sm:text-base">
              <ChevronLeft className="w-4 h-5" />
              Volver a carreras
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">{carrera.nombre}</h1>
            <p className="text-lg sm:text-xl text-primary-400">{carrera.titulo}</p>
          </div>
        </div>
      </section>

      {/* Información de la carrera */}
      <section className="bg-dark-800 py-8 sm:py-12 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Área</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">{carrera.area}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Duración</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">
                {semestres.length > 0 ? `${semestres.length} semestres` : '—'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Resolución</p>
              <p className="text-gray-100 font-semibold text-xs sm:text-base">{plan?.numeroRm || '—'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Horas Totales</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">{carrera.horasCarga}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-dark-900 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4">Acerca de la carrera</h2>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{carrera.descripcion}</p>
          </div>
        </div>
      </section>

      {/* Plan de estudios */}
      {semestres.length > 0 && (
        <section className="bg-dark-800 py-12 sm:py-16 border-t border-dark-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3 sm:mb-4">Malla Curricular</h2>
              {plan && (
                <p className="text-gray-400 text-sm sm:text-base">
                  Resolución Ministerial: {plan.numeroRm}
                  {plan.fechaRm ? ` del ${formatearFecha(plan.fechaRm)}` : ''}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {semestres.map((semestre) => (
                <div key={semestre} className="bg-dark-700 border border-dark-600 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500 text-dark-900 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">
                      {semestre}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-100">Semestre {semestre}</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {materiasPorSemestre[semestre].map((materia) => (
                      <li key={materia.id} className="border-b border-dark-600 pb-2 sm:pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium text-primary-400 text-xs sm:text-sm">{materia.codigo}</span>
                            <p className="text-gray-300 text-xs sm:text-sm">{materia.nombre}</p>
                            {materia.prerrequisito && (
                              <p className="text-gray-500 text-xs mt-0.5">
                                Prerrequisito: {materia.prerrequisito.nombre}
                              </p>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs whitespace-nowrap">{materia.horasSemanales}h/sem</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Llamada a la acción */}
      <section className="bg-dark-900 py-12 sm:py-16 border-t border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4">¿Interesado en esta carrera?</h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
            Inscríbete ahora y forma parte de nuestra comunidad educativa
          </p>
          <Link
            href={`/admision/pre-registro?carrera=${carrera.id}`}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-all text-base sm:text-lg"
          >
            Postular ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
