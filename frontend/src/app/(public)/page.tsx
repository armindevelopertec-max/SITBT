'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, Award, ArrowRight, CheckCircle, Wrench, Zap, MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Star, Target, Eye, Heart, Globe, Shield, Award as AwardIcon, TrendingUp, Briefcase, Globe2, Laptop, Home, Info, HeartHandshake, GraduationCap as GraduationCapIcon, Lightbulb, MapPin as MapPinIcon, User } from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80',
    title: 'Formación Técnica de Excelencia',
    subtitle: 'Prepárate para el mercado laboral con educación de calidad'
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80',
    title: 'Talleres Equipados',
    subtitle: 'Practica con tecnología de vanguardia'
  },
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80',
    title: 'Tu Futuro Comienza Aquí',
    subtitle: 'Únete a miles de profesionales exitosos'
  }
];

const careers = [
  {
    name: 'Autotrónica',
    title: 'Técnico Superior en Autotrónica',
    code: 'R.M. 1049/2024',
    area: 'Electrónica y Electricidad',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-primary-500/10 text-primary-400',
    description: 'Especialización en sistemas electrónicos automotrices, diagnóstico computarizado y tecnologías híbridas.'
  },
  {
    name: 'Mecánica Automotriz',
    title: 'Técnico Superior en Mecánica Automotriz',
    code: 'R.M. 0210/2024',
    area: 'Mecánica',
    icon: <Wrench className="w-8 h-8" />,
    color: 'bg-primary-500/10 text-primary-400',
    description: 'Diagnóstico, mantenimiento y reparación de vehículos automotores con tecnología de punta.'
  }
];

const values = [
  { icon: <Target className="w-6 h-6" />, title: 'Excelencia', description: 'Formación de calidad con estándares internacionales' },
  { icon: <Heart className="w-6 h-6" />, title: 'Compromiso', description: 'Dedicación total con cada estudiante' },
  { icon: <Globe className="w-6 h-6" />, title: 'Innovación', description: 'Tecnología de vanguardia en enseñanza' },
  { icon: <Shield className="w-6 h-6" />, title: 'Ética', description: 'Valores sólidos en cada profesional' },
];

const methodology = [
  { icon: <BookOpen className="w-8 h-8" />, title: 'Clases Teóricas', description: 'Fundamentos técnicos y conceptos fundamentales impartidos por profesores especializados.' },
  { icon: <Laptop className="w-8 h-8" />, title: 'Prácticas en Talleres', description: 'Experiencia hands-on con equipos y tecnología de última generación.' },
  { icon: <Users className="w-8 h-8" />, title: 'Tutorías', description: 'Seguimiento personalizado para asegurar tu éxito académico.' },
  { icon: <Briefcase className="w-8 h-8" />, title: 'Prácticas Profesionales', description: 'Conexión con empresas del sector para tu inserción laboral.' },
];

const achievements = [
  { number: '+95%', label: 'Tasa de empleabilidad', icon: <TrendingUp className="w-6 h-6" /> },
  { number: '+3', label: 'Años de experiencia', icon: <AwardIcon className="w-6 h-6" /> },
  { number: '+500', label: 'Egresados exitosos', icon: <Star className="w-6 h-6" /> },
  { number: '2', label: 'R.M. activas', icon: <Globe2 className="w-6 h-6" /> },
];

