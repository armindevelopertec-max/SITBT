'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { GraduationCap, ArrowRight, CheckCircle, Award, Clock, FileText } from 'lucide-react';
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

interface CareerWithPlan extends Carrera {
  studyPlan?: StudyPlan;
}

const careerImages: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  2: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
};

export default function CareersPage() {
  const { institucion } = usarInstitucion();
  const [careers, setCareers] = useState<CareerWithPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await publicApi.get<{ data: Carrera[] }>('/carreras', { params: { estado: 'activo' } });
        const careersWithPlans: CareerWithPlan[] = response.data.data.map((career) => ({
          ...career,
          studyPlan: getStudyPlanForCareer(career.id),
        }));
        setCareers(careersWithPlans);
      } catch (error) {
        console.error('Error fetching careers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStudyPlanForCareer = (careerId: number): StudyPlan | undefined => {
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
            { code: 'RMP-500', name: 'Redes Multiplexadas y Protocolos', weekly_hours: 6 },
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
    return studyPlansData[careerId];
  };

  if (loading) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-dark-900">
      {/* Hero */}
      <section className="relative h-64 sm:h-80 overflow-hidden bg-dark-900">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">Nuestras Carreras</h1>
            <p className="text-lg sm:text-xl text-primary-400">
              Programas técnicos superiores autorizados por el Ministerio de Educación
            </p>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="bg-dark-900 text-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8">
            {careers.map((career) => (
              <div key={career.id} className="bg-dark-700 rounded-2xl overflow-hidden">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/3 relative">
                    <img
                      src={careerImages[career.id] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80'}
                      alt={career.name}
                      className="w-full h-48 sm:h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="md:w-2/3 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h2 className="text-xl sm:text-2xl font-bold">{career.name}</h2>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-4 h-4" />
                            Activo
                          </span>
                        </div>
                        <p className="text-primary-400 font-medium text-sm sm:text-base">{career.title}</p>
                      </div>
                      <Link
                        href={`/admision/pre-registro?carrera=${career.id}`}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all"
                      >
                        Postular <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{career.description}</p>

                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-500 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{career.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{career.load_hours} horas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{career.studyPlan?.rm_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>6 semestres</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href={`/carreras/${career.id}`}
                        className="inline-flex items-center gap-2 text-primary-400 font-semibold hover:text-primary-300 transition-colors text-sm sm:text-base"
                      >
                        Ver Malla Curricular <ArrowRight className="w-4 h-4" />
                      </Link>

                      <div className="mt-4 md:hidden">
                        <Link
                          href={`/admision/pre-registro?carrera=${career.id}`}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all"
                        >
                          Postular <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-700 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-3 sm:mb-4">¿Quieres más información?</h2>
          <p className="text-gray-400 mb-5 sm:mb-6 text-sm sm:text-base">
            Contáctanos o visítanos para conocer más sobre nuestras carreras.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contacto" className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all">
              Contactar
            </Link>
            <Link href="/admision/pre-registro" className="px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-primary-500 text-primary-400 font-semibold rounded-lg hover:bg-primary-500/10 transition-all">
              Pre-registro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
