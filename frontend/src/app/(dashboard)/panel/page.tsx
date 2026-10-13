'use client';

import { usarAlmacenAutenticacion } from '@/store/almacen-autenticacion';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Migas } from '@/components/ui/migas';
import { Users, GraduationCap, UserCog, BookOpen, TrendingUp, Calendar, DollarSign, Award } from 'lucide-react';
import { etiquetaRol } from '@/lib/autenticacion';

export default function DashboardPage() {
  const { user } = usarAlmacenAutenticacion();

  const stats = [
    { title: 'Total Estudiantes', value: '1,234', icon: GraduationCap, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Personal Activo', value: '156', icon: UserCog, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Carreras', value: '12', icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Ingresos del Mes', value: 'Bs. 45,230', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ];

  const recentActivity = [
    { id: 1, action: 'Nuevo estudiante registrado', user: 'Maria Lopez', time: 'Hace 5 minutos' },
    { id: 2, action: 'Pago recibido', user: 'Juan Perez', time: 'Hace 15 minutos' },
    { id: 3, action: 'Calificación actualizada', user: 'Carlos Mendez', time: 'Hace 30 minutos' },
    { id: 4, action: 'Certificado emitido', user: 'Ana Rodriguez', time: 'Hace 1 hora' },
    { id: 5, action: 'Nueva inscripción', user: 'Pedro Sanchez', time: 'Hace 2 horas' },
  ];

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Dashboard' }]} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.nombreUsuario}</h1>
        <p className="text-gray-500 mt-1">
          Rol: <span className="font-medium capitalize">{user?.rol?.replace('_', ' ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Tarjeta key={stat.title} variant="bordered">
            <ContenidoTarjeta className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
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
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Actividad Reciente</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Calendario Académico</TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="space-y-4">
              {[
                { date: '15 Oct', event: 'Inicio de exámenes parciales', type: 'Examen' },
                { date: '20 Oct', event: 'Fecha límite de inscripciones', type: 'Fecha límite' },
                { date: '01 Nov', event: 'Feriado - Día de la Revolución', type: 'Feriado' },
                { date: '15 Nov', event: 'Publicación de resultados', type: 'Resultados' },
                { date: '01 Dic', event: 'Inicio de exámenes finales', type: 'Examen' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-14 h-14 rounded-lg bg-primary-50 flex flex-col items-center justify-center">
                    <span className="text-xs text-primary-600 font-medium">{item.date.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-primary-700">{item.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.event}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
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
