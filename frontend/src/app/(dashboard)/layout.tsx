'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import BarraLateral from '@/componentes/diseno/BarraLateral';
import Encabezado from '@/componentes/diseno/Encabezado';
import { cn } from '@/libreria/utilidades';

export default function DisenoPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const [barraLateralAbierta, setBarraLateralAbierta] = useState(true);
  const [barraLateralColapsada, setBarraLateralColapsada] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const router = useRouter();
  const { estaAutenticado, _hidratado } = usarAlmacenAutenticacion();

  useEffect(() => {
    const verificarMovil = () => {
      setEsMovil(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setBarraLateralAbierta(false);
      } else {
        setBarraLateralAbierta(true);
      }
    };
    verificarMovil();
    window.addEventListener('resize', verificarMovil);
    return () => window.removeEventListener('resize', verificarMovil);
  }, []);

  useEffect(() => {
    if (_hidratado && !estaAutenticado) {
      router.push('/acceder');
    }
  }, [_hidratado, estaAutenticado, router]);

  if (!_hidratado) {
    return null;
  }

  if (!estaAutenticado) {
    return null;
  }

  const manejarClicMenu = () => {
    if (esMovil) {
      setBarraLateralAbierta(!barraLateralAbierta);
    } else {
      setBarraLateralColapsada(!barraLateralColapsada);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BarraLateral
        colapsada={esMovil ? false : barraLateralColapsada}
        abierta={esMovil ? barraLateralAbierta : true}
        alCerrar={() => setBarraLateralAbierta(false)}
        alColapsar={() => setBarraLateralColapsada(!barraLateralColapsada)}
      />
      {esMovil && barraLateralAbierta && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setBarraLateralAbierta(false)}
        />
      )}
      <div
        className={cn(
          'transition-all duration-300',
          esMovil ? '' : (barraLateralColapsada ? 'ml-16' : 'ml-64')
        )}
      >
        <Encabezado alHacerClicMenu={manejarClicMenu} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
