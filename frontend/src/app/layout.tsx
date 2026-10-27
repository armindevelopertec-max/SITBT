import type { Metadata } from 'next';
import './globales.css';
import { ProveedorTema } from '@/tema/proveedor-tema';

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
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}
