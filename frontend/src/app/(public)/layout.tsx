'use client';

import { ProveedorInstitucion } from '@/contexts/ContextoInstitucional';
import DisenoPublico from '@/components/layout/DisenoPublico';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorInstitucion>
      <DisenoPublico>{children}</DisenoPublico>
    </ProveedorInstitucion>
  );
}
