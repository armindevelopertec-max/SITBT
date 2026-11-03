'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  normalizarUsuario,
  usarAlmacenAutenticacion,
} from '@/almacen/almacen-autenticacion';
import BarraLateralEstudiante from '@/componentes/diseno/BarraLateralEstudiante';
import Encabezado from '@/componentes/diseno/Encabezado';
import api from '@/libreria/api';
import { esEstudiantePuro } from '@/libreria/autenticacion';
import { cn } from '@/libreria/utilidades';

/**
 * Diseño exclusivo de la interfaz del estudiante: barra lateral propia con
 * "Mi Panel" y "Mis Materias". Es una interfaz de solo lectura.
 */
export default function DisenoEstudiante({
  children,
}: {
  children: React.ReactNode;
}) {
  const [barraLateralAbierta, setBarraLateralAbierta] = useState(false);
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
      const movil = window.innerWidth < 1024;
      setEsMovil(movil);
      setBarraLateralAbierta(!movil);
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

  // Solo el estudiante (sin roles internos) usa esta interfaz.
  useEffect(() => {
    if (
      _hidratado &&
      estaAutenticado &&
      usuario &&
      !esEstudiantePuro(usuario)
    ) {
      router.replace('/panel');
    }
  }, [_hidratado, estaAutenticado, usuario, router]);

  if (!_hidratado || !estaAutenticado) {
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
      <BarraLateralEstudiante
        colapsada={esMovil ? false : barraLateralColapsada}
        abierta={esMovil ? barraLateralAbierta : true}
        alCerrar={() => setBarraLateralAbierta(false)}
        alColapsar={() => setBarraLateralColapsada(!barraLateralColapsada)}
      />
      <div
        className={cn(
          'transition-all duration-300',
          esMovil ? '' : barraLateralColapsada ? 'ml-16' : 'ml-64',
        )}
      >
        <Encabezado alHacerClicMenu={manejarClicMenu} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
