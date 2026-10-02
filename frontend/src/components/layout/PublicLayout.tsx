'use client';

import Link from 'next/link';
import { GraduationCap, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useInstitution } from '@/contexts/InstitutionContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { institution } = useInstitution();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoUrl = institution?.logo_url;
  const institutionName = institution?.nombre_corto || 'ITBT';

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/carreras', label: 'Carreras' },
    { href: '/admision', label: 'Admisión' },
    { href: '/instituto', label: 'Instituto' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={institutionName}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <GraduationCap className="w-8 h-8 text-primary-400" />
              )}
              <span className="text-xl font-bold text-gray-100 tracking-tight">{institutionName}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary-400'
                      : 'text-gray-400 hover:text-primary-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/admision/pre-registro"
                className="px-5 py-2 bg-primary-500 text-dark-900 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors"
              >
                Pre-registro
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-400 hover:text-primary-300 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-dark-600">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-base font-medium rounded-lg ${
                      pathname === item.href
                        ? 'bg-dark-700 text-primary-400'
                        : 'text-gray-400 hover:bg-dark-700 hover:text-primary-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/admision/pre-registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 px-4 py-3 bg-primary-500 text-dark-900 text-base font-semibold rounded-lg text-center"
                >
                  Pre-registro
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-dark-800 border-t border-dark-600 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={institutionName}
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <GraduationCap className="w-8 h-8 text-primary-400" />
                )}
                <span className="text-xl font-bold">{institutionName}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {institution?.nombre || 'Instituto Tecnológico Boliviano de Tecnología'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {institution?.ciudad || 'El Alto'}, {institution?.pais || 'Bolivia'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Enlaces</h3>
              <ul className="space-y-3">
                <li><Link href="/carreras" className="text-gray-400 hover:text-primary-300 transition-colors text-sm">Carreras</Link></li>
                <li><Link href="/admision" className="text-gray-400 hover:text-primary-300 transition-colors text-sm">Admisión</Link></li>
                <li><Link href="/instituto" className="text-gray-400 hover:text-primary-300 transition-colors text-sm">Instituto</Link></li>
                <li><Link href="/contacto" className="text-gray-400 hover:text-primary-300 transition-colors text-sm">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/legal/politica-privacidad" className="text-gray-400 hover:text-primary-300 transition-colors text-sm">Política de Privacidad</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Contacto</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{institution?.direccion || 'Av. de los Heroes, Z. Ferropetrol'}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{institution?.telefono || '7525247'}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{institution?.email || 'ITBT@edu.bo'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-600 mt-12 pt-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {institutionName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
