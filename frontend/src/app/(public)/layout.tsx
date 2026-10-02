'use client';

import { InstitutionProvider } from '@/contexts/InstitutionContext';
import PublicLayout from '@/components/layout/PublicLayout';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <InstitutionProvider>
      <PublicLayout>{children}</PublicLayout>
    </InstitutionProvider>
  );
}
