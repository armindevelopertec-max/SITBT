'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const enrollmentsData = [
  { id: 1, estudiante: 'Juan Perez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-15', estado: 'confirmado' },
  { id: 2, estudiante: 'Maria Lopez', grupo: 'A-2024-1', materia: 'Programación I', fecha: '2024-01-16', estado: 'confirmado' },
  { id: 3, estudiante: 'Carlos Mendez', grupo: 'B-2024-1', materia: 'Matemáticas I', fecha: '2024-01-17', estado: 'pendiente' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'error'> = {
  confirmado: 'exito',
  pendiente: 'advertencia',
  cancelado: 'error',
};

export default function EnrollmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Inscripciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inscripciones</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Inscripción
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Inscripciones</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar inscripción..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentsData.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.estudiante}</TableCell>
                  <TableCell>{enrollment.grupo}</TableCell>
                  <TableCell>{enrollment.materia}</TableCell>
                  <TableCell>{enrollment.fecha}</TableCell>
                  <TableCell>
                    <Badge variant={estadoColors[enrollment.estado]} className="capitalize">
                      {enrollment.estado}
                    </Badge>
                  </TableCell>
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
