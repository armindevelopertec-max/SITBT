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
import { Student } from '@/types';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/estudiantes');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const persona = student.persona;
    if (!persona) return false;
    const fullName = `${persona.names} ${persona.lastname_paternal} ${persona.lastname_maternal}`.toLowerCase();
    const ci = persona.ci.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || ci.includes(search);
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'exito' | 'error' | 'advertencia' | 'secondary'> = {
      activo: 'exito',
      inactivo: 'error',
      egresado: 'advertencia',
      suspendido: 'error',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
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
      <Breadcrumb items={[{ label: 'Estudiantes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        <Button onClick={() => router.push('/estudiantes/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Estudiantes ({students.length})</CardTitle>
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
                <TableHead>Código</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.persona?.ci} {student.persona?.ci_issued && `- ${student.persona.ci_issued}`}
                  </TableCell>
                  <TableCell>
                    {student.persona?.names} {student.persona?.lastname_paternal} {student.persona?.lastname_maternal}
                  </TableCell>
                  <TableCell>{student.student_code}</TableCell>
                  <TableCell>{new Date(student.admission_date).toLocaleDateString('es-BO')}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
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
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
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
