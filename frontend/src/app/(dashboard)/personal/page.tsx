'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const staffData = [
  { id: 1, ci: '12345678', nombre: 'Dr. Roberto Silva', cargo: 'Rector', departamento: 'Dirección', tipoContrato: 'planta', estado: 'activo' },
  { id: 2, ci: '87654321', nombre: 'Lic. Carmen Vega', cargo: 'Secretaria General', departamento: 'Secretaría', tipoContrato: 'planta', estado: 'activo' },
  { id: 3, ci: '11223344', nombre: 'Ing. Fernando Torres', cargo: 'Director Académico', departamento: 'Académico', tipoContrato: 'planta', estado: 'activo' },
  { id: 4, ci: '55667788', nombre: 'Prof. Lucia Morales', cargo: 'Docente', departamento: 'Ingeniería', tipoContrato: 'contrato', estado: 'activo' },
];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Personal' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Personal
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Personal</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar personal..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.ci}</TableCell>
                  <TableCell>{staff.nombre}</TableCell>
                  <TableCell>{staff.cargo}</TableCell>
                  <TableCell>{staff.departamento}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{staff.tipoContrato}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                      {staff.estado}
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
