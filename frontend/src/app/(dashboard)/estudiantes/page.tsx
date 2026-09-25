'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Download } from 'lucide-react';

const studentsData = [
  { id: 1, codigo: 'EST-001', nombre: 'Juan Perez', ci: '12345678', carrera: 'Ingeniería de Sistemas', estado: 'activo' },
  { id: 2, codigo: 'EST-002', nombre: 'Maria Lopez', ci: '87654321', carrera: 'Contabilidad', estado: 'activo' },
  { id: 3, codigo: 'EST-003', nombre: 'Carlos Mendez', ci: '11223344', carrera: 'Ingeniería de Sistemas', estado: 'egresado' },
  { id: 4, codigo: 'EST-004', nombre: 'Ana Rodriguez', ci: '55667788', carrera: 'Administración', estado: 'inactivo' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'error' | 'secondary'> = {
  activo: 'exito',
  inactivo: 'error',
  egresado: 'advertencia',
  suspendido: 'error',
};

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Estudiantes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Estudiantes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar estudiante..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.codigo}</TableCell>
                  <TableCell>{student.nombre}</TableCell>
                  <TableCell>{student.ci}</TableCell>
                  <TableCell>{student.carrera}</TableCell>
                  <TableCell>
                    <Badge variant={estadoColors[student.estado]} className="capitalize">
                      {student.estado}
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
