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

const settingsSchema = z.object({
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

type SettingsForm = z.infer<typeof settingsSchema>;

export default function ConfiguracionPage() {
  const { settings, loading, refetch } = usarConfiguracionInstitucional();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logoUrl || '');
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Migas items={[{ label: 'Configuración' }, { label: 'Institución' }]} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: SettingsForm) => {
    try {
      setSaving(true);
      setMessage(null);
      const submitData = { ...data, logoUrl: logoUrl };
      await api.put('/configuracion-institucional', submitData);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.mensaje || 'Error al guardar la configuración',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (settings) {
      setLogoUrl(settings.logoUrl || '');
      reset({
        nombre: settings.nombre || '',
        nombreCorto: settings.nombreCorto || '',
        lema: settings.lema || '',
        logoUrl: settings.logoUrl || '',
        direccion: settings.direccion || '',
        telefono: settings.telefono || '',
        departamento: settings.departamento || '',
        correo: settings.correo || '',
        sitioWeb: settings.sitioWeb || '',
        ciudad: settings.ciudad || '',
        pais: settings.pais || '',
        descripcion: '',
      });
    }
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Configuración' }, { label: 'Institución' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración Institucional</h1>
          <p className="text-gray-500 mt-1">
            Datos de la institución que aparecerán en certificados y documentos
          </p>
        </div>
        {!isEditing && (
          <Boton onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Boton>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tarjeta variant="bordered">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos Generales
              </TituloTarjeta>
              <DescripcionTarjeta>Información básica de la institución</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Entrada
                label="Nombre Completo"
                placeholder="Instituto Tecnológico Boliviana de Tecnología"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              <Entrada
                label="Nombre Corto / Sigla"
                placeholder="SITBT"
                error={errors.nombreCorto?.message}
                {...register('nombreCorto')}
              />
              <div className="md:col-span-2">
                <Entrada
                  label="Lema"
                  placeholder="Formando profesionales técnicos de excelencia"
                  {...register('lema')}
                />
              </div>
              <div className="md:col-span-2">
                <Entrada
                  label="Descripción"
                  placeholder="Breve descripción de la institución..."
                  {...register('descripcion')}
                />
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </TituloTarjeta>
              <DescripcionTarjeta>Logo institucional que aparecerá en documentos</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <CargarImagen
                label="Logo de la Institución"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                helperText="PNG, JPG o WEBP (máx. 5MB). El logo se subirá a MinIO automáticamente."
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
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
                  label="Dirección"
                  placeholder="Av. Bolivia No. 1234, Zona Central"
                  {...register('direccion')}
                />
              </div>
              <Entrada
                label="Ciudad"
                placeholder="La Paz"
                {...register('ciudad')}
              />
              <Entrada
                label="País"
                placeholder="Bolivia"
                {...register('pais')}
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto
              </TituloTarjeta>
              <DescripcionTarjeta>Información de contacto oficial</DescripcionTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Entrada
                label="Teléfono"
                placeholder="+591 2 1234567"
                {...register('telefono')}
              />
              <Entrada
                label="Departamento"
                placeholder="La Paz"
                {...register('departamento')}
              />
              <Entrada
                label="Correo"
                placeholder="contacto@sitbt.edu.bo"
                error={errors.correo?.message}
                {...register('correo')}
              />
              <Entrada
                label="Sitio Web"
                placeholder="https://www.sitbt.edu.bo"
                {...register('sitioWeb')}
              />
            </ContenidoTarjeta>
          </Tarjeta>

          <div className="flex justify-end gap-3">
            <Boton type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Boton>
            <Boton type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Boton>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <Tarjeta variant="bordered">
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
                  <p className="text-gray-900">{settings?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Corto / Sigla</p>
                  <p className="text-gray-900">{settings?.nombreCorto || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Lema</p>
                  <p className="text-gray-900">{settings?.lema || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="text-gray-900">{settings?.descripcion || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
            <EncabezadoTarjeta>
              <TituloTarjeta className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </TituloTarjeta>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              <div className="flex items-center gap-6">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
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
                    {settings?.logoUrl ? 'Logo actual' : 'Sin logo configurado'}
                  </p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
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
                  <p className="text-gray-900">{settings?.direccion || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ciudad</p>
                  <p className="text-gray-900">{settings?.ciudad || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">País</p>
                  <p className="text-gray-900">{settings?.pais || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>

          <Tarjeta variant="bordered">
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
                  <p className="text-gray-900">{settings?.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Departamento</p>
                  <p className="text-gray-900">{settings?.departamento || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo</p>
                  <p className="text-gray-900">{settings?.correo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                  <p className="text-gray-900">{settings?.sitioWeb || '-'}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        </div>
      )}
    </div>
  );
}
