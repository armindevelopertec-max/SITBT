'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2, Users, UserCheck, BookOpen, ArrowLeft } from 'lucide-react';

interface Grupo {
  id: number;
  code: string;
  career_id: number;
  study_plan_id: number;
  subject_id: number;
  semester: number;
  shift_id: number;
  parallel: string;
  gestion: string;
  periodo: string;
  capacity: number;
  carrera?: { id: number; code: string; name: string };
  turno?: { id: number; code: string; name: string; start_time: string; end_time: string };
  plan_estudio?: { rm_number: string };
  materia?: { id: number; code: string; name: string };
}

interface StudentInGroup {
  id: number;
  group_id: number;
  student_id: number;
  enrolled_at: string;
  estudiante?: {
    id: number;
    inscription_code: string;
    persona?: {
      ci: string;
      names: string;
      lastname_paternal: string;
      lastname_maternal: string;
    };
  };
}

interface Carrera {
  id: number;
  code: string;
  name: string;
}

interface Gestion {
  id: number;
  year: string;
  is_current: boolean;
}

interface Personal {
  id: number;
  person_id: number;
  position: string;
  persona?: {
    ci: string;
    names: string;
    lastname_paternal: string;
    lastname_maternal: string;
  };
}

interface TeachingAssignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  group_id: number;
  gestion: string;
  status: string;
  docente?: Personal;
  materia?: {
    id: number;
    code: string;
    name: string;
  };
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGestion, setFilterGestion] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterSemestre, setFilterSemestre] = useState('');

  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [grupoStudents, setGrupoStudents] = useState<StudentInGroup[]>([]);
  const [grupoAssignments, setGrupoAssignments] = useState<TeachingAssignment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGrupo, setDeletingGrupo] = useState<Grupo | null>(null);
  const [saving, setSaving] = useState(false);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [planesCarrera, setPlanesCarrera] = useState<any[]>([]);
  const [generateForm, setGenerateForm] = useState({
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    shift_ids: [] as number[],
    parallels: ['A'],
    career_id: '' as string,
    study_plan_id: '' as string,
    capacidad: '30',
  });
  const [generateResult, setGenerateResult] = useState<{ created: number; message: string } | null>(null);

  const [newForm, setNewForm] = useState({
    career_id: '',
    study_plan_id: '',
    subject_id: '',
    semester: '',
    shift_id: '',
    parallel: '',
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    capacity: '30',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchGrupos();
  }, [filterGestion, filterCarrera, filterSemestre]);

  const fetchInitialData = async () => {
    try {
      const [carrerasRes, gestionesRes, turnosRes] = await Promise.all([
        api.get('/carreras/active'),
        api.get('/gestiones'),
        api.get('/turnos/all'),
      ]);
      setCarreras(carrerasRes.data || []);
      const allGestiones = gestionesRes.data.data || gestionesRes.data || [];
      setGestiones(allGestiones);
      setTurnos(turnosRes.data.data || turnosRes.data || []);

      const current = allGestiones.find((g: any) => g.is_current);
      if (current) {
        setFilterGestion(current.year);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterGestion) params.gestion = filterGestion;
      if (filterCarrera) params.careerId = filterCarrera;
      if (filterSemestre) params.semester = parseInt(filterSemestre);

      const response = await api.get(`/grupos`, { params });
      setGrupos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupoDetails = async (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setLoadingDetails(true);
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        api.get(`/grupos/${grupo.id}/students`),
        api.get(`/asignaciones-docentes/group/${grupo.id}?gestion=${grupo.gestion}`),
      ]);
      setGrupoStudents(studentsRes.data || []);
      setGrupoAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/grupos', {
        career_id: parseInt(newForm.career_id),
        study_plan_id: parseInt(newForm.study_plan_id) || undefined,
        subject_id: parseInt(newForm.subject_id) || undefined,
        semester: parseInt(newForm.semester),
        shift_id: parseInt(newForm.shift_id) || undefined,
        parallel: newForm.parallel.toUpperCase(),
        gestion: newForm.gestion,
        periodo: newForm.periodo,
        capacity: parseInt(newForm.capacity) || 30,
      });
      setModalOpen(false);
      fetchGrupos();
    } catch (error) {
      console.error('Error creating grupo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!generateForm.study_plan_id) {
      setGenerateResult({ created: 0, message: 'Selecciona un plan de estudios' });
      return;
    }
    setSaving(true);
    try {
      const result = await api.post('/grupos/generate', {
        gestion: generateForm.gestion,
        periodo: generateForm.periodo,
        shift_ids: generateForm.shift_ids,
        parallels: generateForm.parallels,
        study_plan_id: parseInt(generateForm.study_plan_id),
        capacidad: generateForm.capacidad,
      });
      setGenerateResult(result.data);
      if (result.data.created > 0) {
        fetchGrupos();
      }
    } catch (error) {
      console.error('Error generating groups:', error);
      setGenerateResult({ created: 0, message: 'Error al generar grupos' });
    } finally {
      setSaving(false);
    }
  };

  const fetchPlanesPorCarrera = async (careerId: string) => {
    if (!careerId) {
      setPlanesCarrera([]);
      return;
    }
    try {
      const response = await api.get(`/planes-estudio/current/${careerId}`);
      setPlanesCarrera(response.data || []);
    } catch (error) {
      console.error('Error fetching planes:', error);
      setPlanesCarrera([]);
    }
  };

  const handleDelete = async () => {
    if (!deletingGrupo) return;
    setSaving(true);
    try {
      await api.delete(`/grupos/${deletingGrupo.id}`);
      setDeleteModalOpen(false);
      setDeletingGrupo(null);
      setSelectedGrupo(null);
      fetchGrupos();
    } catch (error) {
      console.error('Error deleting grupo:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredGrupos = grupos.filter(g => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      g.parallel.toLowerCase().includes(search) ||
      g.turno?.name?.toLowerCase().includes(search) ||
      g.carrera?.name?.toLowerCase().includes(search)
    );
  });

  const getSemesters = () => Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}° Semestre`,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Grupos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Grupos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGenerateModalOpen(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Generar Grupos
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle>Lista de Grupos</CardTitle>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar grupo..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterGestion}
                onChange={(e) => setFilterGestion(e.target.value)}
                options={[
                  { value: '', label: 'Todas las gestiones' },
                  ...gestiones.map(g => ({ value: g.year, label: g.year }))
                ]}
              />
              <Select
                value={filterCarrera}
                onChange={(e) => setFilterCarrera(e.target.value)}
                options={[
                  { value: '', label: 'Todas las carreras' },
                  ...carreras.map(c => ({ value: c.id.toString(), label: c.name }))
                ]}
              />
              <Select
                value={filterSemestre}
                onChange={(e) => setFilterSemestre(e.target.value)}
                options={[
                  { value: '', label: 'Todos los semestres' },
                  ...getSemesters()
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Sem</TableHead>
                  <TableHead>Cap</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrupos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron grupos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrupos.map((grupo) => (
                    <TableRow
                      key={grupo.id}
                      className={selectedGrupo?.id === grupo.id ? 'bg-primary-50' : ''}
                    >
                      <TableCell className="font-medium">
                        <button
                          onClick={() => fetchGrupoDetails(grupo)}
                          className="text-primary-600 hover:underline text-left"
                        >
                          <div className="font-bold">{grupo.code}</div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{grupo.materia?.code || '-'}</div>
                        <div className="text-xs text-gray-500">{grupo.materia?.name || '-'}</div>
                      </TableCell>
                      <TableCell>{grupo.semester}°</TableCell>
                      <TableCell>{grupo.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/grupos/${grupo.id}`)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setDeletingGrupo(grupo);
                            setDeleteModalOpen(true);
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedGrupo && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalles del Grupo: {selectedGrupo.parallel} - {selectedGrupo.turno?.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedGrupo(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Estudiantes ({grupoStudents.length}/{selectedGrupo.capacity})
                  </h4>
                  {grupoStudents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay estudiantes en este grupo</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {grupoStudents.map((sg) => (
                        <div key={sg.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {sg.estudiante?.persona?.names} {sg.estudiante?.persona?.lastname_paternal}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sg.estudiante?.persona?.ci} · {sg.estudiante?.inscription_code}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Docentes Asignados
                  </h4>
                  {grupoAssignments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay docentes asignados</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {grupoAssignments.map((a) => (
                        <div key={a.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {a.docente?.persona?.names} {a.docente?.persona?.lastname_paternal}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.materia?.code} - {a.materia?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Grupo" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestion *</label>
              <Input
                value={newForm.gestion}
                onChange={(e) => setNewForm({ ...newForm, gestion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={newForm.periodo}
                onChange={(e) => setNewForm({ ...newForm, periodo: e.target.value })}
              >
                <option value="I">I (Primer Semestre)</option>
                <option value="II">II (Segundo Semestre)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paralelo *</label>
              <Input
                value={newForm.parallel}
                onChange={(e) => setNewForm({ ...newForm, parallel: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={newForm.semester}
                onChange={(e) => setNewForm({ ...newForm, semester: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {getSemesters().map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <Input
                type="number"
                value={newForm.capacity}
                onChange={(e) => setNewForm({ ...newForm, capacity: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={newForm.career_id}
              onChange={(e) => setNewForm({ ...newForm, career_id: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newForm.career_id || !newForm.semester || !newForm.parallel}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Grupo'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingGrupo(null); }}
        onConfirm={handleDelete}
        title="Eliminar Grupo"
        message={`¿Estás seguro de eliminar el grupo "${deletingGrupo?.parallel}"?`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />

      <Modal
        open={generateModalOpen}
        onClose={() => { setGenerateModalOpen(false); setGenerateResult(null); setPlanesCarrera([]); }}
        title="Generar Grupos"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Genera grupos automáticamente para las materias de un plan de estudios.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Input
                value={generateForm.gestion}
                onChange={(e) => setGenerateForm({ ...generateForm, gestion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={generateForm.periodo}
                onChange={(e) => setGenerateForm({ ...generateForm, periodo: e.target.value })}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={generateForm.career_id}
              onChange={(e) => {
                setGenerateForm({ ...generateForm, career_id: e.target.value, study_plan_id: '' });
                fetchPlanesPorCarrera(e.target.value);
              }}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Estudios *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={generateForm.study_plan_id}
              onChange={(e) => setGenerateForm({ ...generateForm, study_plan_id: e.target.value })}
              disabled={!generateForm.career_id}
            >
              <option value="">Seleccionar...</option>
              {planesCarrera.map(p => (
                <option key={p.id} value={p.id}>{p.rm_number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turnos *</label>
            <div className="flex flex-wrap gap-2">
              {turnos.map(turno => (
                <label key={turno.id} className="flex items-center gap-1 px-3 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={generateForm.shift_ids.includes(turno.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGenerateForm({ ...generateForm, shift_ids: [...generateForm.shift_ids, turno.id] });
                      } else {
                        setGenerateForm({ ...generateForm, shift_ids: generateForm.shift_ids.filter(id => id !== turno.id) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{turno.code}</span>
                  <span className="text-xs text-gray-500">({turno.name})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paralelos *</label>
            <div className="flex flex-wrap gap-2">
              {['A', 'B', 'C'].map(p => (
                <label key={p} className="flex items-center gap-1 px-3 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={generateForm.parallels.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGenerateForm({ ...generateForm, parallels: [...generateForm.parallels, p] });
                      } else {
                        setGenerateForm({ ...generateForm, parallels: generateForm.parallels.filter(x => x !== p) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad por grupo</label>
            <Input
              type="number"
              value={generateForm.capacidad}
              onChange={(e) => setGenerateForm({ ...generateForm, capacidad: e.target.value })}
              placeholder="30"
            />
          </div>

          {generateResult && (
            <div className={`p-3 rounded-lg ${generateResult.created > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {generateResult.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setGenerateModalOpen(false); setGenerateResult(null); setPlanesCarrera([]); }}>
              Cerrar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={saving || !generateForm.study_plan_id || generateForm.shift_ids.length === 0 || generateForm.parallels.length === 0}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Grupos'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
