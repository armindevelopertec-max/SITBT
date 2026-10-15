'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, ArrowRight, Wrench, Zap, MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Target, Eye, Heart, Globe, Shield, Briefcase, Laptop, Home, Info, HeartHandshake, GraduationCap as GraduationCapIcon, Lightbulb, MapPin as MapPinIcon, User } from 'lucide-react';
import { usarInstitucion } from '@/contextos/ContextoInstitucional';

const imagenesHeroe = [
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80',
    titulo: 'Formación Técnica de Excelencia',
    subtitulo: 'Prepárate para el mercado laboral con educación de calidad'
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80',
    titulo: 'Talleres Equipados',
    subtitulo: 'Practica con tecnología de vanguardia'
  },
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80',
    titulo: 'Tu Futuro Comienza Aquí',
    subtitulo: 'Únete a miles de profesionales exitosos'
  }
];

const carreras = [
  {
    nombre: 'Autotrónica',
    titulo: 'Técnico Superior en Autotrónica',
    codigo: 'R.M. 1049/2024',
    area: 'Electrónica y Electricidad',
    icono: <Zap className="w-8 h-8" />,
    color: 'bg-primary-500/10 text-primary-400',
    descripcion: 'Especialización en sistemas electrónicos automotrices, diagnóstico computarizado y tecnologías híbridas.'
  },
  {
    nombre: 'Mecánica Automotriz',
    titulo: 'Técnico Superior en Mecánica Automotriz',
    codigo: 'R.M. 0210/2024',
    area: 'Mecánica',
    icono: <Wrench className="w-8 h-8" />,
    color: 'bg-primary-500/10 text-primary-400',
    descripcion: 'Diagnóstico, mantenimiento y reparación de vehículos automotores con tecnología de punta.'
  }
];

const valores = [
  { icono: <Target className="w-6 h-6" />, titulo: 'Excelencia', descripcion: 'Formación de calidad con estándares internacionales' },
  { icono: <Heart className="w-6 h-6" />, titulo: 'Compromiso', descripcion: 'Dedicación total con cada estudiante' },
  { icono: <Globe className="w-6 h-6" />, titulo: 'Innovación', descripcion: 'Tecnología de vanguardia en enseñanza' },
  { icono: <Shield className="w-6 h-6" />, titulo: 'Ética', descripcion: 'Valores sólidos en cada profesional' },
];

const metodologia = [
  { icono: <BookOpen className="w-8 h-8" />, titulo: 'Clases Teóricas', descripcion: 'Fundamentos técnicos y conceptos fundamentales impartidos por profesores especializados.' },
  { icono: <Laptop className="w-8 h-8" />, titulo: 'Prácticas en Talleres', descripcion: 'Experiencia hands-on con equipos y tecnología de última generación.' },
  { icono: <Users className="w-8 h-8" />, titulo: 'Tutorías', descripcion: 'Seguimiento personalizado para asegurar tu éxito académico.' },
  { icono: <Briefcase className="w-8 h-8" />, titulo: 'Prácticas Profesionales', descripcion: 'Conexión con empresas del sector para tu inserción laboral.' },
];

