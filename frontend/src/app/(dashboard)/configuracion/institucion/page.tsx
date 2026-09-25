'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { useInstitutionSettings } from '@/hooks/useInstitutionSettings';
import { Save, Building2, Phone, MapPin, Pencil, X } from 'lucide-react';
import api from '@/lib/api';

const settingsSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nombre_corto: z.string().min(1, 'El nombre corto es requerido'),
  lema: z.string().optional(),
  logo_url: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  departamento: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional(),
  descripcion: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function ConfiguracionPage() {
  const { settings, loading, refetch } = useInstitutionSettings();
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
      setLogoUrl(settings.logo_url || '');
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Configuración' }, { label: 'Institución' }]} />
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
      const submitData = { ...data, logo_url: logoUrl };
      await api.put('/institution-settings', submitData);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar la configuración',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (settings) {
      setLogoUrl(settings.logo_url || '');
      reset({
        nombre: settings.nombre || '',
        nombre_corto: settings.nombre_corto || '',
        lema: settings.lema || '',
        logo_url: settings.logo_url || '',
        direccion: settings.direccion || '',
        telefono: settings.telefono || '',
        departamento: settings.departamento || '',
        email: settings.email || '',
        website: settings.website || '',
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
      <Breadcrumb items={[{ label: 'Configuración' }, { label: 'Institución' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración Institucional</h1>
          <p className="text-gray-500 mt-1">
            Datos de la institución que aparecerán en certificados y documentos
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
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
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos Generales
              </CardTitle>
              <CardDescription>Información básica de la institución</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre Completo"
                placeholder="Instituto Tecnológico Boliviana de Tecnología"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
              <Input
                label="Nombre Corto / Sigla"
                placeholder="SITBT"
                error={errors.nombre_corto?.message}
                {...register('nombre_corto')}
              />
              <div className="md:col-span-2">
                <Input
                  label="Lema"
                  placeholder="Formando profesionales técnicos de excelencia"
                  {...register('lema')}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Descripción"
                  placeholder="Breve descripción de la institución..."
                  {...register('descripcion')}
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </CardTitle>
              <CardDescription>Logo institucional que aparecerá en documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                label="Logo de la Institución"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                helperText="PNG, JPG o WEBP (máx. 5MB). El logo se subirá a MinIO automáticamente."
              />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </CardTitle>
              <CardDescription>Dirección y ubicación geográfica</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Dirección"
                  placeholder="Av. Bolivia No. 1234, Zona Central"
                  {...register('direccion')}
                />
              </div>
              <Input
                label="Ciudad"
                placeholder="La Paz"
                {...register('ciudad')}
              />
              <Input
                label="País"
                placeholder="Bolivia"
                {...register('pais')}
              />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto
              </CardTitle>
              <CardDescription>Información de contacto oficial</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Input
                label="Teléfono"
                placeholder="+591 2 1234567"
                {...register('telefono')}
              />
              <Input
                label="Departamento"
                placeholder="La Paz"
                {...register('departamento')}
              />
              <Input
                label="Email"
                placeholder="contacto@sitbt.edu.bo"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Website"
                placeholder="https://www.sitbt.edu.bo"
                {...register('website')}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="text-gray-900">{settings?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Corto / Sigla</p>
                  <p className="text-gray-900">{settings?.nombre_corto || '-'}</p>
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
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidad Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
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
                    {settings?.logo_url ? 'Logo actual' : 'Sin logo configurado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{settings?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-gray-900">{settings?.website || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
