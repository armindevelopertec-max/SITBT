'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const careersData = [
  { id: 1, codigo: 'ING-SIS', nombre: 'Ingeniería de Sistemas', duracion: 10, modalidad: 'presencial', estado: 'activo' },
  { id: 2, codigo: 'CONT', nombre: 'Contabilidad', duracion: 8, modalidad: 'presencial', estado: 'activo' },
  { id: 3, codigo: 'ADMIN', nombre: 'Administración de Empresas', duracion: 8, modalidad: 'semipresencial', estado: 'activo' },
  { id: 4, codigo: 'DER', nombre: 'Derecho', duracion: 10, modalidad: 'presencial', estado: 'inactivo' },
];

export default function CareersPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Carreras' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Carreras</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Carrera
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Carreras</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar carrera..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Duración (semestres)</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careersData.map((career) => (
                <TableRow key={career.id}>
                  <TableCell className="font-medium">{career.codigo}</TableCell>
                  <TableCell>{career.nombre}</TableCell>
                  <TableCell>{career.duracion}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{career.modalidad}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={career.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                      {career.estado}
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
