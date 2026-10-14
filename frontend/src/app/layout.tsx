import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SITBT - Sistema de Gestión Académica',
  description: 'Instituto Tecnológico Boliviano de Tecnología - Sistema de Gestión Académica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
