'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { GraduationCap, Clock, Award, FileText, ArrowRight, CheckCircle, ChevronLeft, Zap, Wrench } from 'lucide-react';
import { usarInstitucion } from '@/contexts/ContextoInstitucional';

interface Materia {
  codigo: string;
  nombre: string;
  horasSemanales: number;
}

interface PlanEstudio {
  numeroRm: string;
  fechaRm: string;
  materiasPorSemestre: Record<number, Materia[]>;
}

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

const careerImages: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  2: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
};

const careerIcons: Record<number, JSX.Element> = {
  1: <Zap className="w-12 h-12" />,
  2: <Wrench className="w-12 h-12" />,
};

const planEstudiosData: Record<number, PlanEstudio> = {
  1: {
    numeroRm: 'R.M. 1049/2024',
    fechaRm: '15/12/2023',
    materiasPorSemestre: {
      1: [
        { codigo: 'SOM-100', nombre: 'Seguridad Ocupacional y Medio Ambiente', horasSemanales: 4 },
        { codigo: 'MAA-100', nombre: 'Matemática Aplicada', horasSemanales: 4 },
        { codigo: 'EMC-100', nombre: 'Electricidad del Motor y Carrocería I', horasSemanales: 4 },
        { codigo: 'MEA-100', nombre: 'Metrología Automotriz', horasSemanales: 6 },
        { codigo: 'MGD-100', nombre: 'Motores a Gasolina y Diiesel I', horasSemanales: 6 },
        { codigo: 'TRA-100', nombre: 'Transmisiones', horasSemanales: 6 },
      ],
      2: [
        { codigo: 'INT-200', nombre: 'Inglés Técnico', horasSemanales: 4 },
        { codigo: 'FIS-200', nombre: 'Física Aplicada', horasSemanales: 4 },
        { codigo: 'EMC-200', nombre: 'Electricidad del Motor y Carrocería II', horasSemanales: 4 },
        { codigo: 'CIF-200', nombre: 'Circuitos de Fluidos', horasSemanales: 6 },
        { codigo: 'MGD-200', nombre: 'Motores a Gasolina y Diése II', horasSemanales: 6 },
        { codigo: 'DIT-200', nombre: 'Dibujo Técnico', horasSemanales: 2 },
        { codigo: 'SIA-200', nombre: 'Sistema de Iluminación Automotriz', horasSemanales: 4 },
      ],
      3: [
        { codigo: 'SIM-300', nombre: 'Sistema del Motor', horasSemanales: 6 },
        { codigo: 'VHE-300', nombre: 'Vehículos Híbridos y Eléctricos', horasSemanales: 6 },
        { codigo: 'PRO-300', nombre: 'Programación', horasSemanales: 4 },
        { codigo: 'CAC-300', nombre: 'Circuitos de Arranque y Carga', horasSemanales: 6 },
        { codigo: 'IGA-300', nombre: 'Inyección a Gasolina', horasSemanales: 4 },
        { codigo: 'AUT-300', nombre: 'Autotrónica I', horasSemanales: 4 },
      ],
      4: [
        { codigo: 'EDA-400', nombre: 'Electrónica Digital del Automóvil', horasSemanales: 6 },
        { codigo: 'MAN-400', nombre: 'Mantenimiento del Automóvil', horasSemanales: 4 },
        { codigo: 'EAA-400', nombre: 'Electrónica Analógica del Automóvil', horasSemanales: 6 },
        { codigo: 'MIC-400', nombre: 'Microcontroladores', horasSemanales: 6 },
        { codigo: 'RMD-400', nombre: 'Reparación de Motores a Diése', horasSemanales: 4 },
        { codigo: 'AUT-400', nombre: 'Autotrónica II', horasSemanales: 4 },
      ],
      5: [
        { codigo: 'IEG-500', nombre: 'Inyección Electrónica a Gasolina', horasSemanales: 4 },
        { codigo: 'ATM-500', nombre: 'Automatización', horasSemanales: 4 },
        { codigo: 'RSA-500', nombre: 'Redes Multiplexadas y Protocolos', horasSemanales: 6 },
        { codigo: 'RSA-500', nombre: 'Reparación de Caja Automática', horasSemanales: 4 },
        { codigo: 'LAU-500', nombre: 'Laboratorio Autotrónica I', horasSemanales: 4 },
        { codigo: 'EMP-500', nombre: 'Emprendimiento Productivo', horasSemanales: 4 },
        { codigo: 'TMG-500', nombre: 'Taller de Modalidad de Graduación I', horasSemanales: 4 },
      ],
      6: [
        { codigo: 'PMI-600', nombre: 'Potenciamiento del Motor a Inyección Electrónica', horasSemanales: 4 },
        { codigo: 'SCO-600', nombre: 'Seguridad y Confort', horasSemanales: 6 },
        { codigo: 'IED-600', nombre: 'Inyección Electrónica a Diése', horasSemanales: 6 },
        { codigo: 'SHI-600', nombre: 'Sistemas Híbridos', horasSemanales: 4 },
        { codigo: 'LAU-600', nombre: 'Laboratorio Autotrónica II', horasSemanales: 4 },
        { codigo: 'ENE-600', nombre: 'Electroneumática', horasSemanales: 2 },
        { codigo: 'TMG-600', nombre: 'Taller de Modalidad de Graduación II', horasSemanales: 4 },
      ],
    },
  },
  2: {
    numeroRm: 'R.M. 0210/2024',
    fechaRm: '15/03/2024',
    materiasPorSemestre: {
      1: [
        { codigo: 'SOM-100', nombre: 'Seguridad Ocupacional y Medio Ambiente', horasSemanales: 4 },
        { codigo: 'MOG-100', nombre: 'Motores a Gasolina I', horasSemanales: 6 },
        { codigo: 'ELA-100', nombre: 'Electricidad Automotriz I', horasSemanales: 6 },
        { codigo: 'MAA-100', nombre: 'Matemática Automotriz', horasSemanales: 4 },
        { codigo: 'MEA-100', nombre: 'Metrología Automotriz', horasSemanales: 4 },
        { codigo: 'DTA-100', nombre: 'Dibujo Técnico Automotriz I', horasSemanales: 2 },
        { codigo: 'QUA-100', nombre: 'Química Automotriz', horasSemanales: 4 },
      ],
      2: [
        { codigo: 'INT-200', nombre: 'Inglés Técnico', horasSemanales: 4 },
        { codigo: 'MOG-200', nombre: 'Motores a Gasolina II', horasSemanales: 6 },
        { codigo: 'ELA-200', nombre: 'Electricidad Automotriz II', horasSemanales: 6 },
        { codigo: 'CHS-200', nombre: 'Chapería y Soldadura', horasSemanales: 6 },
        { codigo: 'FIS-200', nombre: 'Física Automotriz', horasSemanales: 4 },
        { codigo: 'DTA-200', nombre: 'Dibujo Técnico Automotriz II', horasSemanales: 4 },
      ],
      3: [
        { codigo: 'MOG-300', nombre: 'Motores a Gasolina III', horasSemanales: 6 },
        { codigo: 'ELA-300', nombre: 'Electricidad Automotriz III', horasSemanales: 4 },
        { codigo: 'MOD-300', nombre: 'Motores Diése I', horasSemanales: 4 },
        { codigo: 'ETA-300', nombre: 'Electrónica Automotriz I', horasSemanales: 6 },
        { codigo: 'TER-300', nombre: 'Termodinámica', horasSemanales: 2 },
        { codigo: 'TRA-300', nombre: 'Transmisiones I', horasSemanales: 8 },
      ],
      4: [
        { codigo: 'MOG-400', nombre: 'Motores a Gasolina IV', horasSemanales: 6 },
        { codigo: 'IAG-400', nombre: 'Inyección a Gasolina I', horasSemanales: 6 },
        { codigo: 'MOD-400', nombre: 'Motores Diése II', horasSemanales: 4 },
        { codigo: 'ETA-400', nombre: 'Electrónica Automotriz II', horasSemanales: 6 },
        { codigo: 'TRA-400', nombre: 'Transmisiones II', horasSemanales: 4 },
        { codigo: 'EMP-400', nombre: 'Emprendimiento Productivo', horasSemanales: 4 },
      ],
      5: [
        { codigo: 'IED-500', nombre: 'Inyección Electrónica Diése I', horasSemanales: 4 },
        { codigo: 'IAG-500', nombre: 'Inyección a Gasolina II', horasSemanales: 6 },
        { codigo: 'LAD-500', nombre: 'Laboratorio Diése I', horasSemanales: 4 },
        { codigo: 'ETA-500', nombre: 'Electrónica Automotriz III', horasSemanales: 6 },
        { codigo: 'NEU-500', nombre: 'Neumática', horasSemanales: 2 },
        { codigo: 'TRA-500', nombre: 'Transmisiones III', horasSemanales: 4 },
        { codigo: 'TMG-500', nombre: 'Taller de Modalidad de Graduación I', horasSemanales: 4 },
      ],
      6: [
        { codigo: 'IED-600', nombre: 'Inyección Electrónica Diése II', horasSemanales: 4 },
        { codigo: 'DAU-600', nombre: 'Diagnóstico del Automóvil', horasSemanales: 4 },
        { codigo: 'LAD-600', nombre: 'Laboratorio Diése II', horasSemanales: 4 },
        { codigo: 'HID-600', nombre: 'Hidráulica', horasSemanales: 2 },
        { codigo: 'MAP-600', nombre: 'Maquinaria Agrícola y Pesada', horasSemanales: 4 },
        { codigo: 'IAG-600', nombre: 'Inyección a Gasolina III', horasSemanales: 4 },
        { codigo: 'TRA-600', nombre: 'Transmisiones IV', horasSemanales: 4 },
        { codigo: 'TMG-600', nombre: 'Taller de Modalidad de Graduación II', horasSemanales: 4 },
      ],
    },
  },
};

