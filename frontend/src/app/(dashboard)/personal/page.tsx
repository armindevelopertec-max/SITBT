'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { Personal } from '@/types';

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
  const [staff, setStaff] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteModal, setDeleteModal] = useState<Personal | null>(null);
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
    return <Insignia variant={variants[status] || 'secondary'}>{status}</Insignia>;
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
    return <Insignia variant={variants[position] || 'secondary'}>{position.replace('_', ' ')}</Insignia>;
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

  const viewCredentials = async (s: Personal) => {
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
      <Migas items={[{ label: 'Personal' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
        <Boton onClick={() => router.push('/personal/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Personal
        </Boton>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Personal ({staff.length})</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada
                placeholder="Buscar por nombre o CI..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre Completo</CeldaEncabezado>
                <CeldaEncabezado>Cargo</CeldaEncabezado>
                <CeldaEncabezado>Profesión</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {filteredStaff.map((s) => (
                <FilaTabla key={s.id}>
                  <CeldaTabla className="font-medium">
                    {s.persona?.ci}
                  </CeldaTabla>
                  <CeldaTabla>
                    {s.persona?.names} {s.persona?.lastname_paternal} {s.persona?.lastname_maternal}
                  </CeldaTabla>
                  <CeldaTabla>{getRolBadge(s.position)}</CeldaTabla>
                  <CeldaTabla>{s.profession || '-'}</CeldaTabla>
                  <CeldaTabla>{getStatusBadge(s.status)}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon" title="Ver credenciales" onClick={() => viewCredentials(s)}>
                        <Eye className="w-4 h-4" />
                      </Boton>
                      <Boton variant="ghost" size="icon" title="Editar" onClick={() => router.push(`/personal/editar/${s.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variant="ghost" size="icon" title="Eliminar" onClick={() => setDeleteModal(s)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {filteredStaff.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontró personal' : 'No hay personal registrado'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

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
              <Boton variant="outline" onClick={() => setCredentialsModal(null)}>Cerrar</Boton>
              <Boton onClick={handleResetPassword} isLoading={resetLoading} disabled={credentialsModal.username === 'No tiene usuario' || credentialsModal.username === 'Error al cargar'}>
                Restablecer Contraseña
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
