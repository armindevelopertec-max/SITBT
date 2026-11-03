'use client';

import Link from 'next/link';
import { GraduationCap, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { usarInstitucion } from '@/contextos/ContextoInstitucional';
import { SelectorTema } from './SelectorTema';

export default function DisenoPublico({ children }: { children: React.ReactNode }) {
  const { institucion } = usarInstitucion();
  const pathname = usePathname();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const logoUrl = institucion?.logoUrl;
  const nombreInstitucion = institucion?.nombreCorto || 'ITBT';

  const elementosNav = [
    { href: '/', etiqueta: 'Inicio' },
    { href: '/carreras', etiqueta: 'Carreras' },
    { href: '/admision', etiqueta: 'Admisión' },
    { href: '/instituto', etiqueta: 'Instituto' },
    { href: '/contacto', etiqueta: 'Contacto' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={nombreInstitucion}
                  className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <GraduationCap className="w-9 h-9 text-primary" />
              )}
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground tracking-tight leading-tight">{nombreInstitucion}</span>
                <span className="text-xs text-primary tracking-wider">TÉCNICO SUPERIOR</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {elementosNav.map((elemento) => (
                <Link
                  key={elemento.href}
                  href={elemento.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === elemento.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {elemento.etiqueta}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <SelectorTema variante="publico" />
              <Link
                href="/acceder"
                className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-accent transition-colors"
              >
                Acceder
              </Link>
              <Link
                href="/admision/pre-registro"
                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Pre-registro
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <SelectorTema variante="publico" />
              <button
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className="p-2 -mr-2 text-muted-foreground hover:text-primary rounded-lg"
                aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
              >
                {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {menuMovilAbierto && (
            <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-1">
                {elementosNav.map((elemento) => (
                  <Link
                    key={elemento.href}
                    href={elemento.href}
                    onClick={() => setMenuMovilAbierto(false)}
                    className={`px-4 py-3 text-base font-medium rounded-lg ${
                      pathname === elemento.href
                        ? 'bg-accent text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-primary'
                    }`}
                  >
                    {elemento.etiqueta}
                  </Link>
                ))}
                <Link
                  href="/acceder"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="px-4 py-3 border border-border text-foreground text-base font-medium rounded-lg text-center hover:bg-accent"
                >
                  Acceder
                </Link>
                <Link
                  href="/admision/pre-registro"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="mt-2 px-4 py-3 bg-primary text-primary-foreground text-base font-semibold rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  Pre-registro
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-card border-t border-border text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={nombreInstitucion}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <GraduationCap className="w-8 h-8 text-primary" />
                )}
                <div className="flex flex-col">
                  <span className="text-base lg:text-lg font-bold text-foreground leading-tight">{nombreInstitucion}</span>
                  <span className="text-xs text-primary tracking-wider">TÉCNICO SUPERIOR</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {institucion?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {institucion?.ciudad || 'El Alto'}, {institucion?.pais || 'Bolivia'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Enlaces</h3>
              <ul className="space-y-3">
                <li><Link href="/carreras" className="text-muted-foreground hover:text-primary transition-colors text-sm">Carreras</Link></li>
                <li><Link href="/admision" className="text-muted-foreground hover:text-primary transition-colors text-sm">Admisión</Link></li>
                <li><Link href="/instituto" className="text-muted-foreground hover:text-primary transition-colors text-sm">Instituto</Link></li>
                <li><Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/legal/politica-privacidad" className="text-muted-foreground hover:text-primary transition-colors text-sm">Política de Privacidad</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{institucion?.direccion || 'Av. de los Heroes, Z. Ferropetrol'}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{institucion?.telefono || '7525247'}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{institucion?.correo || 'ITBT@edu.bo'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 lg:mt-12 pt-6 lg:pt-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {nombreInstitucion}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
