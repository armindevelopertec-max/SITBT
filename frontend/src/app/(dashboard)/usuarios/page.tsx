'use client';

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { useUsers, UserResponse } from '@/hooks/useUsers';
import { Role } from '@/types';
import { Plus, Search, Edit2, Trash2, Shield, Key, X, Loader2 } from 'lucide-react';

const rolColors: Record<string, 'default' | 'primary' | 'secondary' | 'exito' | 'advertencia' | 'error'> = {
  administrador: 'error',
  rector: 'default',
  director_academico: 'primary',
  secretaria: 'secondary',
  docente: 'exito',
  estudiante: 'advertencia',
  apoyo: 'default',
};

const ROLES = [
  { code: 'administrador', name: 'Administrador' },
  { code: 'secretaria', name: 'Secretaría' },
  { code: 'director_academico', name: 'Director Académico' },
  { code: 'rector', name: 'Rector' },
  { code: 'docente', name: 'Docente' },
  { code: 'estudiante', name: 'Estudiante' },
  { code: 'apoyo', name: 'Apoyo' },
];

export default function UsersPage() {
  const { users, loading, error, pagination, refetch, createUser, updateUser, deleteUser, changePassword } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const [resetModal, setResetModal] = useState({ open: false, user: null as UserResponse | null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null as UserResponse | null });
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<UserResponse | null>(null);

  const [formData, setFormData] = useState({ username: '', password: '', person_id: 1, role_code: 'estudiante' });
  const [formLoading, setFormLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, user: null as UserResponse | null });
  const [resetLoading, setResetLoading] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.names?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: UserResponse['roles']) => {
    if (!roles || roles.length === 0) return <Badge variant="default">Sin rol</Badge>;
    const primaryRole = roles[0];
    return (
      <Badge variant={rolColors[primaryRole.code] || 'default'} className="capitalize">
        {primaryRole.name}
      </Badge>
    );
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      await createUser({ ...formData, role_code: formData.role_code as Role });
      setCreateModal(false);
      setFormData({ username: '', password: '', person_id: 1, role_code: 'estudiante' });
    } catch (err) {
      console.error('Error creating user:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editModal) return;
    try {
      setFormLoading(true);
      await updateUser(editModal.id, { username: formData.username });
      setEditModal(null);
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      setFormLoading(true);
      await deleteUser(deleteModal.user.id);
      setDeleteModal({ open: false, user: null });
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModal.user) return;
    try {
      setResetLoading(true);
      await changePassword(resetPasswordModal.user.id, newPassword);
      setResetPasswordModal({ open: false, user: null });
      setNewPassword('');
    } catch (err) {
      console.error('Error resetting password:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const openEditModal = (user: UserResponse) => {
    setFormData({ ...formData, username: user.username });
    setEditModal(user);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Usuarios' }]} />
        <div className="p-4 text-red-500">Error: {error}</div>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Usuarios' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Button onClick={() => setCreateModal(true)}>
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
              <Input
                placeholder="Buscar usuario..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.persona?.email || '-'}</TableCell>
                    <TableCell>{getRoleBadge(user.roles)}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'activo' ? 'exito' : 'error'} className="capitalize">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Restablecer contraseña" onClick={() => setResetPasswordModal({ open: true, user })}>
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => openEditModal(user)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal({ open: true, user })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nuevo Usuario" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Contraseña segura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.role_code}
              onChange={(e) => setFormData({ ...formData, role_code: e.target.value })}
            >
              {ROLES.map((role) => (
                <option key={role.code} value={role.code}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreate} isLoading={formLoading}>Crear Usuario</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Editar Usuario" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancelar</Button>
            <Button onClick={handleEdit} isLoading={formLoading}>Guardar Cambios</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Está seguro de eliminar el usuario "${deleteModal.user?.username}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />

      <Modal open={resetPasswordModal.open} onClose={() => setResetPasswordModal({ open: false, user: null })} title="Restablecer Contraseña" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingrese la nueva contraseña para el usuario &quot;{resetPasswordModal.user?.username}&quot;:
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setResetPasswordModal({ open: false, user: null })}>Cancelar</Button>
            <Button onClick={handleResetPassword} isLoading={resetLoading}>Restablecer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
