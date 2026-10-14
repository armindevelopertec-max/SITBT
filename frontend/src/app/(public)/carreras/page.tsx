'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { GraduationCap, ArrowRight, CheckCircle, Award, Clock, FileText } from 'lucide-react';
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

interface CarreraConPlan extends Carrera {
  planEstudio?: PlanEstudio;
}

const careerImages: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
  2: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
};

export default function CareersPage() {
  const { institucion } = usarInstitucion();
  const [careers, setCareers] = useState<CarreraConPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await publicApi.get<{ data: Carrera[] }>('/carreras', { params: { estado: 'activo' } });
        const careersWithPlans: CarreraConPlan[] = response.data.data.map((career) => ({
          ...career,
          planEstudio: getPlanEstudioForCareer(career.id),
        }));
        setCareers(careersWithPlans);
      } catch (error) {
        console.error('Error al obtener carreras:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPlanEstudioForCareer = (careerId: number): PlanEstudio | undefined => {
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
            { codigo: 'RMP-500', nombre: 'Redes Multiplexadas y Protocolos', horasSemanales: 6 },
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
    return planEstudiosData[careerId];
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
      {/* Encabezado */}
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

      {/* Carreras */}
      <section className="bg-dark-900 text-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8">
            {careers.map((career) => (
              <div key={career.id} className="bg-dark-700 rounded-2xl overflow-hidden">
                <div className="md:flex">
                  {/* Imagen */}
                  <div className="md:w-1/3 relative">
                    <img
                      src={careerImages[career.id] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80'}
                      alt={career.nombre}
                      className="w-full h-48 sm:h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="md:w-2/3 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h2 className="text-xl sm:text-2xl font-bold">{career.nombre}</h2>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-4 h-4" />
                            Activo
                          </span>
                        </div>
                        <p className="text-primary-400 font-medium text-sm sm:text-base">{career.titulo}</p>
                      </div>
                      <Link
                        href={`/admision/pre-registro?carrera=${career.id}`}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all"
                      >
                        Postular <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{career.descripcion}</p>

                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-500 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{career.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{career.horasCarga} horas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{career.planEstudio?.numeroRm}</span>
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

      {/* Llamada a la acción */}
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
