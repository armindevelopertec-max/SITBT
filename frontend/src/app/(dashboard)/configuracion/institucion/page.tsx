'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { CargarImagen } from '@/components/ui/cargar-imagen';
import { usarConfiguracionInstitucional } from '@/hooks/usarConfiguracionInstitucional';
import { Save, Building2, Phone, MapPin, Pencil, X } from 'lucide-react';
import api from '@/lib/api';

const esquemaConfiguracion = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nombreCorto: z.string().min(1, 'El nombre corto es requerido'),
  lema: z.string().optional(),
  logoUrl: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  departamento: z.string().optional(),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  sitioWeb: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional(),
  descripcion: z.string().optional(),
});

type FormularioConfiguracion = z.infer<typeof esquemaConfiguracion>;

export default function PaginaConfiguracion() {
  const { configuracion, cargando, recargar } = usarConfiguracionInstitucional();
  const [esEditando, setEsEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ type: 'success' | 'error'; texto: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioConfiguracion>({
    resolver: zodResolver(esquemaConfiguracion),
  });

  useEffect(() => {
    if (configuracion) {
      setLogoUrl(configuracion.logoUrl || '');
    }
  }, [configuracion]);

  if (cargando) {
    return (
      <div className="space-y-6">
        <Migas elementos={[{ etiqueta: 'Configuración' }, { etiqueta: 'Institución' }]} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const onSubmit = async (datos: FormularioConfiguracion) => {
    try {
      setGuardando(true);
      setMensaje(null);
      const datosEnviar = { ...datos, logoUrl: logoUrl };
      await api.put('/configuracion-institucional', datosEnviar);
      setMensaje({ type: 'success', texto: 'Configuración guardada correctamente' });
      setEsEditando(false);
      recargar();
    } catch (error: any) {
      setMensaje({
        type: 'error',
        texto: error.response?.data?.mensaje || 'Error al guardar la configuración',
      });
    } finally {
      setGuardando(false);
    }
  };

  const editar = () => {
    if (configuracion) {
      setLogoUrl(configuracion.logoUrl || '');
      reset({
        nombre: configuracion.nombre || '',
        nombreCorto: configuracion.nombreCorto || '',
        lema: configuracion.lema || '',
        logoUrl: configuracion.logoUrl || '',
        direccion: configuracion.direccion || '',
        telefono: configuracion.telefono || '',
        departamento: configuracion.departamento || '',
        correo: configuracion.correo || '',
        sitioWeb: configuracion.sitioWeb || '',
        ciudad: configuracion.ciudad || '',
        pais: configuracion.pais || '',
        descripcion: '',
      });
    }
    setEsEditando(true);
    setMensaje(null);
  };

  const cancelar = () => {
    setEsEditando(false);
    setMensaje(null);
  };

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Configuración' }, { etiqueta: 'Institución' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración Institucional</h1>
          <p className="text-gray-500 mt-1">
            Datos de la institución que aparecerán en certificados y documentos
          </p>
        </div>
        {!esEditando && (
          <Boton onClick={editar}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Boton>
        )}
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-lg ${
            mensaje.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {esEditando ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos Generales
              </TituloTarjeta>
              <DescripcionTarjeta>Información básica de la institución</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Entrada
                etiqueta="Nombre Completo"
                placeholder="Instituto Tecnológico Boliviana de Tecnología"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              <Entrada
                etiqueta="Nombre Corto / Sigla"
                placeholder="SITBT"
                error={errors.nombreCorto?.message}
                {...register('nombreCorto')}
              />
              <div className="md:col-span-2">
                <Entrada
                  etiqueta="Lema"
                  placeholder="Formando profesionales técnicos de excelencia"
                  {...register('lema')}
                />
              </div>
              <div className="md:col-span-2">
                <Entrada
                  etiqueta="Descripción"
                  placeholder="Breve descripción de la institución..."
                  {...register('descripcion')}
                />
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </TituloTarjeta>
              <DescripcionTarjeta>Logo institucional que aparecerá en documentos</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <CargarImagen
                etiqueta="Logo de la Institución"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                textoAyuda="PNG, JPG o WEBP (máx. 5MB). El logo se subirá a MinIO automáticamente."
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </TituloTarjeta>
              <DescripcionTarjeta>Dirección y ubicación geográfica</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Entrada
                  etiqueta="Dirección"
                  placeholder="Av. Bolivia No. 1234, Zona Central"
                  {...register('direccion')}
                />
              </div>
              <Entrada
                etiqueta="Ciudad"
                placeholder="La Paz"
                {...register('ciudad')}
              />
              <Entrada
                etiqueta="País"
                placeholder="Bolivia"
                {...register('pais')}
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto
              </TituloTarjeta>
              <DescripcionTarjeta>Información de contacto oficial</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Entrada
                etiqueta="Teléfono"
                placeholder="+591 2 1234567"
                {...register('telefono')}
              />
              <Entrada
                etiqueta="Departamento"
                placeholder="La Paz"
                {...register('departamento')}
              />
              <Entrada
                etiqueta="Correo"
                placeholder="contacto@sitbt.edu.bo"
                error={errors.correo?.message}
                {...register('correo')}
              />
              <Entrada
                etiqueta="Sitio Web"
                placeholder="https://www.sitbt.edu.bo"
                {...register('sitioWeb')}
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <div className="flex justify-end gap-3">
            <Boton type="button" variante="contorno" onClick={cancelar}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Boton>
            <Boton type="submit" cargando={guardando}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Boton>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos Generales
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="text-gray-900">{configuracion?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Corto / Sigla</p>
                  <p className="text-gray-900">{configuracion?.nombreCorto || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Lema</p>
                  <p className="text-gray-900">{configuracion?.lema || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="text-gray-900">{configuracion?.descripcion || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <div className="flex items-center gap-6">
                {configuracion?.logoUrl ? (
                  <img
                    src={configuracion.logoUrl}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Logo Institucional</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {configuracion?.logoUrl ? 'Logo actual' : 'Sin logo configurado'}
                  </p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="text-gray-900">{configuracion?.direccion || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ciudad</p>
                  <p className="text-gray-900">{configuracion?.ciudad || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">País</p>
                  <p className="text-gray-900">{configuracion?.pais || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variante="conBorde">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-gray-900">{configuracion?.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Departamento</p>
                  <p className="text-gray-900">{configuracion?.departamento || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo</p>
                  <p className="text-gray-900">{configuracion?.correo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                  <p className="text-gray-900">{configuracion?.sitioWeb || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        </div>
      )}
    </div>
  );
}
