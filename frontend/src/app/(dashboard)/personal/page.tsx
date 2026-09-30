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
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { Staff } from '@/types';

const POSITION_OPTIONS = [
  { value: 'docente', label: 'Docente' },
  { value: 'secretaria', label: 'Secretaría' },
  { value: 'director_academico', label: 'Director Académico' },
  { value: 'rector', label: 'Rector' },
  { value: 'apoyo', label: 'Personal de Apoyo' },
  { value: 'bibliotecario', label: 'Bibliotecario' },
];

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteModal, setDeleteModal] = useState<Staff | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{ username: string; password: string; nombre: string; staffId: number; personId: number } | null>(null);

  const [formLoading, setFormLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
      licencia: 'advertencia',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getRolBadge = (position: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'advertencia' | 'exito'> = {
      docente: 'primary',
      rector: 'advertencia',
      secretaria: 'secondary',
      director_academico: 'exito',
      apoyo: 'secondary',
      bibliotecario: 'secondary',
    };
    return <Badge variant={variants[position] || 'secondary'}>{position.replace('_', ' ')}</Badge>;
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setFormLoading(true);
    try {
      await api.delete(`/personal/${deleteModal.id}`);
      setDeleteModal(null);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const viewCredentials = async (s: Staff) => {
    try {
      const response = await api.get(`/usuarios?person_id=${s.person_id}`);
      const users = response.data.data;
      const persona = s.persona;
      const nombre = persona ? `${persona.names} ${persona.lastname_paternal}` : 'Personal';

      if (users && users.length > 0 && persona) {
        const user = users[0];
        const newPassword = `${persona.ci}-${new Date().getFullYear()}`;
        setCredentialsModal({ username: user.username, password: newPassword, nombre, staffId: s.id, personId: s.person_id });
      } else {
        setCredentialsModal({ username: 'No tiene usuario', password: '', nombre, staffId: s.id, personId: s.person_id });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setCredentialsModal({ username: 'Error al cargar', password: '', nombre: s.persona?.names || '', staffId: s.id, personId: s.person_id });
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
                <TableHead>Cargo</TableHead>
                <TableHead>Profesión</TableHead>
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
                  <TableCell>{getStatusBadge(s.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Ver credenciales" onClick={() => viewCredentials(s)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => router.push(`/personal/editar/${s.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal(s)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontró personal' : 'No hay personal registrado'}
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
        title="Eliminar Personal"
        message={`¿Está seguro de eliminar a "${deleteModal?.persona?.names} ${deleteModal?.persona?.lastname_paternal}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />

      <Modal open={!!credentialsModal} onClose={() => setCredentialsModal(null)} title="Credenciales del Personal" size="md">
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
              ⚠️ Esta contraseña es temporal. El usuario debe cambiarla después de iniciar sesión.
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