export default function CareerDetailPage() {
  const params = useParams();
  const { institucion } = usarInstitucion();
  const [career, setCareer] = useState<Carrera | null>(null);
  const [loading, setLoading] = useState(true);

  const careerId = parseInt(params.id as string);
  const planEstudio = planEstudiosData[careerId];
  const careerImage = careerImages[careerId];
  const careerIcon = careerIcons[careerId];

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const response = await publicApi.get<{ datos: Carrera[] }>('/carreras', {
          params: { estado: 'activo' },
        });
        const found = response.data.datos.find((c) => c.id === careerId);
        setCareer(found || null);
      } catch (error) {
        console.error('Error al obtener la carrera:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCareer();
  }, [careerId]);

  if (loading) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!career) {
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

  const totalHoras = planEstudio
    ? Object.values(planEstudio.materiasPorSemestre).flat().reduce((sum, s) => sum + s.horasSemanales * 16, 0)
    : 0;

  return (
    <div className="bg-dark-900">
      {/* Encabezado */}
      <section className="relative h-64 sm:h-80 overflow-hidden bg-dark-800">
        <div className="absolute inset-0 opacity-30">
          <img src={careerImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Link href="/carreras" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-4 sm:mb-6 text-sm sm:text-base">
              <ChevronLeft className="w-4 h-5" />
              Volver a carreras
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">{career.nombre}</h1>
            <p className="text-lg sm:text-xl text-primary-400">{career.titulo}</p>
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
              <p className="text-gray-100 font-semibold text-sm sm:text-base">{career.area}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Duración</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">6 semestres</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Resolución</p>
              <p className="text-gray-100 font-semibold text-xs sm:text-base">{planEstudio?.numeroRm}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Horas Totales</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">{career.horasCarga}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-dark-900 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4">Acerca de la carrera</h2>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{career.descripcion}</p>
          </div>
        </div>
      </section>

      {/* Plan de estudios */}
      {planEstudio && (
        <section className="bg-dark-800 py-12 sm:py-16 border-t border-dark-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3 sm:mb-4">Malla Curricular</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Resolución Ministerial: {planEstudio.numeroRm} del {planEstudio.fechaRm}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Object.entries(planEstudio.materiasPorSemestre).map(([semester, subjects]) => (
                <div key={semester} className="bg-dark-700 border border-dark-600 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500 text-dark-900 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">
                      {semester}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-100">Semestre {semester}</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {subjects.map((subject, idx) => (
                      <li key={idx} className="border-b border-dark-600 pb-2 sm:pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium text-primary-400 text-xs sm:text-sm">{subject.codigo}</span>
                            <p className="text-gray-300 text-xs sm:text-sm">{subject.nombre}</p>
                          </div>
                          <span className="text-gray-500 text-xs whitespace-nowrap">{subject.horasSemanales}h/sem</span>
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
            href={`/admision/pre-registro?carrera=${career.id}`}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-all text-base sm:text-lg"
          >
            Postular ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