const autoridades = [
  { nombre: 'Lic. Juan Pérez', rol: 'Director General', imagen: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { nombre: 'Ing. María López', rol: 'Jefe Académico', imagen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { nombre: 'Lic. Carlos Mamani', rol: 'Secretario Académico', imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
];

export default function HomePage() {
  const { institucion } = usarInstitucion();
  const [diapositivaActual, setDiapositivaActual] = useState(0);
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  useEffect(() => {
    const temporizador = setInterval(() => {
      setDiapositivaActual((anterior) => (anterior + 1) % imagenesHeroe.length);
    }, 5000);
    return () => clearInterval(temporizador);
  }, []);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setSeccionActiva(entrada.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -30% 0px' }
    );

    const secciones = document.querySelectorAll('[data-section]');
    secciones.forEach((seccion) => observador.observe(seccion));

    return () => observador.disconnect();
  }, []);

  const siguienteDiapositiva = () => setDiapositivaActual((anterior) => (anterior + 1) % imagenesHeroe.length);
  const diapositivaAnterior = () => setDiapositivaActual((anterior) => (anterior - 1 + imagenesHeroe.length) % imagenesHeroe.length);

  const elementosNavegacion = [
    { id: 'inicio', etiqueta: 'Inicio', icono: <Home className="w-5 h-5" /> },
    { id: 'nosotros', etiqueta: 'Nosotros', icono: <Info className="w-5 h-5" /> },
    { id: 'valores', etiqueta: 'Valores', icono: <HeartHandshake className="w-5 h-5" /> },
    { id: 'carreras', etiqueta: 'Carreras', icono: <GraduationCapIcon className="w-5 h-5" /> },
    { id: 'metodologia', etiqueta: 'Metodología', icono: <Lightbulb className="w-5 h-5" /> },
    { id: 'autoridades', etiqueta: 'Autoridades', icono: <User className="w-5 h-5" /> },
    { id: 'ubicacion', etiqueta: 'Ubicación', icono: <MapPinIcon className="w-5 h-5" /> },
  ];

  const desplazarASeccion = (id: string) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-dark-900">
      {/* Navegación lateral */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {elementosNavegacion.map((elemento) => (
          <button
            key={elemento.id}
            onClick={() => desplazarASeccion(elemento.id)}
            className={`group relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
              seccionActiva === elemento.id
                ? 'bg-primary-500 text-dark-900'
                : 'bg-dark-700/80 text-gray-400 hover:bg-dark-600 hover:text-primary-400'
            }`}
            title={elemento.etiqueta}
          >
            {elemento.icono}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-dark-700 text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {elemento.etiqueta}
            </span>
          </button>
        ))}
      </nav>

      {/* Carrusel principal */}
      <section id="inicio" data-section className="relative h-[65vh] min-h-[500px] overflow-hidden">
        {imagenesHeroe.map((imagen, indice) => (
          <div
            key={indice}
            className={`absolute inset-0 transition-opacity duration-1000 ${indice === diapositivaActual ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 z-10">
              <img src={imagen.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-dark-900/75 z-10" />

            <div className="relative z-20 h-full flex items-center justify-center text-center">
              <div className="max-w-4xl px-4 sm:px-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100 mb-4 sm:mb-6 tracking-tight leading-tight">
                  {imagen.titulo}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-primary-400 mb-6 sm:mb-10 max-w-2xl mx-auto">
                  {imagen.subtitulo}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/admision/pre-registro" className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-primary-500 text-dark-900 font-bold rounded-lg hover:bg-primary-400 transition-all text-base sm:text-lg">
                    Pre-registro ahora
                  </Link>
                  <Link href="/carreras" className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border-2 border-primary-500 text-primary-400 font-bold rounded-lg hover:bg-primary-500/10 transition-all text-base sm:text-lg">
                    Ver carreras
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={diapositivaAnterior} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-600 transition-all">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
        </button>
        <button onClick={siguienteDiapositiva} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-dark-600 transition-all">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {imagenesHeroe.map((_, indice) => (
            <button
              key={indice}
              onClick={() => setDiapositivaActual(indice)}
              className={`w-3 h-3 rounded-full transition-all ${indice === diapositivaActual ? 'bg-primary-400 w-8' : 'bg-gray-500'}`}
            />
          ))}
        </div>
      </section>

      {/* Acerca de */}
      <section id="nosotros" data-section className="bg-dark-900 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-100 mb-6">
              Formación <span className="text-primary-400">Técnica</span> de Excelencia
            </h2>
            <p className="text-xl text-gray-400">
              {institucion?.lema || 'Conectando Mentes, Impulsando el Progreso'}
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

      {/* Valores */}
      <section id="valores" data-section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestros Valores</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Los principios que guían nuestra formación profesional
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {valores.map((value, indice) => (
              <div key={indice} className="text-center p-6 bg-dark-700 rounded-xl border border-dark-600 hover:border-primary-500/50 transition-colors">
                <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {value.icono}
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2">{value.titulo}</h4>
                <p className="text-gray-400 text-sm">{value.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carreras */}
      <section id="carreras" data-section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestras Carreras</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Programas técnicos superiores autorizados por el Ministerio de Educación
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {carreras.map((carrera, indice) => (
              <div key={indice} className="bg-dark-700 border border-dark-600 rounded-xl p-8 hover:border-primary-500/50 transition-all">
                <div className={`inline-flex p-4 rounded-xl mb-4 ${carrera.color}`}>
                  {carrera.icono}
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">{carrera.nombre}</h3>
                <p className="text-primary-400 font-medium mb-4">{carrera.titulo}</p>
                <p className="text-gray-400 mb-6">{carrera.descripcion}</p>
                <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                  <span className="text-sm text-gray-500">{carrera.codigo}</span>
                  <Link href="/carreras" className="text-primary-400 font-medium text-sm hover:text-primary-300 flex items-center gap-1">
                    Ver plan <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" data-section className="bg-dark-800 py-24 border-y border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Nuestra Metodología</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Combinamos experiencia práctica con conocimiento académico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metodologia.map((elemento, indice) => (
              <div key={indice} className="bg-dark-700 rounded-xl p-6 border border-dark-600 hover:border-primary-500/50 transition-colors">
                <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center mb-4">
                  {elemento.icono}
                </div>
                <h4 className="text-lg font-bold text-gray-100 mb-2">{elemento.titulo}</h4>
                <p className="text-gray-400 text-sm">{elemento.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
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

      {/* Autoridades */}
      <section id="autoridades" data-section className="bg-dark-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Autoridades</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nuestro equipo de dirección y gestión académica
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {autoridades.map((autoridad, indice) => (
              <div key={indice} className="text-center">
                <img src={autoridad.imagen} alt={autoridad.nombre} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-dark-600" />
                <h4 className="text-lg font-bold text-gray-100">{autoridad.nombre}</h4>
                <p className="text-primary-400 font-medium">{autoridad.rol}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" data-section className="bg-dark-800 py-16 sm:py-24 border-t border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 mb-4 sm:mb-6">Encuéntranos</h2>
              <p className="text-gray-400 mb-8">
                Estamos ubicados en una zona de fácil acceso en la ciudad de {institucion?.ciudad || 'El Alto'}.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Dirección</h4>
                    <p className="text-gray-400">{institucion?.direccion || 'Av. de los Heroes, Z. Ferropetrol N.- 11'}, {institucion?.ciudad || 'El Alto'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Teléfono</h4>
                    <p className="text-gray-400">{institucion?.telefono || '7525247'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-100">Correo</h4>
                    <p className="text-gray-400">{institucion?.correo || 'ITBT@edu.bo'}</p>
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
            <div className="rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-auto min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1893.8396095475862!2d-68.1708826691198!3d-16.504407754821006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915edff3f214c707%3A0x53da8aae1940d8d!2sInstiuto%20Boliviana%20de%20Tecnolog%C3%ADa!5e0!3m2!1ses-419!2sbo!4v1791038047614!5m2!1ses-419!2sbo"
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

      {/* Llamada a la acción */}
      <section className="bg-dark-700 py-24 border-t border-dark-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-6">¿Listo para comenzar tu carrera técnica?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Inscríbete ahora y forma parte del {institucion?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
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
