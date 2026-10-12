'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Selector } from '@/components/ui/selector';
import { Entrada } from '@/components/ui/entrada';
import { BarChart3, FileText, Download, Users, GraduationCap, DollarSign, BookOpen } from 'lucide-react';

const reportTypes = [
  { value: 'students', label: 'Reporte de Estudiantes' },
  { value: 'enrollments', label: 'Reporte de Inscripciones' },
  { value: 'payments', label: 'Reporte de Pagos' },
  { value: 'grades', label: 'Reporte de Calificaciones' },
  { value: 'attendance', label: 'Reporte de Asistencia' },
];

const quickReports = [
  { title: 'Total Estudiantes por Carrera', icon: GraduationCap, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { title: 'Ingresos Mensuales', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
  { title: 'Rendimiento Académico', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { title: 'Estadísticas de Personal', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { title: 'Materias por Carrera', icon: BookOpen, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { title: 'Constancias y Certificados', icon: FileText, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Reportes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Tarjeta variant="bordered" className="lg:col-span-2">
          <EncabezadoTarjeta>
            <TituloTarjeta>Generar Reporte</TituloTarjeta>
            <DescripcionTarjeta>Seleccione el tipo de reporte y los parámetros</DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <Selector
              label="Tipo de Reporte"
              options={reportTypes}
              placeholder="Seleccione un tipo de reporte"
            />
            <div className="grid grid-cols-2 gap-4">
              <Entrada label="Fecha Inicio" type="date" />
              <Entrada label="Fecha Fin" type="date" />
            </div>
            <div className="flex justify-end gap-2">
              <Boton variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Vista Previa
              </Boton>
              <Boton>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Boton>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>

        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta>Reportes Rápidos</TituloTarjeta>
            <DescripcionTarjeta>Acceso directo a los reportes más comunes</DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="grid grid-cols-2 gap-3">
              {quickReports.map((report) => (
                <button
                  key={report.title}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 transition-all text-center"
                >
                  <div className={`p-3 rounded-full ${report.bgColor} mb-2`}>
                    <report.icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{report.title}</span>
                </button>
              ))}
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    </div>
  );
}
