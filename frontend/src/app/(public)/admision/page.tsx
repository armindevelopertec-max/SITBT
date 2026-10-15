'use client';

import Link from 'next/link';
import { GraduationCap, CheckCircle, Users, BookOpen, CreditCard, FileText, ArrowRight, MapPin, Phone, Mail, Clock, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { usarInstitucion } from '@/contextos/ContextoInstitucional';

const pasosProceso = [
  {
    paso: 1,
    titulo: 'Pre-registro',
    descripcion: 'Llena el formulario en línea con tus datos personales y académicos',
    icono: <FileText className="w-5 h-5" />,
  },
  {
    paso: 2,
    titulo: 'Verificación',
    descripcion: 'Presenta tus documentos originales en secretaría',
    icono: <CheckCircle className="w-5 h-5" />,
  },
  {
    paso: 3,
    titulo: 'Pago',
    descripcion: 'Realiza el pago de la matrícula',
    icono: <CreditCard className="w-5 h-5" />,
  },
  {
    paso: 4,
    titulo: 'Formalización',
    descripcion: 'Recibe tu comprobante y carnet de estudiante',
    icono: <Users className="w-5 h-5" />,
  },
];

const requisitos = [
  'Cédula de Identidad (original y 2 copias)',
  'Certificado de nacimiento (original y 2 copias)',
  'Título de bachiller o diploma (original y 2 copias)',
  'Fotografías tamaño carnet (4 unidades, fondo celeste)',
  'Certificado médico (original)',
  'Certificado de conducta (original)',
  'Pago de formulario (Bs. 150)',
];

const costos = [
  { monto: 'Bs. 150', concepto: 'Formulario de inscripción' },
  { monto: 'Bs. 400', concepto: 'Matrícula semestral' },
];



export default function AdmisionPage() {
  const { institucion } = usarInstitucion();

  return (
    <div>
      {/* Encabezado */}
      <section className="relative h-64 sm:h-80 overflow-hidden bg-dark-800">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">Admisión 2026</h1>
            <p className="text-lg sm:text-xl text-primary-400">
              Convierte tu vocación en tu profesión
            </p>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="bg-dark-900 py-16 sm:py-24 border-y border-dark-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-400 text-sm font-medium rounded-full mb-4">
              Proceso paso a paso
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-4">
              Proceso de <span className="text-primary-400">Admisión</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Sigue estos pasos para completar tu inscripción
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-purple-500 to-orange-500 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {pasosProceso.map((paso, indice) => {
                const colores = [
                  { fondo: 'from-blue-500 to-cyan-500', texto: 'text-blue-400', fondoClaro: 'bg-blue-500/10', borde: 'border-blue-500/50', sombra: 'shadow-blue-500/50', fondoTarjeta: 'bg-blue-500/5' },
                  { fondo: 'from-emerald-500 to-teal-500', texto: 'text-emerald-400', fondoClaro: 'bg-emerald-500/10', borde: 'border-emerald-500/50', sombra: 'shadow-emerald-500/50', fondoTarjeta: 'bg-emerald-500/5' },
                  { fondo: 'from-purple-500 to-pink-500', texto: 'text-purple-400', fondoClaro: 'bg-purple-500/10', borde: 'border-purple-500/50', sombra: 'shadow-purple-500/50', fondoTarjeta: 'bg-purple-500/5' },
                  { fondo: 'from-orange-500 to-amber-500', texto: 'text-orange-400', fondoClaro: 'bg-orange-500/10', borde: 'border-orange-500/50', sombra: 'shadow-orange-500/50', fondoTarjeta: 'bg-orange-500/5' },
                ];
                const c = colores[indice];
                return (
                  <div key={indice} className="relative text-center group">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${c.fondo} rounded-full flex items-center justify-center shadow-2xl ${c.sombra} group-hover:scale-110 transition-all duration-500 mb-6 ring-8 ring-dark-800`}>
                        <span className="text-dark-900 font-bold text-3xl">{paso.paso}</span>
                      </div>
                      <div className={`w-full ${c.fondoTarjeta} border ${c.borde} rounded-2xl p-6 backdrop-blur-sm group-hover:-translate-y-2 transition-all duration-300`}>
                        <div className={`w-14 h-14 ${c.fondoClaro} ${c.texto} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {paso.icono}
                        </div>
                        <h4 className="text-xl font-bold text-gray-100 mb-2">{paso.titulo}</h4>
                        <p className="text-gray-400 text-sm">{paso.descripcion}</p>
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

      {/* Requisitos y costos */}
      <section className="bg-dark-700 py-16 sm:py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 sm:mb-6">Requisitos</h3>
              <ul className="space-y-4">
                {requisitos.map((requisito, indice) => (
                  <li key={indice} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{requisito}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 sm:mb-6">Costos</h3>
              <div className="space-y-4">
                {costos.map((costo, indice) => (
                  <div key={indice} className="bg-dark-700 border border-dark-600 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-gray-300">{costo.concepto}</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary-400">{costo.monto}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-dark-700 border border-dark-600 rounded-xl">
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
