'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { Student } from '@/types';
import { Select } from '@/components/ui/select';

const statusLabels: Record<string, { label: string; color: string }> = {
  pre_registro: { label: 'Pre-registro', color: 'bg-purple-100 text-purple-800' },
  verificado: { label: 'Verificado', color: 'bg-blue-100 text-blue-800' },
  matriculado: { label: 'Matriculado', color: 'bg-green-100 text-green-800' },
  egresado: { label: 'Egresado', color: 'bg-gray-100 text-gray-800' },
  retirado: { label: 'Retirado', color: 'bg-red-100 text-red-800' },
};

const originLabels: Record<string, string> = {
  web: 'Web',
  secretaria: 'Secretaría',
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [origenFilter, setOrigenFilter] = useState<string>('');

  const [deleteModal, setDeleteModal] = useState<Student | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{ username: string; password: string; nombre: string; studentId: number; personId: number } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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
    const matchesSearch = fullName.includes(search) || ci.includes(search);
    const matchesEstado = !estadoFilter || student.estado_matricula === estadoFilter;
    const matchesOrigen = !origenFilter || student.origen === origenFilter;
    return matchesSearch && matchesEstado && matchesOrigen;
  });

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setFormLoading(true);
    try {
      await api.delete(`/estudiantes/${deleteModal.id}`);
      setDeleteModal(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const viewCredentials = async (student: Student) => {
    try {
      const response = await api.get(`/usuarios?person_id=${student.person_id}`);
      const users = response.data.data;
      const persona = student.persona;
      const nombre = persona ? `${persona.names} ${persona.lastname_paternal}` : 'Estudiante';

      if (users && users.length > 0 && persona) {
        const user = users[0];
        const newPassword = `${persona.ci}-${new Date().getFullYear()}`;
        setCredentialsModal({ username: user.username, password: newPassword, nombre, studentId: student.id, personId: student.person_id });
      } else {
        setCredentialsModal({ username: 'No tiene usuario', password: '', nombre, studentId: student.id, personId: student.person_id });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setCredentialsModal({ username: 'Error al cargar', password: '', nombre: student.persona?.names || '', studentId: student.id, personId: student.person_id });
    }
  };

  const handleResetPassword = async () => {
    if (!credentialsModal) return;
    setResetLoading(true);
    try {
      const response = await api.get(`/usuarios?person_id=${credentialsModal.personId}`);
      const users = response.data.data;
      if (users && users.length > 0) {
        await api.post(`/usuarios/${users[0].id}/change-password`, { newPassword: credentialsModal.password });
      }
      setCredentialsModal(null);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setResetLoading(false);
    }
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Estudiantes ({filteredStudents.length})</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'pre_registro', label: 'Pre-registro' },
                    { value: 'verificado', label: 'Verificado' },
                    { value: 'matriculado', label: 'Matriculado' },
                    { value: 'egresado', label: 'Egresado' },
                    { value: 'retirado', label: 'Retirado' },
                  ]}
                  placeholder="Estado"
                />
                <Select
                  value={origenFilter}
                  onChange={(e) => setOrigenFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'web', label: 'Web' },
                    { value: 'secretaria', label: 'Secretaría' },
                  ]}
                  placeholder="Origen"
                />
              </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CI</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Estado Matrícula</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
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
                  <TableCell>{student.inscription_code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{originLabels[student.origen || 'secretaria'] || '-'}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.estado_matricula || 'matriculado')}</TableCell>
                  <TableCell>{new Date(student.admission_date).toLocaleDateString('es-BO')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Ver credenciales" onClick={() => viewCredentials(student)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => router.push(`/estudiantes/editar/${student.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal(student)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || estadoFilter || origenFilter ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Eliminar Estudiante"
        message={`¿Está seguro de eliminar al estudiante "${deleteModal?.persona?.names} ${deleteModal?.persona?.lastname_paternal}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />

      <Modal open={!!credentialsModal} onClose={() => setCredentialsModal(null)} title="Credenciales del Estudiante" size="md">
        {credentialsModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Credenciales de acceso para <strong>{credentialsModal.nombre}</strong>:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nombre de usuario</p>
                  <p className="font-mono font-medium">{credentialsModal.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Contraseña temporal</p>
                  <p className="font-mono font-medium text-green-600">{credentialsModal.password}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ Esta contraseña es temporal. El estudiante debe cambiarla después de iniciar sesión.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCredentialsModal(null)}>Cerrar</Button>
              <Button onClick={handleResetPassword} isLoading={resetLoading} disabled={credentialsModal.username === 'No tiene usuario' || credentialsModal.username === 'Error al cargar'}>
                Restablecer Contraseña
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
