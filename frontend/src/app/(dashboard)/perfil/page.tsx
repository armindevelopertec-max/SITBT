'use client';

import { useEffect, useState } from 'react';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { api } from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Insignia } from '@/componentes/iu/insignia';
import { Loader2, User, Mail, Phone, MapPin, Calendar, CreditCard, Shield, RefreshCw, Briefcase } from 'lucide-react';

interface Persona {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  lugarNacimiento?: string | null;
  genero?: string;
  estadoCivil?: string | null;
  nacionalidad?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  fotoUrl?: string | null;
  estado?: string;
}

interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface Perfil {
  id: number;
  nombreUsuario: string;
  personaId: number;
  persona?: Persona;
  roles?: Rol[];
}

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleDateString('es-BO');
  } catch {
    return fecha;
  }
};

const nombreCompleto = (persona?: Persona) => {
  if (!persona) return '—';
  const partes = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter(Boolean);
  return partes.join(' ') || '—';
};

export default function PaginaPerfil() {
  const { usuario } = usarAlmacenAutenticacion();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarPerfil = async () => {
    setCargando(true);
    setError('');
    try {
      const respuesta = await api.get('/autenticacion/perfil');
      setPerfil(respuesta.data);
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo cargar la información del perfil'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const datos = perfil || usuario;
  const persona = datos?.persona as Persona | undefined;

  return (
    <div className="space-y-6">
      <Migas
        elementos={[
          { etiqueta: 'Panel', href: '/panel' },
          { etiqueta: 'Mi perfil' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-600 mt-1">Información de la cuenta y datos personales</p>
        </div>
        <Boton variante="contorno" onClick={cargarPerfil} disabled={cargando}>
          {cargando ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Actualizar
        </Boton>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {cargando && !datos ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Tarjeta variante="conBorde">
              <ContenidoTarjeta className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{nombreCompleto(persona)}</h2>
                <p className="text-gray-500 mt-1">@{datos?.nombreUsuario}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {(datos?.roles || []).map((rol: Rol) => (
                    <Insignia key={rol.id} variante="primario">
                      {rol.nombre || rol.codigo}
                    </Insignia>
                  ))}
                  {(!datos?.roles || datos.roles.length === 0) && (
                    <Insignia variante="contorno">{(datos as any)?.rol || 'Sin rol'}</Insignia>
                  )}
                </div>
              </ContenidoTarjeta>
            </Tarjeta>

            <Tarjeta variante="conBorde">
              <EncabezadoTarjeta>
                <TituloTarjeta>Datos de cuenta</TituloTarjeta>
              </EncabezadoTarjeta>
              <ContenidoTarjeta className="space-y-3">
                <Dato etiqueta="ID de usuario" valor={String(datos?.id || '—')} icono={<CreditCard className="w-4 h-4" />} />
                <Dato etiqueta="Nombre de usuario" valor={datos?.nombreUsuario || '—'} icono={<User className="w-4 h-4" />} />
                <Dato etiqueta="ID de persona" valor={String(datos?.personaId || persona?.id || '—')} icono={<CreditCard className="w-4 h-4" />} />
                <Dato etiqueta="Roles" valor={(datos?.roles || []).map((r: Rol) => r.nombre || r.codigo).join(', ') || '—'} icono={<Shield className="w-4 h-4" />} />
              </ContenidoTarjeta>
            </Tarjeta>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tarjeta variante="conBorde">
              <EncabezadoTarjeta>
                <TituloTarjeta>Datos personales</TituloTarjeta>
              </EncabezadoTarjeta>
              <ContenidoTarjeta>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dato etiqueta="Nombres" valor={persona?.nombres || '—'} />
                  <Dato etiqueta="Apellido paterno" valor={persona?.apellidoPaterno || '—'} />
                  <Dato etiqueta="Apellido materno" valor={persona?.apellidoMaterno || '—'} />
                  <Dato etiqueta="Cédula de identidad" valor={persona?.ci || '—'} icono={<CreditCard className="w-4 h-4" />} />
                  <Dato etiqueta="Fecha de nacimiento" valor={formatearFecha(persona?.fechaNacimiento)} icono={<Calendar className="w-4 h-4" />} />
                  <Dato etiqueta="Lugar de nacimiento" valor={persona?.lugarNacimiento || '—'} />
                  <Dato etiqueta="Género" valor={persona?.genero === 'M' ? 'Masculino' : persona?.genero === 'F' ? 'Femenino' : persona?.genero || '—'} />
                  <Dato etiqueta="Estado civil" valor={persona?.estadoCivil || '—'} icono={<Briefcase className="w-4 h-4" />} />
                  <Dato etiqueta="Nacionalidad" valor={persona?.nacionalidad || '—'} />
                </div>
              </ContenidoTarjeta>
            </Tarjeta>

            <Tarjeta variante="conBorde">
              <EncabezadoTarjeta>
                <TituloTarjeta>Datos de contacto</TituloTarjeta>
              </EncabezadoTarjeta>
              <ContenidoTarjeta>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dato etiqueta="Teléfono" valor={persona?.telefono || '—'} icono={<Phone className="w-4 h-4" />} />
                  <Dato etiqueta="Correo electrónico" valor={persona?.correo || '—'} icono={<Mail className="w-4 h-4" />} />
                  <div className="md:col-span-2">
                    <Dato etiqueta="Dirección" valor={persona?.direccion || '—'} icono={<MapPin className="w-4 h-4" />} />
                  </div>
                </div>
              </ContenidoTarjeta>
            </Tarjeta>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ etiqueta, valor, icono }: { etiqueta: string; valor: string; icono?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icono && <div className="mt-0.5 text-gray-400">{icono}</div>}
      <div>
        <p className="text-xs text-gray-500">{etiqueta}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{valor}</p>
      </div>
    </div>
  );
}
