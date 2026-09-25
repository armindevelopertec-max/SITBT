'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';

const convalidationsData = [
  { id: 1, estudiante: 'Juan Perez', materiaOrigen: 'Cálculo I', materiaConvalidada: 'Matemáticas I', institucion: 'UMSA', fecha: '2024-02-15', estado: 'aprobado' },
  { id: 2, estudiante: 'Maria Lopez', materiaOrigen: 'Física Básica', materiaConvalidada: 'Física I', institucion: 'UCB', fecha: '2024-03-01', estado: 'pendiente' },
  { id: 3, estudiante: 'Carlos Mendez', materiaOrigen: 'Algebra Lineal', materiaConvalidada: 'Matemáticas II', institucion: 'UPSA', fecha: '2024-02-20', estado: 'rechazado' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'error'> = {
  aprobado: 'exito',
  pendiente: 'advertencia',
  rechazado: 'error',
};

export default function ConvalidationsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Convalidaciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Convalidaciones</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Convalidación
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Convalidaciones</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar convalidación..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Materia Origen</TableHead>
                <TableHead>Materia Convalidada</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {convalidationsData.map((conv) => (
                <TableRow key={conv.id}>
                  <TableCell className="font-medium">{conv.estudiante}</TableCell>
                  <TableCell>{conv.materiaOrigen}</TableCell>
                  <TableCell>{conv.materiaConvalidada}</TableCell>
                  <TableCell>{conv.institucion}</TableCell>
                  <TableCell>{conv.fecha}</TableCell>
                  <TableCell>
                    <Badge variant={estadoColors[conv.estado]} className="capitalize">
                      {conv.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Aprobar">
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Rechazar">
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
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
