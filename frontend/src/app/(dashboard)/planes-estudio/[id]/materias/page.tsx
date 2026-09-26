'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Loader2, BookOpen, Edit2, Save, X, Check, Search } from 'lucide-react';

interface Materia {
  id: number;
  code: string;
  name: string;
}

interface MateriaPlan {
  id: number;
  study_plan_id: number;
  subject_id: number;
  semester: number;
  weekly_hours: number;
  materia?: Materia;
  prerequisite_id?: number;
  prerequisite?: Materia;
}

interface PlanEstudio {
  id: number;
  rm_number: string;
  career_id: number;
  status: string;
  carrera?: { id: number; name: string; code: string };
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
    return m.code.toLowerCase().includes(search) || m.name.toLowerCase().includes(search);
  });

  const filteredPrerequisites = materiasDisponibles.filter(m => {
    if (!prerequisiteSearch) return true;
    const search = prerequisiteSearch.toLowerCase();
    return m.code.toLowerCase().includes(search) || m.name.toLowerCase().includes(search);
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
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriasPlan = async () => {
    try {
      const response = await api.get(`/planes-estudio/${planId}/materias`);
      setMateriasPlan(response.data || []);
    } catch (error) {
      console.error('Error fetching materias plan:', error);
    }
  };

  const fetchMateriasDisponibles = async () => {
    try {
      const response = await api.get('/materias/all');
      setMateriasDisponibles(response.data || []);
    } catch (error) {
      console.error('Error fetching materias:', error);
    }
  };

  const getSemesterMaterias = (semester: number) => {
    return materiasPlan.filter(m => m.semester === semester);
  };

  const getMaxSemester = () => {
    if (materiasPlan.length === 0) return 6;
    return Math.max(...materiasPlan.map(m => m.semester));
  };

  const getTotalHours = (semester: number) => {
    return getSemesterMaterias(semester).reduce((sum, m) => sum + m.weekly_hours, 0);
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
        subject_id: newSubjectId,
        semester: addingToSemester,
        weekly_hours: newWeeklyHours,
        prerequisite_id: newPrerequisiteId || null,
      });
      handleCancelAdd();
      fetchMateriasPlan();
    } catch (error: any) {
      console.error('Error saving materia:', error);
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
        semester: editingMateria.semester,
        weekly_hours: editingMateria.weekly_hours,
      });
      setEditingMateria(null);
      fetchMateriasPlan();
    } catch (error: any) {
      console.error('Error updating materia:', error);
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
      console.error('Error removing materia:', error);
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Breadcrumb items={[
          { label: 'Configuración', href: '/configuracion' },
          { label: 'Planes de Estudio', href: '/planes-estudio' },
          { label: `${plan?.rm_number} - ${plan?.carrera?.name || 'Cargando...'}` }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Plan de Estudios: {plan?.rm_number}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline">{plan?.carrera?.code}</Badge>
            <span className="text-gray-500">{plan?.carrera?.name}</span>
            <Badge variant={plan?.status === 'vigente' ? 'exito' : 'secondary'}>
              {plan?.status}
            </Badge>
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
          <Card variant="bordered">
            <CardContent className="py-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No hay materias asignadas</p>
              <p className="text-sm mb-4">
                Comienza agregando materias a los semestres.
              </p>
              <Button onClick={() => handleStartAdd(1)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Materias al Semestre 1
              </Button>
            </CardContent>
          </Card>
        ) : (
          Array.from({ length: getMaxSemester() }, (_, i) => i + 1).map(semester => {
            const materiasSemestre = getSemesterMaterias(semester);
            const totalHoras = getTotalHours(semester);
            const isAdding = addingToSemester === semester;

            return (
              <Card key={semester} variant="bordered">
                <CardHeader className="bg-gray-50 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Semestre {semester}</CardTitle>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {materiasSemestre.length} materia{materiasSemestre.length !== 1 ? 's' : ''}
                      </span>
                      <Badge variant="outline">{totalHoras} horas/semana</Badge>
                      {!isAdding && (
                        <Button size="sm" variant="outline" onClick={() => handleStartAdd(semester)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
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
                              <Input
                                type="text"
                                placeholder="Buscar por codigo o nombre..."
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
                                      setMateriaSearch(`${m.code} - ${m.name}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{m.code}</span>
                                    <span className="text-gray-500 text-sm ml-2">{m.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {newSubjectId && materiaSearch && (
                              <div className="mt-1 px-2 py-1 bg-green-100 rounded text-xs text-green-700">
                                Seleccionado: {materiasDisponibles.find(m => m.id === newSubjectId)?.code} - {materiasDisponibles.find(m => m.id === newSubjectId)?.name}
                              </div>
                            )}
                          </div>

                          <div className="w-24">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Horas/Sem</label>
                            <Input
                              type="number"
                              value={newWeeklyHours || ''}
                              onChange={(e) => setNewWeeklyHours(parseInt(e.target.value) || 0)}
                              placeholder="4"
                              min="1"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Prerequisito (opcional)</label>
                            <div className="relative">
                              <Input
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
                                      setPrerequisiteSearch(`${p.code} - ${p.name}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{p.code}</span>
                                    <span className="text-gray-500 text-sm ml-2">{p.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {newPrerequisiteId && (
                              <div className="mt-1 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
                                Prerequisito: {materiasDisponibles.find(m => m.id === newPrerequisiteId)?.code}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancelAdd}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveNewMateria} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {materiasSemestre.length === 0 && !isAdding ? (
                    <div className="py-6 text-center text-gray-400 text-sm">
                      Sin materias en este semestre
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Codigo</TableHead>
                          <TableHead>Materia</TableHead>
                          <TableHead className="text-center">Horas/Sem</TableHead>
                          <TableHead>Prerequisito</TableHead>
                          <TableHead className="text-right w-24">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materiasSemestre.map(mp => (
                          <TableRow key={mp.id}>
                            <TableCell className="font-medium">{mp.materia?.code}</TableCell>
                            <TableCell>{mp.materia?.name}</TableCell>
                            <TableCell className="text-center">{mp.weekly_hours}</TableCell>
                            <TableCell>
                              {mp.prerequisite ? (
                                <Badge variant="secondary">{mp.prerequisite.code}</Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleStartEditMateria(mp)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMateria(mp.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}