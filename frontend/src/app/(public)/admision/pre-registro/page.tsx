'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { Career, CreateAdmissionDto } from '@/types';
import { GraduationCap, AlertCircle, CheckCircle, Loader2, ArrowRight, FileText, User, BookOpen, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

function PreRegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carreraPreseleccionada = searchParams.get('carrera');

  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateAdmissionDto>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    ci: '',
    ci_issued: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    nombreTutor: '',
    ciTutor: '',
    telefonoTutor: '',
    genero: undefined,
    carrera_id: carreraPreseleccionada ? parseInt(carreraPreseleccionada) : undefined,
    origen: 'web',
  });

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await publicApi.get<{ data: Career[] }>('/carreras', {
          params: { status: 'activo' },
        });
        setCareers(response.data.data);
      } catch (error) {
        console.error('Error fetching careers:', error);
      }
    };
    fetchCareers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'carrera_id' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await publicApi.post('/admission', form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el pre-registro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            ¡Pre-registro exitoso!
          </h1>
          <p className="text-gray-400 mb-8">
            Tu solicitud ha sido recibida. Por favor, dirígete a secretaría con tus documentos
            originales para completar el proceso de verificación.
          </p>
          <div className="bg-dark-700 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-100 mb-4">Documentos necesarios:</h3>
            <ul className="text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                Cédula de Identidad original
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                Certificado de nacimiento original
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                Título de bachiller o diploma original
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                4 fotografías tamaño carnet
              </li>
            </ul>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-gray-100 font-semibold rounded-lg hover:bg-primary-700 transition-all"
          >
            Volver al inicio <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Pre-registro</h1>
          <p className="text-gray-400">
            Completa el formulario para iniciar tu proceso de admisión
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos Personales */}
          <div className="bg-dark-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">Datos Personales</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Juan Carlos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={form.apellidoPaterno || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  value={form.apellidoMaterno || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="López"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cédula de Identidad *
                </label>
                <input
                  type="text"
                  name="ci"
                  value={form.ci}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Extensión CI
                </label>
                <select
                  name="ci_issued"
                  value={form.ci_issued || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Seleccionar</option>
                  <option value="LP">La Paz</option>
                  <option value="CB">Cochabamba</option>
                  <option value="SC">Santa Cruz</option>
                  <option value="OR">Oruro</option>
                  <option value="PT">Potosí</option>
                  <option value="TJ">Tarija</option>
                  <option value="CH">Chuquisaca</option>
                  <option value="BE">Beni</option>
                  <option value="PD">Pando</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de nacimiento *
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Género
                </label>
                <select
                  name="genero"
                  value={form.genero || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="71234567"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Zona, calle, número"
              />
            </div>
          </div>

          {/* Datos Académicos */}
          <div className="bg-dark-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">Datos Académicos</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carrera de interés *
              </label>
              <select
                name="carrera_id"
                value={form.carrera_id || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                <option value="">Seleccionar carrera</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del Tutor */}
          <div className="bg-dark-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">Datos del Tutor</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">Solo para menores de 18 años</p>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del tutor
                </label>
                <input
                  type="text"
                  name="nombreTutor"
                  value={form.nombreTutor || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CI del tutor
                </label>
                <input
                  type="text"
                  name="ciTutor"
                  value={form.ciTutor || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono del tutor
                </label>
                <input
                  type="tel"
                  name="telefonoTutor"
                  value={form.telefonoTutor || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-dark-700/50 rounded-xl p-6">
            <p className="text-sm text-gray-400">
              Al enviar este formulario, aceptas nuestra{' '}
              <Link href="/legal/politica-privacidad" className="text-primary-400 hover:text-primary-300 underline">
                Política de Privacidad
              </Link>{' '}
              y consientes el tratamiento de tus datos personales.
            </p>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/admision"
              className="px-6 py-4 border border-dark-600 text-gray-300 font-medium rounded-lg hover:bg-zinc-800 transition-all text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary-500 text-gray-100 font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar pre-registro
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PreRegistroPage() {
  return (
    <Suspense fallback={
      <div className="bg-dark-900 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark-600 border-t-primary-600 rounded-full animate-spin" />
      </div>
    }>
      <PreRegistroForm />
    </Suspense>
  );
}
