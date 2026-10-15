'use client';

import { usarAlmacenAutenticacion } from '@/almacen/almacen-autenticacion';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Migas } from '@/componentes/iu/migas';
import { Users, GraduationCap, UserCog, BookOpen, TrendingUp, Calendar, DollarSign, Award } from 'lucide-react';
import { etiquetaRol } from '@/libreria/autenticacion';

export default function PaginaPanel() {
  const { usuario } = usarAlmacenAutenticacion();

  const estadisticas = [
    { titulo: 'Total Estudiantes', valor: '1,234', icono: GraduationCap, color: 'text-blue-600', colorFondo: 'bg-blue-100' },
    { titulo: 'Personal Activo', valor: '156', icono: UserCog, color: 'text-green-600', colorFondo: 'bg-green-100' },
    { titulo: 'Carreras', valor: '12', icono: BookOpen, color: 'text-purple-600', colorFondo: 'bg-purple-100' },
    { titulo: 'Ingresos del Mes', valor: 'Bs. 45,230', icono: DollarSign, color: 'text-emerald-600', colorFondo: 'bg-emerald-100' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((estadistica) => (
          <Tarjeta key={estadistica.titulo} variante="conBorde">
            <ContenidoTarjeta className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{estadistica.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{estadistica.valor}</p>
                </div>
                <div className={`p-3 rounded-full ${estadistica.colorFondo}`}>
                  <estadistica.icono className={`w-6 h-6 ${estadistica.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="ml-1">vs mes anterior</span>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ))}
      </div>

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
