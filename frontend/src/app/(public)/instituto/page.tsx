'use client';

import Link from 'next/link';
import { GraduationCap, Users, BookOpen, Award, ArrowRight, CheckCircle, MapPin, Phone, Mail, Clock, Target, Eye, Shield, Star } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';

const milestones = [
  { year: '2014', event: 'Fundación del Instituto' },
  { year: '2018', event: 'Primera R.M. aprobada' },
  { year: '2022', event: 'Inauguración de nuevos talleres' },
  { year: '2024', event: 'R.M. de Autotrónica aprobada' },
];

const authorities = [
  { name: 'Lic. Juan Pérez', role: 'Director General', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { name: 'Ing. María López', role: 'Jefe Académico', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { name: 'Lic. Carlos Mamani', role: 'Secretario Académico', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
];

const values = [
  { icon: <Target className="w-8 h-8" />, title: 'Excelencia Académica', description: 'Estándares elevados en la formación técnica' },
  { icon: <Shield className="w-8 h-8" />, title: 'Integridad', description: 'Formación en valores éticos y profesionales' },
  { icon: <Star className="w-8 h-8" />, title: 'Innovación', description: 'Tecnología y métodos de enseñanza actualizados' },
];

export default function InstitutoPage() {
  const { institution } = useInstitution();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-96 overflow-hidden bg-dark-800">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
              {institution?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
            </h1>
            <p className="text-xl text-primary-400">{institution?.lema || 'Conectando Mentes, Impulsando el Progreso'}</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Sobre Nosotros</h2>
              <p className="text-gray-400 mb-6">
                El {institution?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'} (ITBT) es una institución 
                educativa dedicada a la formación técnica profesional en Bolivia.
              </p>
              <p className="text-gray-400 mb-6">
                Con autorización del Ministerio de Educación, ofrecemos programas técnicos superiores 
                que preparan a nuestros estudiantes para el mercado laboral con habilidades prácticas 
                y conocimientos especializados.
              </p>
              <p className="text-gray-400">
                Nuestro compromiso es formar profesionales competentes, éticos y creativos, 
                capaces de contribuir al desarrollo tecnológico y económico de Bolivia.
              </p>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80" alt="Instituto" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-10">
              <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">Misión</h3>
              <p className="text-gray-400 leading-relaxed">
                Formar profesionales técnicos competentes y éticos, con habilidades prácticas y
                conocimientos actualizados, que contribuyan al desarrollo sostenible de Bolivia
                mediante una educación técnica de excelencia.
              </p>
            </div>
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-10">
              <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">Visión</h3>
              <p className="text-gray-400 leading-relaxed">
                Ser una institución de referencia en educación técnica en Bolivia, reconocida por la excelencia
                de sus programas, la innovación pedagógica y el compromiso con el desarrollo social y económico
                del país.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Nuestros Valores</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Principios que guían nuestra labor educativa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-8 bg-dark-700 rounded-xl border border-dark-600">
                <div className="w-16 h-16 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-100 mb-3">{value.title}</h4>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Nuestra Historia</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Más de 3 años formando profesionales técnicos
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-dark-600" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 bg-dark-700 border border-dark-600 rounded-xl p-6 ${index % 2 === 0 ? 'text-right' : ''}`}>
                    <div className="text-2xl font-bold text-primary-400 mb-2">{milestone.year}</div>
                    <p className="text-gray-300">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authorities */}
      <section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Autoridades</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nuestro equipo directivo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {authorities.map((auth, index) => (
              <div key={index} className="text-center p-8 bg-dark-700 rounded-xl border border-dark-600">
                <img src={auth.image} alt={auth.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-dark-600" />
                <h4 className="text-lg font-bold text-gray-100">{auth.name}</h4>
                <p className="text-primary-400 font-medium">{auth.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-dark-800 py-24 border-t border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">¿Tienes preguntas?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Contáctanos para obtener más información sobre nuestros programas
          </p>
          <Link href="/contacto" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all">
            Contáctanos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
