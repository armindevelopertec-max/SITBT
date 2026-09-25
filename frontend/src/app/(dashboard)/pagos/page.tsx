'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const paymentsData = [
  { id: 1, estudiante: 'Juan Perez', concepto: 'Matrícula 2024', monto: 2500, fechaVencimiento: '2024-01-31', estado: 'pagado', metodoPago: 'Transferencia' },
  { id: 2, estudiante: 'Maria Lopez', concepto: 'Colegiatura Marzo', monto: 800, fechaVencimiento: '2024-03-15', estado: 'pagado', metodoPago: 'Efectivo' },
  { id: 3, estudiante: 'Carlos Mendez', concepto: 'Colegiatura Abril', monto: 800, fechaVencimiento: '2024-04-15', estado: 'pendiente', metodoPago: '-' },
  { id: 4, estudiante: 'Ana Rodriguez', concepto: 'Certificado', monto: 150, fechaVencimiento: '2024-03-20', estado: 'vencido', metodoPago: '-' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'error' | 'secondary'> = {
  pagado: 'exito',
  pendiente: 'advertencia',
  vencido: 'error',
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Pagos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Reporte
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pago
          </Button>
        </div>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pagos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar pago..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.estudiante}</TableCell>
                  <TableCell>{payment.concepto}</TableCell>
                  <TableCell>{formatCurrency(payment.monto)}</TableCell>
                  <TableCell>{payment.fechaVencimiento}</TableCell>
                  <TableCell>
                    <Badge variant={estadoColors[payment.estado]} className="capitalize">
                      {payment.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.metodoPago}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
