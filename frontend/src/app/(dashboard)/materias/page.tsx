'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const subjectsData = [
  { id: 1, codigo: 'MAT-101', nombre: 'Matemáticas I', creditos: 4, horas: 6, semestre: 1, carrera: 'Ingeniería de Sistemas' },
  { id: 2, codigo: 'FIS-101', nombre: 'Física I', creditos: 4, horas: 6, semestre: 1, carrera: 'Ingeniería de Sistemas' },
  { id: 3, codigo: 'PRO-101', nombre: 'Programación I', creditos: 5, horas: 8, semestre: 1, carrera: 'Ingeniería de Sistemas' },
  { id: 4, codigo: 'CONT-101', nombre: 'Contabilidad Básica', creditos: 3, horas: 4, semestre: 1, carrera: 'Contabilidad' },
];

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Materias' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Materias</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar materia..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Horas/Semana</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectsData.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.codigo}</TableCell>
                  <TableCell>{subject.nombre}</TableCell>
                  <TableCell>{subject.creditos}</TableCell>
                  <TableCell>{subject.horas}</TableCell>
                  <TableCell>{subject.semestre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{subject.carrera}</Badge>
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
