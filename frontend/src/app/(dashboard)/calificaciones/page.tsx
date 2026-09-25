'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const gradesData = [
  { id: 1, estudiante: 'Juan Perez', materia: 'Programación I', tipo: 'Examen Parcial', nota: 85, fecha: '2024-03-15' },
  { id: 2, estudiante: 'Maria Lopez', materia: 'Matemáticas I', tipo: 'Práctica', nota: 92, fecha: '2024-03-16' },
  { id: 3, estudiante: 'Carlos Mendez', materia: 'Física I', tipo: 'Examen Final', nota: 78, fecha: '2024-03-17' },
  { id: 4, estudiante: 'Ana Rodriguez', materia: 'Contabilidad', tipo: 'Trabajo', nota: 88, fecha: '2024-03-18' },
];

const getNotaColor = (nota: number) => {
  if (nota >= 80) return 'exito';
  if (nota >= 60) return 'advertencia';
  return 'error';
};

export default function GradesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Calificaciones' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Calificación
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Calificaciones</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar calificación..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradesData.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.estudiante}</TableCell>
                  <TableCell>{grade.materia}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{grade.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getNotaColor(grade.nota)}>{grade.nota}</Badge>
                  </TableCell>
                  <TableCell>{grade.fecha}</TableCell>
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
