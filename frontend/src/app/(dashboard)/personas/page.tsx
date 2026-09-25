'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const personsData = [
  { id: 1, ci: '12345678', nombre: 'Juan', primerApellido: 'Perez', segundoApellido: 'Gomez', telefono: '76543210', email: 'juan.perez@email.com', genero: 'M' },
  { id: 2, ci: '87654321', nombre: 'Maria', primerApellido: 'Lopez', segundoApellido: 'Rodriguez', telefono: '71234567', email: 'maria.lopez@email.com', genero: 'F' },
  { id: 3, ci: '11223344', nombre: 'Carlos', primerApellido: 'Mendez', segundoApellido: 'Fernandez', telefono: '77889900', email: 'carlos.mendez@email.com', genero: 'M' },
];

export default function PersonsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Personas' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personas</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Persona
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Personas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar persona..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personsData.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.ci}</TableCell>
                  <TableCell>{person.nombre}</TableCell>
                  <TableCell>{person.primerApellido} {person.segundoApellido}</TableCell>
                  <TableCell>{person.telefono}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>
                    <Badge variant={person.genero === 'M' ? 'primary' : 'secondary'}>
                      {person.genero === 'M' ? 'Masculino' : 'Femenino'}
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
