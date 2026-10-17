'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Migas } from '@/componentes/iu/migas';
import { Users, GraduationCap, UserCog, BookOpen, Clock, Fingerprint } from 'lucide-react';
import { api } from '@/libreria/api';
import { EstadoPersonalHoy } from '@/tipos';

const formatearHora = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';

const etiquetaCargo = (cargo: string) =>
  (cargo || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Cuenta los elementos de una respuesta que puede ser un arreglo o `{ datos: [] }`. */
const contarLista = (datos: unknown): number => {
  if (Array.isArray(datos)) return datos.length;
  const lista = (datos as { datos?: unknown[] } | null)?.datos;
  return Array.isArray(lista) ? lista.length : 0;
};

export default function PaginaPanel() {
  const { usuario } = usarAlmacenAutenticacion();

  const [estadisticas, setEstadisticas] = useState([
    { titulo: 'Total Estudiantes', valor: '—', detalle: 'Cargando…', icono: GraduationCap, color: 'text-blue-600', colorFondo: 'bg-blue-100' },
    { titulo: 'Personal Activo', valor: '—', detalle: 'Cargando…', icono: UserCog, color: 'text-green-600', colorFondo: 'bg-green-100' },
    { titulo: 'Carreras', valor: '—', detalle: 'Cargando…', icono: BookOpen, color: 'text-purple-600', colorFondo: 'bg-purple-100' },
  ]);

  const [estadoPersonal, setEstadoPersonal] = useState<EstadoPersonalHoy[]>([]);
  const [resumenAsistencia, setResumenAsistencia] = useState({ total: 0, dentro: 0 });
  const [cargandoAsistencia, setCargandoAsistencia] = useState(true);

  useEffect(() => {
    const cargarAsistencia = async () => {
      try {
        const respuesta = await api.get('/asistencias-personal/estado-hoy');
        setEstadoPersonal(respuesta.data.personal ?? []);
        setResumenAsistencia({
          total: respuesta.data.total ?? 0,
          dentro: respuesta.data.dentro ?? 0,
        });
      } catch (error) {
        console.error('Error al cargar asistencias del panel:', error);
      } finally {
        setCargandoAsistencia(false);
      }
    };

    cargarAsistencia();
  }, []);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [resEstudiantes, resPersonalActivos, resDocentes, resCarreras] = await Promise.all([
          api.get('/estudiantes/estadisticas'),
          api.get('/personal/activos'),
          api.get('/personal/docentes'),
          api.get('/carreras/activos'),
        ]);

        const totalEstudiantes = Number(resEstudiantes.data?.total ?? 0);
        const estudiantesActivos = Number(resEstudiantes.data?.activos ?? 0);
        const personalActivo = contarLista(resPersonalActivos.data);
        const docentes = contarLista(resDocentes.data);
        const carrerasActivas = contarLista(resCarreras.data);

        setEstadisticas([
          {
            titulo: 'Total Estudiantes',
            valor: totalEstudiantes.toLocaleString('es-BO'),
            detalle: `${estudiantesActivos.toLocaleString('es-BO')} activos`,
            icono: GraduationCap,
            color: 'text-blue-600',
            colorFondo: 'bg-blue-100',
          },
          {
            titulo: 'Personal Activo',
            valor: personalActivo.toLocaleString('es-BO'),
            detalle: `${docentes.toLocaleString('es-BO')} docentes`,
            icono: UserCog,
            color: 'text-green-600',
            colorFondo: 'bg-green-100',
          },
          {
            titulo: 'Carreras',
            valor: carrerasActivas.toLocaleString('es-BO'),
            detalle: `${carrerasActivas.toLocaleString('es-BO')} activas`,
            icono: BookOpen,
            color: 'text-purple-600',
            colorFondo: 'bg-purple-100',
          },
        ]);
      } catch (error) {
        console.error('Error al cargar estadísticas del panel:', error);
      }
    };

    cargarEstadisticas();
  }, []);

  const actividadReciente = [
    { id: 1, accion: 'Nuevo estudiante registrado', usuario: 'Maria Lopez', hora: 'Hace 5 minutos' },
    { id: 2, accion: 'Pago recibido', usuario: 'Juan Perez', hora: 'Hace 15 minutos' },
    { id: 3, accion: 'Calificación actualizada', usuario: 'Carlos Mendez', hora: 'Hace 30 minutos' },
    { id: 4, accion: 'Certificado emitido', usuario: 'Ana Rodriguez', hora: 'Hace 1 hora' },
    { id: 5, accion: 'Nueva inscripción', usuario: 'Pedro Sanchez', hora: 'Hace 2 horas' },
  ];

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Panel' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {usuario?.nombreUsuario}</h1>
        <p className="text-gray-500 mt-1">
          Rol: <span className="font-medium capitalize">{usuario?.rol?.replace('_', ' ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {estadisticas.map((estadistica) => (
          <Tarjeta key={estadistica.titulo} variante="conBorde">
            <ContenidoTarjeta className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-500">{estadistica.titulo}</p>
                  <p className="text-xl font-bold leading-tight text-gray-900">{estadistica.valor}</p>
                  <p className="truncate text-xs text-gray-500">{estadistica.detalle}</p>
                </div>
                <div className={`shrink-0 rounded-lg p-2 ${estadistica.colorFondo}`}>
                  <estadistica.icono className={`h-5 w-5 ${estadistica.color}`} />
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>
              Personal en la Institución{' '}
              <span className="font-normal text-gray-500">
                ({resumenAsistencia.dentro} de {resumenAsistencia.total})
              </span>
            </TituloTarjeta>
            <Link
              href="/asistencias"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Fingerprint className="h-4 w-4" />
              Ver asistencias
            </Link>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargandoAsistencia ? (
            <p className="py-6 text-center text-sm text-gray-500">Cargando…</p>
          ) : estadoPersonal.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No hay personal activo registrado.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {estadoPersonal.map((p) => (
                <div
                  key={p.personalId}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <span
                    className={`h-3.5 w-3.5 shrink-0 rounded-full ${
                      p.dentro
                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                    }`}
                    title={p.dentro ? 'En la institución' : 'Fuera'}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {p.nombres} {p.apellidoPaterno}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {etiquetaCargo(p.cargo)}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {p.dentro
                        ? `Llegó ${formatearHora(p.horaEntrada)}`
                        : p.horaSalida
                          ? `Salió ${formatearHora(p.horaSalida)}`
                          : 'Sin marcación hoy'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Actividad Reciente</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="space-y-4">
              {actividadReciente.map((actividad) => (
                <div key={actividad.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{actividad.accion}</p>
                    <p className="text-xs text-gray-500">{actividad.usuario} • {actividad.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Calendario Académico</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="space-y-4">
              {[
                { fecha: '15 Oct', evento: 'Inicio de exámenes parciales', tipo: 'Examen' },
                { fecha: '20 Oct', evento: 'Fecha límite de inscripciones', tipo: 'Fecha límite' },
                { fecha: '01 Nov', evento: 'Feriado - Día de la Revolución', tipo: 'Feriado' },
                { fecha: '15 Nov', evento: 'Publicación de resultados', tipo: 'Resultados' },
                { fecha: '01 Dic', evento: 'Inicio de exámenes finales', tipo: 'Examen' },
              ].map((elemento, indice) => (
                <div key={indice} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-14 h-14 rounded-lg bg-primary-50 flex flex-col items-center justify-center">
                    <span className="text-xs text-primary-600 font-medium">{elemento.fecha.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-primary-700">{elemento.fecha.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{elemento.evento}</p>
                    <p className="text-xs text-gray-500">{elemento.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    </div>
  );
}
