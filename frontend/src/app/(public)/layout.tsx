'use client';

import { ProveedorInstitucion } from '@/contextos/ContextoInstitucional';
import DisenoPublico from '@/componentes/diseno/DisenoPublico';

export default function EnvoltorioDiseno({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorInstitucion>
      <DisenoPublico>{children}</DisenoPublico>
    </ProveedorInstitucion>
  );
}
