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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Admisión 2026</h1>
            <p className="text-xl text-primary-400 max-w-2xl mx-auto">
              Convierte tu vocación en tu profesión
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-700 border border-dark-600 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">¿Listo para empezar?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Completa tu pre-registro en línea y da el primer paso hacia tu carrera técnica
            </p>
            <Link href="/admision/pre-registro" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all">
              Realizar pre-registro <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Proceso de Admisión</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Sigue estos pasos para completar tu inscripción
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="relative bg-dark-700 border border-dark-600 rounded-xl p-6">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-primary-500 text-dark-900 rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mb-4 mt-2">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2">{step.title}</h4>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & Costs */}
      <section className="bg-dark-800 py-24 border-y border-dark-600">
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

      {/* Info */}
      <section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-2">Teléfono</h4>
              <p className="text-gray-400">{institution?.telefono || '7525247'}</p>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-2">Email</h4>
              <p className="text-gray-400">{institution?.email || 'ITBT@edu.bo'}</p>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-gray-100 mb-2">Ubicación</h4>
              <p className="text-gray-400">{institution?.direccion || 'Av. de los Heroes'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-dark-700 py-16 border-t border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">No esperes más</h2>
          <p className="text-xl text-gray-400 mb-8">
            Las vacantes son limitadas para el período 2026
          </p>
          <Link href="/admision/pre-registro" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all">
            Pre-registrarme ahora <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
