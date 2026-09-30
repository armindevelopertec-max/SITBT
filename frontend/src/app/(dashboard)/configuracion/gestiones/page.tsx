'use client';

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Gestion, Periodo } from '@/types';
import { Plus, Edit2, Trash2, Lock, Unlock, Star, StarOff, Loader2, Calendar } from 'lucide-react';

export default function GestionesPage() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: number | null; title: string; message: string } | null>(null);
  const [editingGestion, setEditingGestion] = useState<Gestion | null>(null);
  const [deletingGestion, setDeletingGestion] = useState<Gestion | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    year: '',
    period_type: 'semestral',
    notes: '',
    is_current: false,
  });

  useEffect(() => {
    fetchGestiones();
  }, []);

  const fetchGestiones = async () => {
    try {
      const response = await api.get('/gestiones');
      setGestiones(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gestiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'exito' | 'error' | 'advertencia' | 'secondary'> = {
      abierta: 'exito',
      cerrada: 'error',
      pendiente: 'advertencia',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPeriodBadge = (type: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'outline'> = {
      anual: 'primary',
      semestral: 'secondary',
      trimestral: 'outline',
    };
    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const handleOpenModal = (gestion?: Gestion) => {
    if (gestion) {
      setEditingGestion(gestion);
      setFormData({
        year: gestion.year,
        period_type: gestion.period_type,
        notes: gestion.notes || '',
        is_current: gestion.is_current,
      });
    } else {
      setEditingGestion(null);
      setFormData({
        year: new Date().getFullYear().toString(),
        period_type: 'semestral',
        notes: '',
        is_current: false,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGestion(null);
  };

  const handleSave = async () => {
    if (!formData.year) return;

    setSaving(true);
    try {
      if (editingGestion) {
        await api.patch(`/gestiones/${editingGestion.id}`, formData);
      } else {
        await api.post('/gestiones', { ...formData, status: 'pendiente' });
      }
      fetchGestiones();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving gestion:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpen = (gestion: Gestion) => {
    setConfirmAction({
      type: 'openGestion',
      id: gestion.id,
      title: 'Abrir Gestión',
      message: `¿Estás seguro de abrir la gestión ${gestion.year}?`,
    });
    setConfirmModalOpen(true);
  };

  const handleClose = (gestion: Gestion) => {
    setConfirmAction({
      type: 'closeGestion',
      id: gestion.id,
      title: 'Cerrar Gestión',
      message: `¿Estás seguro de cerrar la gestión ${gestion.year}? Esto cerrará todos los períodos abiertos.`,
    });
    setConfirmModalOpen(true);
  };

  const handleSetCurrent = (gestion: Gestion) => {
    setConfirmAction({
      type: 'setCurrent',
      id: gestion.id,
      title: 'Marcar como Actual',
      message: `¿Estás seguro de marcar la gestión ${gestion.year} como actual?`,
    });
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingGestion) return;

    setSaving(true);
    try {
      await api.delete(`/gestiones/${deletingGestion.id}`);
      setDeleteModalOpen(false);
      setDeletingGestion(null);
      fetchGestiones();
    } catch (error) {
      console.error('Error deleting gestion:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPeriodo = (periodoId: number, periodoNumber: string) => {
    setConfirmAction({
      type: 'openPeriodo',
      id: periodoId,
      title: 'Abrir Período',
      message: `¿Estás seguro de abrir el ${periodoNumber}?`,
    });
    setConfirmModalOpen(true);
  };

  const handleClosePeriodo = (periodoId: number, periodoNumber: string) => {
    setConfirmAction({
      type: 'closePeriodo',
      id: periodoId,
      title: 'Cerrar Período',
      message: `¿Estás seguro de cerrar el ${periodoNumber}?`,
    });
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction || !confirmAction.id) return;

    setSaving(true);
    try {
      switch (confirmAction.type) {
        case 'openGestion':
          await api.post(`/gestiones/${confirmAction.id}/open`);
          break;
        case 'closeGestion':
          await api.post(`/gestiones/${confirmAction.id}/close`);
          break;
        case 'setCurrent':
          await api.post(`/gestiones/${confirmAction.id}/set-current`);
          break;
        case 'openPeriodo':
          await api.post(`/gestiones/periodos/${confirmAction.id}/open`);
          break;
        case 'closePeriodo':
          await api.post(`/gestiones/periodos/${confirmAction.id}/close`);
          break;
      }
      setConfirmModalOpen(false);
      setConfirmAction(null);
      fetchGestiones();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
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
      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Gestiones' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestiones Académicas</h1>
          <p className="text-gray-500">Administra los períodos académicos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Gestión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...gestiones].sort((a, b) => (b.is_current ? 1 : 0) - (a.is_current ? 1 : 0)).map((gestion) => (
          <Card key={gestion.id} variant="bordered">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {gestion.year}
                      {gestion.is_current && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{gestion.period_type}</p>
                  </div>
                </div>
                {getStatusBadge(gestion.status)}
              </div>
            </CardHeader>
            <CardContent>
              {gestion.periodos && gestion.periodos.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-700">Períodos:</p>
                  {[...gestion.periodos].sort((a, b) => a.number.localeCompare(b.number)).map((periodo) => (
                    <div
                      key={periodo.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{periodo.number}</span>
                        <span className="text-gray-500">({periodo.name || 'Sin nombre'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(periodo.status)}
                        {periodo.status === 'pendiente' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleOpenPeriodo(periodo.id, `${periodo.number} - ${periodo.name}`)}
                          >
                            <Unlock className="w-3 h-3" />
                          </Button>
                        )}
                        {periodo.status === 'abierta' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleClosePeriodo(periodo.id, `${periodo.number} - ${periodo.name}`)}
                          >
                            <Lock className="w-3 h-3" />
                          </Button>
                        )}
                        {periodo.status === 'cerrada' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleOpenPeriodo(periodo.id, `${periodo.number} - ${periodo.name}`)}
                          >
                            <Unlock className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {gestion.notes && (
                <p className="text-sm text-gray-500 mb-4">{gestion.notes}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {gestion.status === 'pendiente' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpen(gestion)}>
                    <Unlock className="w-4 h-4 mr-1" />
                    Abrir
                  </Button>
                )}
                {gestion.status === 'abierta' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleClose(gestion)}>
                    <Lock className="w-4 h-4 mr-1" />
                    Cerrar
                  </Button>
                )}
                {gestion.status === 'cerrada' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpen(gestion)}>
                    <Unlock className="w-4 h-4 mr-1" />
                    Reabrir
                  </Button>
                )}
                {!gestion.is_current && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetCurrent(gestion)}
                    title="Marcar como actual"
                  >
                    <StarOff className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleOpenModal(gestion)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDeletingGestion(gestion);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {gestiones.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay gestiones registradas</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera gestión
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingGestion ? 'Editar Gestión' : 'Nueva Gestión'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Año *"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2025"
              disabled={!!editingGestion}
            />
            <Select
              label="Régimen *"
              value={formData.period_type}
              onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
              options={[
                { value: 'semestral', label: 'Semestral' },
              ]}
              disabled={!!editingGestion}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is_current" className="text-sm text-gray-700">
              Marcar como gestión actual (se mostrará por defecto en formularios)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales..."
            />
          </div>

          {!editingGestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium">Períodos que se crearán:</p>
              {formData.period_type === 'semestral' && (
                <>
                  <p>I - Primer Semestre (20 feb - 10 jul)</p>
                  <p>II - Segundo Semestre (20 jul - 11 dic)</p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.year}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingGestion(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Gestión"
        message={`¿Estás seguro de eliminar la gestión ${deletingGestion?.year}? Se eliminarán también todos sus períodos. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />

      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirm}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText="Confirmar"
        variant="default"
        loading={saving}
      />
    </div>
  );
}