const authorities = [
  { name: 'Lic. Juan Pérez', role: 'Director General', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { name: 'Ing. María López', role: 'Jefe Académico', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { name: 'Lic. Carlos Mamani', role: 'Secretario Académico', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
];

export default function HomePage() {
  const { institution } = useInstitution();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'nosotros', label: 'Nosotros', icon: <Info className="w-5 h-5" /> },
    { id: 'valores', label: 'Valores', icon: <HeartHandshake className="w-5 h-5" /> },
    { id: 'carreras', label: 'Carreras', icon: <GraduationCapIcon className="w-5 h-5" /> },
    { id: 'metodologia', label: 'Metodología', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'autoridades', label: 'Autoridades', icon: <User className="w-5 h-5" /> },
    { id: 'ubicacion', label: 'Ubicación', icon: <MapPinIcon className="w-5 h-5" /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-dark-900">
      {/* Side Navigation */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`group relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
              activeSection === item.id
                ? 'bg-primary-500 text-dark-900'
                : 'bg-dark-700/80 text-gray-400 hover:bg-dark-600 hover:text-primary-400'
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-dark-700 text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Hero Slider */}
      <section id="inicio" data-section className="relative h-[65vh] min-h-[500px] overflow-hidden">
        {heroImages.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 z-10">
              <img src={slide.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-dark-900/75 z-10" />

            <div className="relative z-20 h-full flex items-center justify-center text-center">
              <div className="max-w-4xl px-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-100 mb-6 tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-primary-400 mb-10 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/admision/pre-registro" className="px-10 py-4 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-all text-lg">
                    Pre-registro ahora
                  </Link>
                  <Link href="/carreras" className="px-10 py-4 border-2 border-primary-500 text-primary-400 font-bold rounded-lg hover:bg-primary-500/10 transition-all text-lg">
                    Ver carreras
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-600 transition-all">
          <ChevronLeft className="w-6 h-6 text-primary-400" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-600 transition-all">
          <ChevronRight className="w-6 h-6 text-primary-400" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary-400 w-8' : 'bg-gray-500'}`}
            />
          ))}
        </div>
      </section>

      {/* About */}
      <section id="nosotros" data-section className="bg-dark-900 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-100 mb-6">
              Formación <span className="text-primary-400">Técnica</span> de Excelencia
            </h2>
            <p className="text-xl text-gray-400">
              {institution?.lema || 'Conectando Mentes, Impulsando el Progreso'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                Somos una institución educativa técnica comprometida con la formación de profesionales
                competentes en el área tecnológica, contribuyendo al desarrollo económico y social de Bolivia.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Con 3 años de experiencia, hemos formado profesionales
                exitosos que hoy contribuyen al sector productivo del país.
              </p>
              <Link href="/instituto" className="inline-flex items-center gap-2 text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                Conoce más sobre nosotros <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80" alt="Estudiantes" className="rounded-2xl" />
              <div className="absolute -bottom-6 -left-6 bg-dark-700 border border-dark-600 text-gray-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-primary-400">+3</div>
                <div className="text-gray-400">Años</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="valores" data-section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestros Valores</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Los principios que guían nuestra formación profesional
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-dark-700 rounded-xl border border-dark-600 hover:border-primary-500/50 transition-colors">
                <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2">{value.title}</h4>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="carreras" data-section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestras Carreras</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Programas técnicos superiores autorizados por el Ministerio de Educación
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {careers.map((career, index) => (
              <div key={index} className="bg-dark-700 border border-dark-600 rounded-xl p-8 hover:border-primary-500/50 transition-all">
                <div className={`inline-flex p-4 rounded-xl mb-4 ${career.color}`}>
                  {career.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">{career.name}</h3>
                <p className="text-primary-400 font-medium mb-4">{career.title}</p>
                <p className="text-gray-400 mb-6">{career.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                  <span className="text-sm text-gray-500">{career.code}</span>
                  <Link href="/carreras" className="text-primary-400 font-medium text-sm hover:text-primary-300 flex items-center gap-1">
                    Ver plan <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="metodologia" data-section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestra Metodología</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Combinamos experiencia práctica con conocimiento académico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((item, index) => (
              <div key={index} className="bg-dark-700 rounded-xl p-6 border border-dark-600 hover:border-primary-500/50 transition-colors">
                <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-dark-900 py-24">
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

      {/* Achievements */}
      <section className="bg-dark-800 py-16 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            {achievements.map((item, index) => (
              <div key={index}>
                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-primary-400 mb-1">{item.number}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authorities */}
      <section id="autoridades" data-section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Autoridades</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nuestro equipo de dirección y gestión académica
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {authorities.map((auth, index) => (
              <div key={index} className="text-center">
                <img src={auth.image} alt={auth.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-dark-600" />
                <h4 className="text-lg font-bold text-gray-100">{auth.name}</h4>
                <p className="text-primary-400 font-medium">{auth.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="ubicacion" data-section className="bg-dark-800 py-24 border-t border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-6">Encuéntranos</h2>
              <p className="text-gray-400 mb-8">
                Estamos ubicados en una zona de fácil acceso en la ciudad de {institution?.ciudad || 'El Alto'}.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Dirección</h4>
                    <p className="text-gray-400">{institution?.direccion || 'Av. de los Heroes, Z. Ferropetrol N.- 11'}, {institution?.ciudad || 'El Alto'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Teléfono</h4>
                    <p className="text-gray-400">{institution?.telefono || '7525247'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Email</h4>
                    <p className="text-gray-400">{institution?.email || 'ITBT@edu.bo'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Horario</h4>
                    <p className="text-gray-400">Lunes a Viernes: 8:00 - 18:00</p>
                    <p className="text-gray-400">Sábados: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-80 lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d191.6287699653574!2d-68.1987555!3d-16.5046514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDMwJzE2LjUiUyA2OMKwMTEnNTQuMiJX!5e0!3m2!1ses!2sbo!4v1699900000000!5m2!1ses!2sbo"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-700 py-24 border-t border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-6">¿Listo para comenzar tu carrera técnica?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Inscríbete ahora y forma parte del {institution?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admision/pre-registro" className="px-8 py-4 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-all">
              Pre-registro ahora
            </Link>
            <Link href="/contacto" className="px-8 py-4 border border-primary-500 text-primary-400 font-semibold rounded-lg hover:bg-primary-500/10 transition-all">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
