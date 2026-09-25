'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Staff } from '@/types';

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/personal');
      setStaff(response.data.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const person = s.persona;
    if (!person) return false;
    const fullName = `${person.names} ${person.lastname_paternal} ${person.lastname_maternal}`.toLowerCase();
    const ci = person.ci.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || ci.includes(search);
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'exito' | 'error' | 'advertencia' | 'secondary'> = {
      activo: 'exito',
      inactivo: 'error',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getRolBadge = (position: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'advertencia'> = {
      docente: 'primary',
      rector: 'advertencia',
      secretaria: 'secondary',
      director_academico: 'secondary',
      apoyo: 'secondary',
      bibliotecario: 'secondary',
    };
    return <Badge variant={variants[position] || 'secondary'}>{position.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Personal' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
        <Button onClick={() => router.push('/personal/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Personal
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Personal ({staff.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o CI..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Tipo Contrato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.persona?.ci} {s.persona?.ci_issued && `- ${s.persona.ci_issued}`}
                  </TableCell>
                  <TableCell>
                    {s.persona?.names} {s.persona?.lastname_paternal} {s.persona?.lastname_maternal}
                  </TableCell>
                  <TableCell>{getRolBadge(s.position)}</TableCell>
                  <TableCell>{s.profession || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{s.position}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(s.status)}</TableCell>
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
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontró personal' : 'No hay personal registrado'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
