'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { Student } from '@/types';

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'egresado', label: 'Egresado' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'congelado', label: 'Congelado' },
];

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [editModal, setEditModal] = useState<Student | null>(null);
  const [deleteModal, setDeleteModal] = useState<Student | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{ username: string; password: string; nombre: string; studentId: number; personId: number } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const [editData, setEditData] = useState({ status: '' });
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
    return fullName.includes(search) || ci.includes(search);
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'exito' | 'error' | 'advertencia' | 'secondary'> = {
      activo: 'exito',
      inactivo: 'error',
      egresado: 'advertencia',
      suspendido: 'error',
      congelado: 'advertencia',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const openEditModal = (student: Student) => {
    setEditData({ status: student.status });
    setEditModal(student);
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setFormLoading(true);
    try {
      await api.patch(`/estudiantes/${editModal.id}`, { status: editData.status });
      setEditModal(null);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setFormLoading(false);
    }
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

      if (users && users.length > 0) {
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
                      <Button variant="ghost" size="icon" title="Ver credenciales" onClick={() => viewCredentials(student)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => openEditModal(student)}>
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
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Editar Estudiante" size="md">
        <div className="space-y-4">
          {editModal && (
            <>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Estudiante</p>
                <p className="font-medium">
                  {editModal.persona?.names} {editModal.persona?.lastname_paternal} {editModal.persona?.lastname_maternal}
                </p>
                <p className="text-sm text-gray-500">{editModal.persona?.ci}</p>
              </div>
              <div>
                <Select
                  label="Estado"
                  value={editData.status}
                  onChange={(e) => setEditData({ status: e.target.value })}
                  options={STATUS_OPTIONS}
                  placeholder="Seleccionar estado..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditModal(null)}>Cancelar</Button>
                <Button onClick={handleEdit} isLoading={formLoading}>Guardar Cambios</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

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
