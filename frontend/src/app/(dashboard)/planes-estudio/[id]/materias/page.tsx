'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { api } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Loader2, BookOpen, Edit2, Save, X, Check, Search } from 'lucide-react';

interface Materia {
  id: number;
  codigo: string;
  nombre: string;
}

interface MateriaPlan {
  id: number;
  planEstudioId: number;
  materiaId: number;
  semestre: number;
  horasSemanales: number;
  prerrequisitoId?: number | null;
  materia?: { id: number; codigo: string; nombre: string };
  prerrequisito?: { id: number; codigo: string; nombre: string } | null;
}

interface PlanEstudio {
  id: number;
  numeroRm: string;
  carreraId: number;
  estado: string;
  carrera?: { id: number; nombre: string; codigo: string };
}

export default function PlanMateriasPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [materiasPlan, setMateriasPlan] = useState<MateriaPlan[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<Materia[]>([]);
  const [editingMateria, setEditingMateria] = useState<MateriaPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [addingToSemester, setAddingToSemester] = useState<number | null>(null);
  const [materiaSearch, setMateriaSearch] = useState('');
  const [prerequisiteSearch, setPrerequisiteSearch] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<number | null>(null);
  const [newWeeklyHours, setNewWeeklyHours] = useState<number>(0);
  const [newPrerequisiteId, setNewPrerequisiteId] = useState<number | null>(null);

  const filteredMaterias = materiasDisponibles.filter(m => {
    if (!materiaSearch) return true;
    const search = materiaSearch.toLowerCase();
    return m.codigo.toLowerCase().includes(search) || m.nombre.toLowerCase().includes(search);
  });

  const filteredPrerequisites = materiasDisponibles.filter(m => {
    if (!prerequisiteSearch) return true;
    const search = prerequisiteSearch.toLowerCase();
    return m.codigo.toLowerCase().includes(search) || m.nombre.toLowerCase().includes(search);
  });

  useEffect(() => {
    fetchPlan();
    fetchMateriasDisponibles();
  }, [planId]);

  useEffect(() => {
    if (plan) {
      fetchMateriasPlan();
    }
  }, [plan]);

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/planes-estudio/${planId}`);
      setPlan(response.data);
    } catch (error) {
      console.error('Error al obtener el plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriasPlan = async () => {
    try {
      const response = await api.get(`/planes-estudio/${planId}/materias`);
      setMateriasPlan(response.data || []);
    } catch (error) {
      console.error('Error al obtener las materias del plan:', error);
    }
  };

  const fetchMateriasDisponibles = async () => {
    try {
      const response = await api.get('/materias/all');
      setMateriasDisponibles(response.data || []);
    } catch (error) {
      console.error('Error al obtener las materias:', error);
    }
  };

  const getSemesterMaterias = (semester: number) => {
    return materiasPlan.filter(m => m.semestre === semester);
  };

  const getMaxSemester = () => {
    if (materiasPlan.length === 0) return 6;
    return Math.max(...materiasPlan.map(m => m.semestre));
  };

  const getTotalHours = (semester: number) => {
    return getSemesterMaterias(semester).reduce((sum, m) => sum + m.horasSemanales, 0);
  };

  const handleStartAdd = (semester: number) => {
    setAddingToSemester(semester);
    setMateriaSearch('');
    setPrerequisiteSearch('');
    setNewSubjectId(null);
    setNewWeeklyHours(0);
    setNewPrerequisiteId(null);
    setErrors({});
  };

  const handleCancelAdd = () => {
    setAddingToSemester(null);
    setMateriaSearch('');
    setPrerequisiteSearch('');
    setNewSubjectId(null);
    setNewWeeklyHours(0);
    setNewPrerequisiteId(null);
  };

  const handleSaveNewMateria = async () => {
    if (!newSubjectId || !newWeeklyHours) {
      setErrors({ submit: 'Selecciona una materia e ingresa las horas' });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await api.post(`/planes-estudio/${planId}/materias`, {
        materiaId: newSubjectId,
        semestre: addingToSemester,
        horasSemanales: newWeeklyHours,
        prerrequisitoId: newPrerequisiteId || null,
      });
      handleCancelAdd();
      fetchMateriasPlan();
    } catch (error: any) {
      console.error('Error al guardar la materia:', error);
      setErrors({ submit: error.response?.data?.message || 'Error al guardar materia' });
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditMateria = (materiaPlan: MateriaPlan) => {
    setEditingMateria({ ...materiaPlan });
  };

  const handleCancelEditMateria = () => {
    setEditingMateria(null);
  };

  const handleSaveEditMateria = async () => {
    if (!editingMateria) return;

    setSaving(true);
    try {
      await api.patch(`/planes-estudio/${planId}/materias/${editingMateria.id}`, {
        semestre: editingMateria.semestre,
        horasSemanales: editingMateria.horasSemanales,
      });
      setEditingMateria(null);
      fetchMateriasPlan();
    } catch (error: any) {
      console.error('Error al actualizar la materia:', error);
      setErrors({ submit: error.response?.data?.message || 'Error al actualizar materia' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMateria = async (materiaPlanId: number) => {
    try {
      await api.delete(`/planes-estudio/${planId}/materias/${materiaPlanId}`);
      fetchMateriasPlan();
    } catch (error) {
      console.error('Error al eliminar la materia:', error);
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
      <div className="flex items-center gap-4">
        <Boton variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Planes de Estudio', href: '/planes-estudio' },
          { label: `${plan?.numeroRm} - ${plan?.carrera?.nombre || 'Cargando...'}` }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Plan de Estudios: {plan?.numeroRm}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Insignia variant="outline">{plan?.carrera?.codigo}</Insignia>
            <span className="text-gray-500">{plan?.carrera?.nombre}</span>
            <Insignia variant={plan?.estado === 'vigente' ? 'exito' : 'secondary'}>
              {plan?.estado}
            </Insignia>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <div className="space-y-6">
        {materiasPlan.length === 0 && addingToSemester === null ? (
          <Tarjeta variant="bordered">
            <ContenidoTarjeta className="py-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No hay materias asignadas</p>
              <p className="text-sm mb-4">
                Comienza agregando materias a los semestres.
              </p>
              <Boton onClick={() => handleStartAdd(1)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Materias al Semestre 1
              </Boton>
            </ContenidoTarjeta>
          </Tarjeta>
        ) : (
          Array.from({ length: getMaxSemester() }, (_, i) => i + 1).map(semester => {
            const materiasSemestre = getSemesterMaterias(semester);
            const totalHoras = getTotalHours(semester);
            const isAdding = addingToSemester === semester;

            return (
              <Tarjeta key={semester} variant="bordered">
                <EncabezadoTarjeta className="bg-gray-50 py-3">
                  <div className="flex items-center justify-between">
                    <TituloTarjeta className="text-lg">Semestre {semester}</TituloTarjeta>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {materiasSemestre.length} materia{materiasSemestre.length !== 1 ? 's' : ''}
                      </span>
                      <Insignia variant="outline">{totalHoras} horas/semana</Insignia>
                      {!isAdding && (
                        <Boton size="sm" variant="outline" onClick={() => handleStartAdd(semester)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar
                        </Boton>
                      )}
                    </div>
                  </div>
                </EncabezadoTarjeta>

                <ContenidoTarjeta className="p-4">
                  {isAdding && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">Agregar nueva materia</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Materia</label>
                            <div className="relative">
                              <Entrada
                                type="text"
                                placeholder="Buscar por código o nombre..."
                                value={materiaSearch}
                                onChange={(e) => setMateriaSearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {materiaSearch && filteredMaterias.length > 0 && (
                              <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg border shadow-lg max-h-40 overflow-y-auto">
                                {filteredMaterias.map(m => (
                                  <div
                                    key={m.id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setNewSubjectId(m.id);
                                      setMateriaSearch(`${m.codigo} - ${m.nombre}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{m.codigo}</span>
                                    <span className="text-gray-500 text-sm ml-2">{m.nombre}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {newSubjectId && materiaSearch && (
                              <div className="mt-1 px-2 py-1 bg-green-100 rounded text-xs text-green-700">
                                Seleccionado: {materiasDisponibles.find(m => m.id === newSubjectId)?.codigo} - {materiasDisponibles.find(m => m.id === newSubjectId)?.nombre}
                              </div>
                            )}
                          </div>

                          <div className="w-24">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Horas/Sem</label>
                            <Entrada
                              type="number"
                              value={newWeeklyHours || ''}
                              onChange={(e) => setNewWeeklyHours(parseInt(e.target.value) || 0)}
                              placeholder="4"
                              min="1"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Prerrequisito (opcional)</label>
                            <div className="relative">
                              <Entrada
                                type="text"
                                placeholder="Buscar..."
                                value={prerequisiteSearch}
                                onChange={(e) => setPrerequisiteSearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {prerequisiteSearch && filteredPrerequisites.length > 0 && (
                              <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg border shadow-lg max-h-40 overflow-y-auto">
                                {filteredPrerequisites.filter(p => p.id !== newSubjectId).map(p => (
                                  <div
                                    key={p.id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setNewPrerequisiteId(p.id);
                                      setPrerequisiteSearch(`${p.codigo} - ${p.nombre}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{p.codigo}</span>
                                    <span className="text-gray-500 text-sm ml-2">{p.nombre}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {newPrerequisiteId && (
                              <div className="mt-1 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
                                Prerrequisito: {materiasDisponibles.find(m => m.id === newPrerequisiteId)?.codigo}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Boton variant="outline" size="sm" onClick={handleCancelAdd}>
                            Cancelar
                          </Boton>
                          <Boton size="sm" onClick={handleSaveNewMateria} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                            Agregar
                          </Boton>
                        </div>
                      </div>
                    </div>
                  )}

                  {materiasSemestre.length === 0 && !isAdding ? (
                    <div className="py-6 text-center text-gray-400 text-sm">
                      Sin materias en este semestre
                    </div>
                  ) : (
                    <Tabla>
                      <EncabezadoTabla>
                        <FilaTabla>
                          <CeldaEncabezado>Código</CeldaEncabezado>
                          <CeldaEncabezado>Materia</CeldaEncabezado>
                          <CeldaEncabezado className="text-center">Horas/Sem</CeldaEncabezado>
                          <CeldaEncabezado>Prerrequisito</CeldaEncabezado>
                          <CeldaEncabezado className="text-right w-24">Acciones</CeldaEncabezado>
                        </FilaTabla>
                      </EncabezadoTabla>
                      <CuerpoTabla>
                        {materiasSemestre.map(mp => (
                          <FilaTabla key={mp.id}>
                            <CeldaTabla className="font-medium">{mp.materia?.codigo || mp.materiaId}</CeldaTabla>
                            <CeldaTabla>{mp.materia?.nombre || '-'}</CeldaTabla>
                            <CeldaTabla className="text-center">{mp.horasSemanales}</CeldaTabla>
                            <CeldaTabla>
                              {mp.prerrequisitoId ? (
                                <Insignia variant="secondary">{mp.prerrequisito?.codigo || mp.prerrequisitoId}</Insignia>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </CeldaTabla>
                            <CeldaTabla className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Boton variant="ghost" size="icon" onClick={() => handleStartEditMateria(mp)}>
                                  <Edit2 className="w-4 h-4" />
                                </Boton>
                                <Boton variant="ghost" size="icon" onClick={() => handleRemoveMateria(mp.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Boton>
                              </div>
                            </CeldaTabla>
                          </FilaTabla>
                        ))}
                      </CuerpoTabla>
                    </Tabla>
                  )}
                </ContenidoTarjeta>
              </Tarjeta>
            );
          })
        )}
      </div>
    </div>
  );
}