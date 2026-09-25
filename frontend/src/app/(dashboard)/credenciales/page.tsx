'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Key } from 'lucide-react';

const credentialsData = [
  { id: 1, username: 'jperez', nombre: 'Juan Perez', rol: 'estudiante', estado: 'activo', ultimoAcceso: '2024-03-20 14:30' },
  { id: 2, username: 'mlopez', nombre: 'Maria Lopez', rol: 'estudiante', estado: 'activo', ultimoAcceso: '2024-03-20 10:15' },
  { id: 3, username: 'rsilva', nombre: 'Roberto Silva', rol: 'administrador', estado: 'activo', ultimoAcceso: '2024-03-20 08:00' },
  { id: 4, username: 'cmendez', nombre: 'Carlos Mendez', rol: 'docente', estado: 'inactivo', ultimoAcceso: '2024-03-15 16:45' },
];

export default function CredentialsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Credenciales' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Credenciales</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Credencial
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Credenciales</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar credencial..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentialsData.map((cred) => (
                <TableRow key={cred.id}>
                  <TableCell className="font-medium">{cred.username}</TableCell>
                  <TableCell>{cred.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{cred.rol.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cred.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                      {cred.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{cred.ultimoAcceso}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Restablecer contraseña">
                        <Key className="w-4 h-4" />
                      </Button>
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
