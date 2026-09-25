'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';

const usersData = [
  { id: 1, username: 'rsilva', email: 'roberto.silva@sitbt.edu.bo', rol: 'administrador', estado: 'activo' },
  { id: 2, username: 'cvega', email: 'carmen.vega@sitbt.edu.bo', rol: 'secretaria', estado: 'activo' },
  { id: 3, username: 'ftorres', email: 'fernando.torres@sitbt.edu.bo', rol: 'director_academico', estado: 'activo' },
  { id: 4, username: 'lmorales', email: 'lucia.morales@sitbt.edu.bo', rol: 'docente', estado: 'activo' },
  { id: 5, username: 'jperez', email: 'juan.perez@sitbt.edu.bo', rol: 'estudiante', estado: 'activo' },
  { id: 6, username: 'gmamani', email: 'gerardo.mamani@sitbt.edu.bo', rol: 'apoyo', estado: 'inactivo' },
];

const rolColors: Record<string, 'default' | 'primary' | 'secondary' | 'exito' | 'advertencia' | 'error'> = {
  administrador: 'error',
  rector: 'default',
  director_academico: 'primary',
  secretaria: 'secondary',
  docente: 'exito',
  estudiante: 'advertencia',
  apoyo: 'default',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Usuarios' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuarios del Sistema</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar usuario..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={rolColors[user.rol]} className="capitalize">
                      {user.rol.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                      {user.estado}
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
