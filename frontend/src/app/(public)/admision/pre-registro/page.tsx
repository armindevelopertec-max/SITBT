'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPublica } from '@/libreria/api';
import { Carrera, CrearAdmisionDto } from '@/tipos';
import { GraduationCap, AlertCircle, CheckCircle, Loader2, ArrowRight, FileText, User, BookOpen, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

function FormularioPreRegistro() {
  const router = useRouter();
  const parametrosBusqueda = useSearchParams();
  const carreraPreseleccionada = parametrosBusqueda.get('carrera');

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formulario, setFormulario] = useState<CrearAdmisionDto>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    ci: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    lugarNacimientoOtro: '',
    genero: undefined,
    estadoCivil: undefined,
    nacionalidad: 'Boliviana',
    telefono: '',
    correo: '',
    direccion: '',
    nombreTutor: '',
    ciTutor: '',
    telefonoTutor: '',
    carreraId: carreraPreseleccionada ? parseInt(carreraPreseleccionada) : undefined,
    origen: 'web',
  });

  useEffect(() => {
    const obtenerCarreras = async () => {
      try {
        const respuesta = await apiPublica.get<{ datos: Carrera[] }>('/carreras', {
          params: { estado: 'activo' },
        });
        setCarreras(respuesta.data.datos);
      } catch (error) {
        console.error('Error al obtener carreras:', error);
      }
    };
    obtenerCarreras();
  }, []);

  const cambiarCampo = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const camposMayusculas = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'direccion', 'lugarNacimientoOtro', 'nacionalidadOtra', 'nombreTutor', 'ciTutor'];
    const esMayuscula = camposMayusculas.includes(name);
    setFormulario((anterior) => ({
      ...anterior,
      [name]: name === 'carreraId' ? (value ? parseInt(value) : undefined) : (esMayuscula ? value.toUpperCase() : value),
    }));
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      await apiPublica.post('/admision', formulario);
      setExito(true);
    } catch (err: any) {
      setError(err.respuesta?.data?.mensaje || 'Error al enviar el pre-registro');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
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
        {/* Encabezado */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 mb-3 sm:mb-4">Pre-registro</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Completa el formulario para iniciar tu proceso de admisión
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={enviarFormulario} className="space-y-8">
          {/* Datos Personales */}
          <div className="bg-dark-700 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Datos Personales</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarCampo}
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
                  value={formulario.apellidoPaterno || ''}
                  onChange={cambiarCampo}
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
                  value={formulario.apellidoMaterno || ''}
                  onChange={cambiarCampo}
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
                  value={formulario.ci}
                  onChange={cambiarCampo}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de nacimiento *
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formulario.fechaNacimiento}
                  onChange={cambiarCampo}
                  required
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lugar de nacimiento
                </label>
                <select
                  name="lugarNacimiento"
                  value={formulario.lugarNacimiento || ''}
                  onChange={cambiarCampo}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Seleccionar</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Oruro">Oruro</option>
                  <option value="Potosí">Potosí</option>
                  <option value="Tarija">Tarija</option>
                  <option value="Chuquisaca">Chuquisaca</option>
                  <option value="Beni">Beni</option>
                  <option value="Pando">Pando</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              {formulario.lugarNacimiento === 'Otra' && (
                <div>
                  <input
                    type="text"
                    name="lugarNacimientoOtro"
                    value={formulario.lugarNacimientoOtro || ''}
                    onChange={cambiarCampo}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Especificar lugar de nacimiento"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Género *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="M"
                      checked={formulario.genero === 'M'}
                      onChange={cambiarCampo}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Masculino</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genero"
                      value="F"
                      checked={formulario.genero === 'F'}
                      onChange={cambiarCampo}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Femenino</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado civil
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Soltera(o)"
                      checked={formulario.estadoCivil === 'Soltera(o)'}
                      onChange={cambiarCampo}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Soltero(a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estadoCivil"
                      value="Casada(o)"
                      checked={formulario.estadoCivil === 'Casada(o)'}
                      onChange={cambiarCampo}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Casado(a)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nacionalidad
                </label>
                <select
                  name="nacionalidad"
                  value={formulario.nacionalidad || 'Boliviana'}
                  onChange={cambiarCampo}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="Boliviana">Boliviana</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Peruana">Peruana</option>
                  <option value="Chilena">Chilena</option>
                  <option value="Brasileña">Brasileña</option>
                  <option value="Colombiana">Colombiana</option>
                  <option value="Venezolana">Venezolana</option>
                  <option value="Española">Española</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              {formulario.nacionalidad === 'Otra' && (
                <div>
                  <input
                    type="text"
                    name="nacionalidadOtra"
                    value={formulario.nacionalidadOtra || ''}
                    onChange={cambiarCampo}
                    className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Ingrese su nacionalidad"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formulario.telefono || ''}
                  onChange={cambiarCampo}
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
                name="correo"
                value={formulario.correo}
                onChange={cambiarCampo}
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
                value={formulario.direccion || ''}
                onChange={cambiarCampo}
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Zona, calle, número"
              />
            </div>
          </div>

          {/* Datos Académicos */}
          <div className="bg-dark-700 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Datos Académicos</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carrera de interés *
              </label>
              <select
                name="carreraId"
                value={formulario.carreraId || ''}
                onChange={cambiarCampo}
                required
                className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                <option value="">Seleccionar carrera</option>
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos del Tutor - Solo para menores de 18 años */}
          {formulario.fechaNacimiento && (() => {
            const hoy = new Date();
            const nacimiento = new Date(formulario.fechaNacimiento);
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mesDiff = hoy.getMonth() - nacimiento.getMonth();
            const diaDiff = hoy.getDate() - nacimiento.getDate();
            const edadReal = edad - (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0) ? 1 : 0);
            return edadReal < 18;
          })() && (
          <div className="bg-dark-700 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Datos del Tutor</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6">Solo para menores de 18 años</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del tutor
                </label>
                <input
                  type="text"
                  name="nombreTutor"
                  value={formulario.nombreTutor || ''}
                  onChange={cambiarCampo}
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
                  value={formulario.ciTutor || ''}
                  onChange={cambiarCampo}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono del tutor
                </label>
                <input
                  type="tel"
                  name="telefonoTutor"
                  value={formulario.telefonoTutor || ''}
                  onChange={cambiarCampo}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </div>
          )}

          {/* Privacidad */}
          <div className="bg-dark-700/50 rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-400">
              Al enviar este formulario, aceptas nuestra{' '}
              <Link href="/legal/politica-privacidad" className="text-primary-400 hover:text-primary-300 underline">
                Política de Privacidad
              </Link>{' '}
              y consientes el tratamiento de tus datos personales.
            </p>
          </div>

          {/* Enviar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <Link
              href="/admision"
              className="px-4 sm:px-6 py-3 sm:py-4 border border-dark-600 text-gray-300 font-medium rounded-lg hover:bg-zinc-800 transition-all text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={cargando}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-gray-100 font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {cargando ? (
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
      <FormularioPreRegistro />
    </Suspense>
  );
}
