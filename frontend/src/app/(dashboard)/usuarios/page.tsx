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
  { codigo: 'administrador', nombre: 'Administrador' },
  { codigo: 'secretaria', nombre: 'Secretaría' },
  { codigo: 'director_academico', nombre: 'Director Académico' },
  { codigo: 'rector', nombre: 'Rector' },
  { codigo: 'docente', nombre: 'Docente' },
  { codigo: 'estudiante', nombre: 'Estudiante' },
  { codigo: 'apoyo', nombre: 'Apoyo' },
];

export default function UsersPage() {
  const { usuarios, cargando, error, paginacion, recargar, crearUsuario, actualizarUsuario, eliminarUsuario, cambiarContrasena } = usarUsuarios();
  const [searchTerm, setSearchTerm] = useState('');

  const [resetModal, setResetModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<UsuarioRespuesta | null>(null);

  const [formData, setFormData] = useState({ nombreUsuario: '', contrasena: '', personaId: 1, codigoRol: 'estudiante' });
  const [formLoading, setFormLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, user: null as UsuarioRespuesta | null });
  const [resetLoading, setResetLoading] = useState(false);

  const filteredUsers = usuarios.filter(user =>
    user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: UsuarioRespuesta['roles']) => {
    if (!roles || roles.length === 0) return <Insignia variant="default">Sin rol</Insignia>;
    const primaryRole = roles[0];
    return (
      <Insignia variant={rolColors[primaryRole.codigo] || 'default'} className="capitalize">
        {primaryRole.nombre}
      </Insignia>
    );
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      await crearUsuario({ ...formData, codigoRol: formData.codigoRol as Rol });
      setCreateModal(false);
      setFormData({ nombreUsuario: '', contrasena: '', personaId: 1, codigoRol: 'estudiante' });
    } catch (err) {
      console.error('Error al crear usuario:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editModal) return;
    try {
      setFormLoading(true);
      await actualizarUsuario(editModal.id, { nombreUsuario: formData.nombreUsuario });
      setEditModal(null);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
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
      console.error('Error al eliminar usuario:', err);
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
      console.error('Error al restablecer contraseña:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const openEditModal = (user: UsuarioRespuesta) => {
    setFormData({ ...formData, nombreUsuario: user.nombreUsuario });
    setEditModal(user);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Migas items={[{ label: 'Usuarios' }]} />
        <div className="p-4 text-red-500">Error: {error}</div>
        <Boton onClick={recargar}>Reintentar</Boton>
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
          {cargando && usuarios.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Usuario</CeldaEncabezado>
                  <CeldaEncabezado>Correo</CeldaEncabezado>
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
                        <span className="font-medium">{user.nombreUsuario}</span>
                      </div>
                    </CeldaTabla>
                    <CeldaTabla>{user.persona?.correo || '-'}</CeldaTabla>
                    <CeldaTabla>{getRoleBadge(user.roles)}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variant={user.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                        {user.estado}
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
              value={formData.nombreUsuario}
              onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <Entrada
              type="password"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              placeholder="Contraseña segura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.codigoRol}
              onChange={(e) => setFormData({ ...formData, codigoRol: e.target.value })}
            >
              {ROLES.map((role) => (
                <option key={role.codigo} value={role.codigo}>{role.nombre}</option>
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
              value={formData.nombreUsuario}
              onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
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
        message={`¿Está seguro de eliminar el usuario "${deleteModal.user?.nombreUsuario}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={formLoading}
      />

      <Modal open={resetPasswordModal.open} onClose={() => setResetPasswordModal({ open: false, user: null })} title="Restablecer Contraseña" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingrese la nueva contraseña para el usuario &quot;{resetPasswordModal.user?.nombreUsuario}&quot;:
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
