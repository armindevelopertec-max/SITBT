'use client';

import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Selector } from '@/componentes/iu/selector';
import { Entrada } from '@/componentes/iu/entrada';
import { BarChart3, FileText, Download, Users, GraduationCap, DollarSign, BookOpen } from 'lucide-react';

const tiposReporte = [
  { value: 'students', etiqueta: 'Reporte de Estudiantes' },
  { value: 'enrollments', etiqueta: 'Reporte de Inscripciones' },
  { value: 'payments', etiqueta: 'Reporte de Pagos' },
  { value: 'grades', etiqueta: 'Reporte de Calificaciones' },
  { value: 'attendance', etiqueta: 'Reporte de Asistencia' },
];

const reportesRapidos = [
  { titulo: 'Total Estudiantes por Carrera', icono: GraduationCap, color: 'text-blue-600 dark:text-blue-400', colorFondo: 'bg-blue-100 dark:bg-blue-900/30' },
  { titulo: 'Ingresos Mensuales', icono: DollarSign, color: 'text-green-600 dark:text-green-400', colorFondo: 'bg-green-100 dark:bg-green-900/30' },
  { titulo: 'Rendimiento Académico', icono: BarChart3, color: 'text-purple-600 dark:text-purple-400', colorFondo: 'bg-purple-100 dark:bg-purple-900/40' },
  { titulo: 'Estadísticas de Personal', icono: Users, color: 'text-orange-600 dark:text-orange-400', colorFondo: 'bg-orange-100 dark:bg-orange-900/40' },
  { titulo: 'Materias por Carrera', icono: BookOpen, color: 'text-teal-600', colorFondo: 'bg-teal-100 dark:bg-teal-900/40' },
  { titulo: 'Constancias y Certificados', icono: FileText, color: 'text-pink-600 dark:text-pink-400', colorFondo: 'bg-pink-100 dark:bg-pink-900/40' },
];

export default function PaginaReportes() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Reportes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reportes y Estadísticas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Tarjeta variante="conBorde" className="lg:col-span-2">
          <EncabezadoTarjeta>
            <TituloTarjeta>Generar Reporte</TituloTarjeta>
            <DescripcionTarjeta>Seleccione el tipo de reporte y los parámetros</DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <Selector
              etiqueta="Tipo de Reporte"
              opciones={tiposReporte}
              placeholder="Seleccione un tipo de reporte"
            />
            <div className="grid grid-cols-2 gap-4">
              <Entrada etiqueta="Fecha Inicio" type="date" />
              <Entrada etiqueta="Fecha Fin" type="date" />
            </div>
            <div className="flex justify-end gap-2">
              <Boton variante="contorno">
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

        <Tarjeta variante="conBorde">
          <EncabezadoTarjeta>
            <TituloTarjeta>Reportes Rápidos</TituloTarjeta>
            <DescripcionTarjeta>Acceso directo a los reportes más comunes</DescripcionTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            <div className="grid grid-cols-2 gap-3">
              {reportesRapidos.map((reporte) => (
                <button
                  key={reporte.titulo}
                  className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted/40 hover:border-primary-300 transition-all text-center"
                >
                  <div className={`p-3 rounded-full ${reporte.colorFondo} mb-2`}>
                    <reporte.icono className={`w-6 h-6 ${reporte.color}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{reporte.titulo}</span>
                </button>
              ))}
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    </div>
  );
}
