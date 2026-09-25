'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const groupsData = [
  { id: 1, codigo: 'A-2024-1', nombre: 'Grupo A - Turno Mañana', ano: 2024, periodo: 1, carrera: 'Ingeniería de Sistemas', capacidad: 30, estado: 'activo' },
  { id: 2, codigo: 'B-2024-1', nombre: 'Grupo B - Turno Tarde', ano: 2024, periodo: 1, carrera: 'Ingeniería de Sistemas', capacidad: 30, estado: 'activo' },
  { id: 3, codigo: 'C-2024-1', nombre: 'Grupo C - Turno Noche', ano: 2024, periodo: 1, carrera: 'Contabilidad', capacidad: 25, estado: 'activo' },
];

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Grupos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Grupo
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Grupos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar grupo..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsData.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.codigo}</TableCell>
                  <TableCell>{group.nombre}</TableCell>
                  <TableCell>{group.ano}</TableCell>
                  <TableCell>{group.periodo}</TableCell>
                  <TableCell>{group.carrera}</TableCell>
                  <TableCell>{group.capacidad}</TableCell>
                  <TableCell>
                    <Badge variant={group.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                      {group.estado}
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
