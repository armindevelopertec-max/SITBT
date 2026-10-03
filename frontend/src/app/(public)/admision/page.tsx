'use client';

import Link from 'next/link';
import { GraduationCap, CheckCircle, Users, BookOpen, CreditCard, FileText, ArrowRight, MapPin, Phone, Mail, Clock, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';

const processSteps = [
  {
    step: 1,
    title: 'Pre-registro',
    description: 'Llena el formulario en línea con tus datos personales y académicos',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    step: 2,
    title: 'Verificación',
    description: 'Presenta tus documentos originales en secretaría',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    step: 3,
    title: 'Pago',
    description: 'Realiza el pago de la matrícula',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    step: 4,
    title: 'Formalización',
    description: 'Recibe tu comprobante y carnet de estudiante',
    icon: <Users className="w-5 h-5" />,
  },
];

const requirements = [
  'Cédula de Identidad (original y 2 copias)',
  'Certificado de nacimiento (original y 2 copias)',
  'Título de bachiller o diploma (original y 2 copias)',
  'Fotografías tamaño carnet (4 unidades, fondo celeste)',
  'Certificado médico (original)',
  'Certificado de conducta (original)',
  'Pago de formulario (Bs. 150)',
];

const costs = [
  { amount: 'Bs. 150', concept: 'Formulario de inscripción' },
  { amount: 'Bs. 400', concept: 'Matrícula semestral' },
];



export default function AdmisionPage() {
  const { institution } = useInstitution();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-80 overflow-hidden bg-dark-800">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Admisión 2026</h1>
            <p className="text-xl text-primary-400">
              Convierte tu vocación en tu profesión
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-dark-900 py-24 border-y border-dark-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-400 text-sm font-medium rounded-full mb-4">
              Proceso paso a paso
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
              Proceso de <span className="text-primary-400">Admisión</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Sigue estos pasos para completar tu inscripción
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-purple-500 to-orange-500 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => {
                const colors = [
                  { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-400', bgLight: 'bg-blue-500/10', border: 'border-blue-500/50', shadow: 'shadow-blue-500/50', cardBg: 'bg-blue-500/5' },
                  { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-400', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/50', shadow: 'shadow-emerald-500/50', cardBg: 'bg-emerald-500/5' },
                  { bg: 'from-purple-500 to-pink-500', text: 'text-purple-400', bgLight: 'bg-purple-500/10', border: 'border-purple-500/50', shadow: 'shadow-purple-500/50', cardBg: 'bg-purple-500/5' },
                  { bg: 'from-orange-500 to-amber-500', text: 'text-orange-400', bgLight: 'bg-orange-500/10', border: 'border-orange-500/50', shadow: 'shadow-orange-500/50', cardBg: 'bg-orange-500/5' },
                ];
                const c = colors[index];
                return (
                  <div key={index} className="relative text-center group">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${c.bg} rounded-full flex items-center justify-center shadow-2xl ${c.shadow} group-hover:scale-110 transition-all duration-500 mb-6 ring-8 ring-dark-800`}>
                        <span className="text-dark-900 font-bold text-3xl">{step.step}</span>
                      </div>
                      <div className={`w-full ${c.cardBg} border ${c.border} rounded-2xl p-6 backdrop-blur-sm group-hover:-translate-y-2 transition-all duration-300`}>
                        <div className={`w-14 h-14 ${c.bgLight} ${c.text} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {step.icon}
                        </div>
                        <h4 className="text-xl font-bold text-gray-100 mb-2">{step.title}</h4>
                        <p className="text-gray-400 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/admision/pre-registro" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-dark-900 font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-1">
              Realizar pre-registro <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Requirements & Costs */}
      <section className="bg-dark-700 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-100 mb-6">Requisitos</h3>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-100 mb-6">Costos</h3>
              <div className="space-y-4">
                {costs.map((cost, index) => (
                  <div key={index} className="bg-dark-700 border border-dark-600 rounded-xl p-6 flex items-center justify-between">
                    <span className="text-gray-300">{cost.concept}</span>
                    <span className="text-2xl font-bold text-primary-400">{cost.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-dark-700 border border-dark-600 rounded-xl">
                <h4 className="font-semibold text-gray-100 mb-2">¿Necesitas información adicional?</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Contáctanos y te atenderemos personalmente
                </p>
                <Link href="/contacto" className="text-primary-400 font-medium hover:text-primary-300 flex items-center gap-1">
                  Ir a contacto <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>  

    </div>
  );
}
