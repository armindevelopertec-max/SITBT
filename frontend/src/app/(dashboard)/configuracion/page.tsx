import { redirect } from 'next/navigation';

// Índice de la sección Configuración: las migas de pan de varias páginas
// enlazan a /configuracion, así que redirige a la primera pestaña.
export default function PaginaConfiguracion() {
  redirect('/configuracion/institucion');
}
