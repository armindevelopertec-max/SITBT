'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { usarUsuarios, UsuarioRespuesta } from '@/hooks/usarUsuarios';
import { Rol } from '@/types';
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
  const { users, loading, error, pagination, refetch, crearUsuario, actualizarUsuario, eliminarUsuario, cambiarContrasena } = usarUsuarios();
  const [searchTerm, setSearchTerm] = useState('');

  const [resetModal, setResetModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<UsuarioRespuesta | null>(null);

  const [formData, setFormData] = useState({ username: '', password: '', person_id: 1, role_code: 'estudiante' });
  const [formLoading, setFormLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [resetLoading, setResetLoading] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.names?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: UsuarioRespuesta['roles']) => {
    if (!roles || roles.length === 0) return <Insignia variant="default">Sin rol</Insignia>;
    const primaryRole = roles[0];
    return (
      <Insignia variant={rolColors[primaryRole.code] || 'default'} className="capitalize">
        {primaryRole.name}
      </Insignia>
    );
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      await crearUsuario({ ...formData, role_code: formData.role_code as Rol });
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
      await actualizarUsuario(editModal.id, { username: formData.username });
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
      await eliminarUsuario(deleteModal.user.id);
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
      await cambiarContrasena(resetPasswordModal.user.id, newPassword);
      setResetPasswordModal({ open: false, user: null });
      setNewPassword('');
    } catch (err) {
      console.error('Error resetting password:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const openEditModal = (user: UsuarioRespuesta) => {
    setFormData({ ...formData, username: user.username });
    setEditModal(user);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Migas items={[{ label: 'Usuarios' }]} />
        <div className="p-4 text-red-500">Error: {error}</div>
        <Boton onClick={refetch}>Reintentar</Boton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Usuarios' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Boton onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Usuarios del Sistema</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada
                placeholder="Buscar usuario..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {loading && users.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Usuario</CeldaEncabezado>
                  <CeldaEncabezado>Email</CeldaEncabezado>
                  <CeldaEncabezado>Rol</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {filteredUsers.map((user) => (
                  <FilaTabla key={user.id}>
                    <CeldaTabla>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </CeldaTabla>
                    <CeldaTabla>{user.persona?.email || '-'}</CeldaTabla>
                    <CeldaTabla>{getRoleBadge(user.roles)}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variant={user.status === 'activo' ? 'exito' : 'error'} className="capitalize">
                        {user.status}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <div className="flex items-center gap-2">
                        <Boton variant="ghost" size="icon" title="Restablecer contraseña" onClick={() => setResetPasswordModal({ open: true, user })}>
                          <Key className="w-4 h-4" />
                        </Boton>
                        <Boton variant="ghost" size="icon" title="Editar" onClick={() => openEditModal(user)}>
                          <Edit2 className="w-4 h-4" />
                        </Boton>
                        <Boton variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal({ open: true, user })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Boton>
                      </div>
                    </CeldaTabla>
                  </FilaTabla>
                ))}
                {filteredUsers.length === 0 && (
                  <FilaTabla>
                    <CeldaTabla colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </CeldaTabla>
                  </FilaTabla>
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nuevo Usuario" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Entrada
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <Entrada
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
            <Boton variant="outline" onClick={() => setCreateModal(false)}>Cancelar</Boton>
            <Boton onClick={handleCreate} isLoading={formLoading}>Crear Usuario</Boton>
          </div>
        </div>
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Editar Usuario" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Entrada
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => setEditModal(null)}>Cancelar</Boton>
            <Boton onClick={handleEdit} isLoading={formLoading}>Guardar Cambios</Boton>
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
            <Entrada
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => setResetPasswordModal({ open: false, user: null })}>Cancelar</Boton>
            <Boton onClick={handleResetPassword} isLoading={resetLoading}>Restablecer</Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
