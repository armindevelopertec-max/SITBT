'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { GraduationCap, Clock, Award, FileText, ArrowRight, CheckCircle, ChevronLeft, Zap, Wrench } from 'lucide-react';
import { usarInstitucion } from '@/contexts/ContextoInstitucional';

interface Materia {
  code: string;
  name: string;
  weekly_hours: number;
}

interface StudyPlan {
  rm_number: string;
  rm_date: string;
  subjectsBySemester: Record<number, Materia[]>;
}

interface Carrera {
  id: number;
  code: string;
  name: string;
  area: string;
  title: string;
  description: string;
  load_hours: number;
  status: string;
}

const careerImages: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  2: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
};

const careerIcons: Record<number, JSX.Element> = {
  1: <Zap className="w-12 h-12" />,
  2: <Wrench className="w-12 h-12" />,
};

const studyPlansData: Record<number, StudyPlan> = {
  1: {
    rm_number: 'R.M. 1049/2024',
    rm_date: '15/12/2023',
    subjectsBySemester: {
      1: [
        { code: 'SOM-100', name: 'Seguridad Ocupacional y Medio Ambiente', weekly_hours: 4 },
        { code: 'MAA-100', name: 'Matemática Aplicada', weekly_hours: 4 },
        { code: 'EMC-100', name: 'Electricidad del Motor y Carrocería I', weekly_hours: 4 },
        { code: 'MEA-100', name: 'Metrología Automotriz', weekly_hours: 6 },
        { code: 'MGD-100', name: 'Motores a Gasolina y Diiesel I', weekly_hours: 6 },
        { code: 'TRA-100', name: 'Transmisiones', weekly_hours: 6 },
      ],
      2: [
        { code: 'INT-200', name: 'Inglés Técnico', weekly_hours: 4 },
        { code: 'FIS-200', name: 'Física Aplicada', weekly_hours: 4 },
        { code: 'EMC-200', name: 'Electricidad del Motor y Carrocería II', weekly_hours: 4 },
        { code: 'CIF-200', name: 'Circuitos de Fluidos', weekly_hours: 6 },
        { code: 'MGD-200', name: 'Motores a Gasolina y Diése II', weekly_hours: 6 },
        { code: 'DIT-200', name: 'Dibujo Técnico', weekly_hours: 2 },
        { code: 'SIA-200', name: 'Sistema de Iluminación Automotriz', weekly_hours: 4 },
      ],
      3: [
        { code: 'SIM-300', name: 'Sistema del Motor', weekly_hours: 6 },
        { code: 'VHE-300', name: 'Vehículos Híbridos y Eléctricos', weekly_hours: 6 },
        { code: 'PRO-300', name: 'Programación', weekly_hours: 4 },
        { code: 'CAC-300', name: 'Circuitos de Arranque y Carga', weekly_hours: 6 },
        { code: 'IGA-300', name: 'Inyección a Gasolina', weekly_hours: 4 },
        { code: 'AUT-300', name: 'Autotrónica I', weekly_hours: 4 },
      ],
      4: [
        { code: 'EDA-400', name: 'Electrónica Digital del Automóvil', weekly_hours: 6 },
        { code: 'MAN-400', name: 'Mantenimiento del Automóvil', weekly_hours: 4 },
        { code: 'EAA-400', name: 'Electrónica Analógica del Automóvil', weekly_hours: 6 },
        { code: 'MIC-400', name: 'Microcontroladores', weekly_hours: 6 },
        { code: 'RMD-400', name: 'Reparación de Motores a Diése', weekly_hours: 4 },
        { code: 'AUT-400', name: 'Autotrónica II', weekly_hours: 4 },
      ],
      5: [
        { code: 'IEG-500', name: 'Inyección Electrónica a Gasolina', weekly_hours: 4 },
        { code: 'ATM-500', name: 'Automatización', weekly_hours: 4 },
        { code: 'RSA-500', name: 'Redes Multiplexadas y Protocolos', weekly_hours: 6 },
        { code: 'RSA-500', name: 'Reparación de Caja Automática', weekly_hours: 4 },
        { code: 'LAU-500', name: 'Laboratorio Autotrónica I', weekly_hours: 4 },
        { code: 'EMP-500', name: 'Emprendimiento Productivo', weekly_hours: 4 },
        { code: 'TMG-500', name: 'Taller de Modalidad de Graduación I', weekly_hours: 4 },
      ],
      6: [
        { code: 'PMI-600', name: 'Potenciamiento del Motor a Inyección Electrónica', weekly_hours: 4 },
        { code: 'SCO-600', name: 'Seguridad y Confort', weekly_hours: 6 },
        { code: 'IED-600', name: 'Inyección Electrónica a Diése', weekly_hours: 6 },
        { code: 'SHI-600', name: 'Sistemas Híbridos', weekly_hours: 4 },
        { code: 'LAU-600', name: 'Laboratorio Autotrónica II', weekly_hours: 4 },
        { code: 'ENE-600', name: 'Electroneumática', weekly_hours: 2 },
        { code: 'TMG-600', name: 'Taller de Modalidad de Graduación II', weekly_hours: 4 },
      ],
    },
  },
  2: {
    rm_number: 'R.M. 0210/2024',
    rm_date: '15/03/2024',
    subjectsBySemester: {
      1: [
        { code: 'SOM-100', name: 'Seguridad Ocupacional y Medio Ambiente', weekly_hours: 4 },
        { code: 'MOG-100', name: 'Motores a Gasolina I', weekly_hours: 6 },
        { code: 'ELA-100', name: 'Electricidad Automotriz I', weekly_hours: 6 },
        { code: 'MAA-100', name: 'Matemática Automotriz', weekly_hours: 4 },
        { code: 'MEA-100', name: 'Metrología Automotriz', weekly_hours: 4 },
        { code: 'DTA-100', name: 'Dibujo Técnico Automotriz I', weekly_hours: 2 },
        { code: 'QUA-100', name: 'Química Automotriz', weekly_hours: 4 },
      ],
      2: [
        { code: 'INT-200', name: 'Inglés Técnico', weekly_hours: 4 },
        { code: 'MOG-200', name: 'Motores a Gasolina II', weekly_hours: 6 },
        { code: 'ELA-200', name: 'Electricidad Automotriz II', weekly_hours: 6 },
        { code: 'CHS-200', name: 'Chapería y Soldadura', weekly_hours: 6 },
        { code: 'FIS-200', name: 'Física Automotriz', weekly_hours: 4 },
        { code: 'DTA-200', name: 'Dibujo Técnico Automotriz II', weekly_hours: 4 },
      ],
      3: [
        { code: 'MOG-300', name: 'Motores a Gasolina III', weekly_hours: 6 },
        { code: 'ELA-300', name: 'Electricidad Automotriz III', weekly_hours: 4 },
        { code: 'MOD-300', name: 'Motores Diése I', weekly_hours: 4 },
        { code: 'ETA-300', name: 'Electrónica Automotriz I', weekly_hours: 6 },
        { code: 'TER-300', name: 'Termodinámica', weekly_hours: 2 },
        { code: 'TRA-300', name: 'Transmisiones I', weekly_hours: 8 },
      ],
      4: [
        { code: 'MOG-400', name: 'Motores a Gasolina IV', weekly_hours: 6 },
        { code: 'IAG-400', name: 'Inyección a Gasolina I', weekly_hours: 6 },
        { code: 'MOD-400', name: 'Motores Diése II', weekly_hours: 4 },
        { code: 'ETA-400', name: 'Electrónica Automotriz II', weekly_hours: 6 },
        { code: 'TRA-400', name: 'Transmisiones II', weekly_hours: 4 },
        { code: 'EMP-400', name: 'Emprendimiento Productivo', weekly_hours: 4 },
      ],
      5: [
        { code: 'IED-500', name: 'Inyección Electrónica Diése I', weekly_hours: 4 },
        { code: 'IAG-500', name: 'Inyección a Gasolina II', weekly_hours: 6 },
        { code: 'LAD-500', name: 'Laboratorio Diése I', weekly_hours: 4 },
        { code: 'ETA-500', name: 'Electrónica Automotriz III', weekly_hours: 6 },
        { code: 'NEU-500', name: 'Neumática', weekly_hours: 2 },
        { code: 'TRA-500', name: 'Transmisiones III', weekly_hours: 4 },
        { code: 'TMG-500', name: 'Taller de Modalidad de Graduación I', weekly_hours: 4 },
      ],
      6: [
        { code: 'IED-600', name: 'Inyección Electrónica Diése II', weekly_hours: 4 },
        { code: 'DAU-600', name: 'Diagnóstico del Automóvil', weekly_hours: 4 },
        { code: 'LAD-600', name: 'Laboratorio Diése II', weekly_hours: 4 },
        { code: 'HID-600', name: 'Hidráulica', weekly_hours: 2 },
        { code: 'MAP-600', name: 'Maquinaria Agrícola y Pesada', weekly_hours: 4 },
        { code: 'IAG-600', name: 'Inyección a Gasolina III', weekly_hours: 4 },
        { code: 'TRA-600', name: 'Transmisiones IV', weekly_hours: 4 },
        { code: 'TMG-600', name: 'Taller de Modalidad de Graduación II', weekly_hours: 4 },
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
  const studyPlan = studyPlansData[careerId];
  const careerImage = careerImages[careerId];
  const careerIcon = careerIcons[careerId];

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const response = await publicApi.get<{ data: Carrera[] }>('/carreras', {
          params: { status: 'activo' },
        });
        const found = response.data.data.find((c) => c.id === careerId);
        setCareer(found || null);
      } catch (error) {
        console.error('Error fetching career:', error);
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

  const totalHours = studyPlan
    ? Object.values(studyPlan.subjectsBySemester).flat().reduce((sum, s) => sum + s.weekly_hours * 16, 0)
    : 0;

  return (
    <div className="bg-dark-900">
      {/* Hero */}
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">{career.name}</h1>
            <p className="text-lg sm:text-xl text-primary-400">{career.title}</p>
          </div>
        </div>
      </section>

      {/* Carrera Info */}
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
              <p className="text-gray-100 font-semibold text-xs sm:text-base">{studyPlan?.rm_number}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Horas Totales</p>
              <p className="text-gray-100 font-semibold text-sm sm:text-base">{career.load_hours}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-dark-900 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4">Acerca de la carrera</h2>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{career.description}</p>
          </div>
        </div>
      </section>

      {/* Study Plan */}
      {studyPlan && (
        <section className="bg-dark-800 py-12 sm:py-16 border-t border-dark-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3 sm:mb-4">Malla Curricular</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Resolución Ministerial: {studyPlan.rm_number} del {studyPlan.rm_date}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Object.entries(studyPlan.subjectsBySemester).map(([semester, subjects]) => (
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
                            <span className="font-medium text-primary-400 text-xs sm:text-sm">{subject.code}</span>
                            <p className="text-gray-300 text-xs sm:text-sm">{subject.name}</p>
                          </div>
                          <span className="text-gray-500 text-xs whitespace-nowrap">{subject.weekly_hours}h/sem</span>
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

      {/* CTA */}
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
