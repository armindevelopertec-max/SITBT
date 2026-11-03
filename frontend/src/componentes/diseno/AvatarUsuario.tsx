import { User } from 'lucide-react';
import { cn } from '@/libreria/utilidades';

interface PropsAvatarUsuario {
  className?: string;
}

/** Avatar genérico del usuario, compartido por el encabezado y las barras laterales. */
export function AvatarUsuario({ className }: PropsAvatarUsuario) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10',
        className
      )}
      aria-hidden="true"
    >
      <User className="h-4 w-4 text-primary" />
    </div>
  );
}
