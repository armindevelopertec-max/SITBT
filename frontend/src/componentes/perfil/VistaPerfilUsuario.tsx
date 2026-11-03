'use client';

import { useCallback, useEffect, useState } from 'react';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { api } from '@/libreria/api';
import { rutaInicio } from '@/libreria/autenticacion';
import { formatearFecha, mensajeDeError } from '@/libreria/utilidades';
import { Loader2, Mail, Phone, RefreshCw, UserCircle } from 'lucide-react';

interface PersonaPerfil {
  ci?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string | null;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fotoUrl?: string;
  estado?: string;
}

interface PerfilUsuario {
  nombreUsuario: string;
  persona?: PersonaPerfil | null;
  estado?: string;
}

const nombreCompleto = (persona?: PersonaPerfil | null) => {
  if (!persona) return '';
  return [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
};

const iniciales = (texto: string) => {
  const partes = texto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes[1]?.[0] || '')).toUpperCase();
};

/**
 * Vista de solo lectura del perfil del usuario autenticado.
 * La comparten el panel administrativo y las interfaces de docente y
 * estudiante, para que "Mi perfil" se vea igual en todo el sistema.
 */
export default function VistaPerfilUsuario() {
  const { usuario } = usarAlmacenAutenticacion();
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const cargarPerfil = useCallback(async () => {
    setActualizando(true);
    setError(null);
    try {
      const respuesta = await api.get('/autenticacion/perfil');
      setPerfil(respuesta.data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cargar el perfil'));
    } finally {
      setActualizando(false);
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  const enlaceInicio = rutaInicio(usuario);

  if (error || !perfil) {
    return (
      <div className="space-y-6">
        <Migas
          elementos={[
            { etiqueta: 'Inicio', href: enlaceInicio },
            { etiqueta: 'Mi perfil' },
          ]}
        />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300">
          {error || 'No se pudo cargar el perfil.'}
        </div>
        <Boton variante="contorno" onClick={cargarPerfil} disabled={actualizando}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Boton>
      </div>
    );
  }

  const persona = perfil.persona;
  const nombre = nombreCompleto(persona) || perfil.nombreUsuario;

  const datosPersonales = [
    { etiqueta: 'Nombres', valor: persona?.nombres },
    { etiqueta: 'Apellido paterno', valor: persona?.apellidoPaterno },
    { etiqueta: 'Apellido materno', valor: persona?.apellidoMaterno },
    { etiqueta: 'Carnet de identidad', valor: persona?.ci },
    {
      etiqueta: 'Fecha de nacimiento',
      valor: persona?.fechaNacimiento
        ? formatearFecha(persona.fechaNacimiento)
        : null,
    },
    { etiqueta: 'Lugar de nacimiento', valor: persona?.lugarNacimiento },
    {
      etiqueta: 'Género',
      valor:
        persona?.genero === 'M'
          ? 'Masculino'
          : persona?.genero === 'F'
            ? 'Femenino'
            : persona?.genero,
    },
    { etiqueta: 'Estado civil', valor: persona?.estadoCivil },
    { etiqueta: 'Nacionalidad', valor: persona?.nacionalidad },
  ];

  const datosCuenta = [
    { etiqueta: 'Usuario', valor: perfil.nombreUsuario },
    {
      etiqueta: 'Estado',
      valor: perfil.estado === 'activo' ? 'Activo' : 'Inactivo',
    },
  ];

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Inicio', href: enlaceInicio },
          { etiqueta: 'Mi perfil' },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>
          <p className="mt-1 text-muted-foreground">
            Consulta tus datos personales y de la cuenta.
          </p>
        </div>
        <Boton
          variante="contorno"
          onClick={cargarPerfil}
          disabled={actualizando}
        >
          {actualizando ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualizar
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <ContenidoTarjeta>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {persona?.fotoUrl ? (
              <img
                src={persona.fotoUrl}
                alt={nombre}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                  {iniciales(nombre)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-foreground">{nombre}</h2>
              <p className="text-sm text-muted-foreground">
                {perfil.nombreUsuario}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Insignia
                  variante={perfil.estado === 'activo' ? 'exito' : 'error'}
                >
                  {perfil.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Insignia>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{persona?.correo || 'Sin correo registrado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{persona?.telefono || 'Sin teléfono registrado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span>CI: {persona?.ci || '—'}</span>
            </div>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta>Datos personales</TituloTarjeta>
              <DescripcionTarjeta>
                Información registrada en la institución
              </DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {datosPersonales.map((dato) => (
                  <div key={dato.etiqueta}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {dato.etiqueta}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {dato.valor || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta>Datos de contacto</TituloTarjeta>
              <DescripcionTarjeta>
                Medios de contacto registrados
              </DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Teléfono
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {persona?.telefono || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Correo electrónico
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {persona?.correo || '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dirección
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {persona?.direccion || '—'}
                  </dd>
                </div>
              </dl>
            </ContenidoTarjeta>
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta>Datos de cuenta</TituloTarjeta>
              <DescripcionTarjeta>Acceso al sistema</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <dl className="space-y-4">
                {datosCuenta.map((dato) => (
                  <div key={dato.etiqueta}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {dato.etiqueta}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {dato.valor}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                Si tus datos no son correctos, comunícate con el área
                administrativa.
              </p>
            </ContenidoTarjeta>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
