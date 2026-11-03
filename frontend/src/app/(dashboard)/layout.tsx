'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  normalizarUsuario,
  usarAlmacenAutenticacion,
} from '@/almacen/almacen-autenticacion';
import BarraLateral from '@/componentes/diseno/BarraLateral';
import Encabezado from '@/componentes/diseno/Encabezado';
import api from '@/libreria/api';
import { tienePortalPropio, rutaInicio } from '@/libreria/autenticacion';
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
  const { estaAutenticado, _hidratado, establecerUsuario, usuario } =
    usarAlmacenAutenticacion();

  useEffect(() => {
    if (!estaAutenticado) return;

    let activo = true;
    api
      .get('/autenticacion/perfil')
      .then((respuesta) => {
        if (activo && respuesta.data) {
          establecerUsuario(normalizarUsuario(respuesta.data));
        }
      })
      .catch(() => {
        // Si el token ya no es válido, el interceptor de la API cierra la sesión.
      });

    return () => {
      activo = false;
    };
  }, [estaAutenticado, establecerUsuario]);

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

  // Docentes y estudiantes tienen su propia interfaz: no entran al panel.
  useEffect(() => {
    if (_hidratado && estaAutenticado && tienePortalPropio(usuario)) {
      router.replace(rutaInicio(usuario));
    }
  }, [_hidratado, estaAutenticado, usuario, router]);

  if (!_hidratado) {
    return null;
  }

  if (!estaAutenticado || tienePortalPropio(usuario)) {
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
    <div className="min-h-screen bg-background">
      <BarraLateral
        colapsada={esMovil ? false : barraLateralColapsada}
        abierta={esMovil ? barraLateralAbierta : true}
        alCerrar={() => setBarraLateralAbierta(false)}
        alColapsar={() => setBarraLateralColapsada(!barraLateralColapsada)}
      />
      <div
        className={cn(
          'transition-all duration-300',
          esMovil ? '' : (barraLateralColapsada ? 'ml-16' : 'ml-64')
        )}
      >
        <Encabezado alHacerClicMenu={manejarClicMenu} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
