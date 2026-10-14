'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Insignia } from '@/components/ui/insignia';
import { Modal } from '@/components/ui/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Edit2, Trash2, Loader2, Users, UserCheck, BookOpen, ArrowLeft } from 'lucide-react';

interface Grupo {
  id: number;
  codigo: string;
  carreraId: number;
  planEstudioId: number;
  materiaId: number;
  semestre: number;
  turnoId: number;
  paralelo: string;
  gestion: string;
  periodo: string;
  capacidad: number;
  carrera?: { id: number; codigo: string; nombre: string };
  turno?: { id: number; codigo: string; nombre: string; horaInicio: string; horaFin: string };
  plan_estudio?: { numeroRm: string };
  materia?: { id: number; codigo: string; nombre: string };
}

interface StudentInGroup {
  id: number;
  grupoId: number;
  estudianteId: number;
  inscritoEn: string;
  estudiante?: {
    id: number;
    codigoInscripcion: string;
    persona?: {
      ci: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
}

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

interface Gestion {
  id: number;
  anio: string;
  esActual: boolean;
}

interface Personal {
  id: number;
  personaId: number;
  cargo: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface AsignacionDocente {
  id: number;
  docenteId: number;
  materiaId: number;
  grupoId: number;
  gestion: string;
  estado: string;
  docente?: Personal;
  materia?: {
    id: number;
    codigo: string;
    nombre: string;
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
  const [grupoAssignments, setGrupoAssignments] = useState<AsignacionDocente[]>([]);
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
    turnoIds: [] as number[],
    paralelos: ['A'],
    carreraId: '' as string,
    planEstudioId: '' as string,
    capacidad: '30',
  });
  const [generateResult, setGenerateResult] = useState<{ creados: number; mensaje: string } | null>(null);

  const [newForm, setNewForm] = useState({
    carreraId: '',
    planEstudioId: '',
    materiaId: '',
    semestre: '',
    turnoId: '',
    paralelo: '',
    gestion: new Date().getFullYear().toString(),
    periodo: 'I',
    capacidad: '30',
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
        api.get('/carreras/activos'),
        api.get('/gestiones'),
        api.get('/turnos/todos'),
      ]);
      setCarreras(carrerasRes.data || []);
      const allGestiones = gestionesRes.data.datos || gestionesRes.data || [];
      setGestiones(allGestiones);
      setTurnos(turnosRes.data.datos || turnosRes.data || []);

      const current = allGestiones.find((g: any) => g.esActual);
      if (current) {
        setFilterGestion(current.anio);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const params: any = { limite: 100 };
      if (filterGestion) params.gestion = filterGestion;
      if (filterCarrera) params.careerId = filterCarrera;
      if (filterSemestre) params.semester = parseInt(filterSemestre);

      const response = await api.get(`/grupos`, { params });
      setGrupos(response.data.datos || []);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupoDetails = async (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setLoadingDetails(true);
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        api.get(`/grupos/${grupo.id}/estudiantes`),
        api.get(`/asignaciones-docentes/grupo/${grupo.id}?gestion=${grupo.gestion}`),
      ]);
      setGrupoStudents(studentsRes.data || []);
      setGrupoAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/grupos', {
        carreraId: parseInt(newForm.carreraId),
        planEstudioId: parseInt(newForm.planEstudioId) || undefined,
        materiaId: parseInt(newForm.materiaId) || undefined,
        semestre: parseInt(newForm.semestre),
        turnoId: parseInt(newForm.turnoId) || undefined,
        paralelo: newForm.paralelo.toUpperCase(),
        gestion: newForm.gestion,
        periodo: newForm.periodo,
        capacidad: parseInt(newForm.capacidad) || 30,
      });
      setModalOpen(false);
      fetchGrupos();
    } catch (error) {
      console.error('Error al crear grupo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!generateForm.planEstudioId) {
      setGenerateResult({ creados: 0, mensaje: 'Selecciona un plan de estudios' });
      return;
    }
    setSaving(true);
    try {
      const result = await api.post('/grupos/generar', {
        gestion: generateForm.gestion,
        periodo: generateForm.periodo,
        turnoIds: generateForm.turnoIds,
        paralelos: generateForm.paralelos,
        planEstudioId: parseInt(generateForm.planEstudioId),
        capacidad: generateForm.capacidad,
      });
      setGenerateResult(result.data);
      if (result.data.creados > 0) {
        fetchGrupos();
      }
    } catch (error) {
      console.error('Error al generar grupos:', error);
      setGenerateResult({ creados: 0, mensaje: 'Error al generar grupos' });
    } finally {
      setSaving(false);
    }
  };

  const fetchPlanesPorCarrera = async (carreraId: string) => {
    if (!carreraId) {
      setPlanesCarrera([]);
      return;
    }
    try {
      const response = await api.get(`/planes-estudio/actual/${carreraId}`);
      setPlanesCarrera(response.data || []);
    } catch (error) {
      console.error('Error al obtener planes:', error);
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
      console.error('Error al eliminar grupo:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredGrupos = grupos.filter(g => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      g.paralelo.toLowerCase().includes(search) ||
      g.turno?.nombre?.toLowerCase().includes(search) ||
      g.carrera?.nombre?.toLowerCase().includes(search)
    );
  });

  const getSemesters = () => Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}° Semestre`,
  }));

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Grupos' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h1>
        <div className="flex gap-2">
          <Boton variant="outline" onClick={() => setGenerateModalOpen(true)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Generar Grupos
          </Boton>
          <Boton onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Grupo
          </Boton>
        </div>
      </div>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Grupos</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar grupo..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Selector
                value={filterGestion}
                onChange={(e) => setFilterGestion(e.target.value)}
                options={[
                  { value: '', label: 'Todas las gestiones' },
                  ...gestiones.map(g => ({ value: g.anio, label: g.anio }))
                ]}
              />
              <Selector
                value={filterCarrera}
                onChange={(e) => setFilterCarrera(e.target.value)}
                options={[
                  { value: '', label: 'Todas las carreras' },
                  ...carreras.map(c => ({ value: c.id.toString(), label: c.nombre }))
                ]}
              />
              <Selector
                value={filterSemestre}
                onChange={(e) => setFilterSemestre(e.target.value)}
                options={[
                  { value: '', label: 'Todos los semestres' },
                  ...getSemesters()
                ]}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Código</CeldaEncabezado>
                  <CeldaEncabezado>Materia</CeldaEncabezado>
                  <CeldaEncabezado>Sem</CeldaEncabezado>
                  <CeldaEncabezado>Cap</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {filteredGrupos.length === 0 ? (
                  <FilaTabla>
                    <CeldaTabla colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron grupos
                    </CeldaTabla>
                  </FilaTabla>
                ) : (
                  filteredGrupos.map((grupo) => (
                    <FilaTabla
                      key={grupo.id}
                      className={selectedGrupo?.id === grupo.id ? 'bg-primary-50' : ''}
                    >
                      <CeldaTabla className="font-medium">
                        <button
                          onClick={() => fetchGrupoDetails(grupo)}
                          className="text-primary-600 hover:underline text-left"
                        >
                          <div className="font-bold">{grupo.codigo}</div>
                        </button>
                      </CeldaTabla>
                      <CeldaTabla>
                        <div className="text-sm font-medium">{grupo.materia?.codigo || '-'}</div>
                        <div className="text-xs text-gray-500">{grupo.materia?.nombre || '-'}</div>
                      </CeldaTabla>
                      <CeldaTabla>{grupo.semestre}°</CeldaTabla>
                      <CeldaTabla>{grupo.capacidad}</CeldaTabla>
                      <CeldaTabla>
                        <div className="flex items-center gap-2">
                          <Boton variant="ghost" size="icon" onClick={() => router.push(`/grupos/${grupo.id}`)}>
                            <Edit2 className="w-4 h-4" />
                          </Boton>
                          <Boton variant="ghost" size="icon" onClick={() => {
                            setDeletingGrupo(grupo);
                            setDeleteModalOpen(true);
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Boton>
                        </div>
                      </CeldaTabla>
                    </FilaTabla>
                  ))
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {selectedGrupo && (
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <div className="flex items-center justify-between">
              <TituloTarjeta className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalles del Grupo: {selectedGrupo.paralelo} - {selectedGrupo.turno?.nombre}
              </TituloTarjeta>
              <Boton variant="ghost" size="icon" onClick={() => setSelectedGrupo(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Boton>
            </div>
          </EncabezadoTarjeta>
          <ContenidoTarjeta>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Estudiantes ({grupoStudents.length}/{selectedGrupo.capacidad})
                  </h4>
                  {grupoStudents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay estudiantes en este grupo</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {grupoStudents.map((sg) => (
                        <div key={sg.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">
                            {sg.estudiante?.persona?.nombres} {sg.estudiante?.persona?.apellidoPaterno}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sg.estudiante?.persona?.ci} · {sg.estudiante?.codigoInscripcion}
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
                            {a.docente?.persona?.nombres} {a.docente?.persona?.apellidoPaterno}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.materia?.codigo} - {a.materia?.nombre}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ContenidoTarjeta>
        </Tarjeta>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Grupo" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestión *</label>
              <Entrada
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
              <Entrada
                value={newForm.paralelo}
                onChange={(e) => setNewForm({ ...newForm, paralelo: e.target.value.toUpperCase() })}
                placeholder="A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre *</label>
              <select
                className="w-full h-10 px-3 border rounded-lg text-sm"
                value={newForm.semestre}
                onChange={(e) => setNewForm({ ...newForm, semestre: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {getSemesters().map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <Entrada
                type="number"
                value={newForm.capacidad}
                onChange={(e) => setNewForm({ ...newForm, capacidad: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={newForm.carreraId}
              onChange={(e) => setNewForm({ ...newForm, carreraId: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Boton>
            <Boton onClick={handleCreate} disabled={saving || !newForm.carreraId || !newForm.semestre || !newForm.paralelo}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Grupo'}
            </Boton>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingGrupo(null); }}
        onConfirm={handleDelete}
        title="Eliminar Grupo"
        message={`¿Estás seguro de eliminar el grupo "${deletingGrupo?.paralelo}"?`}
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
              <Entrada
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
              value={generateForm.carreraId}
              onChange={(e) => {
                setGenerateForm({ ...generateForm, carreraId: e.target.value, planEstudioId: '' });
                fetchPlanesPorCarrera(e.target.value);
              }}
            >
              <option value="">Seleccionar...</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Estudios *</label>
            <select
              className="w-full h-10 px-3 border rounded-lg text-sm"
              value={generateForm.planEstudioId}
              onChange={(e) => setGenerateForm({ ...generateForm, planEstudioId: e.target.value })}
              disabled={!generateForm.carreraId}
            >
              <option value="">Seleccionar...</option>
              {planesCarrera.map(p => (
                <option key={p.id} value={p.id}>{p.numeroRm}</option>
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
                    checked={generateForm.turnoIds.includes(turno.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGenerateForm({ ...generateForm, turnoIds: [...generateForm.turnoIds, turno.id] });
                      } else {
                        setGenerateForm({ ...generateForm, turnoIds: generateForm.turnoIds.filter(id => id !== turno.id) });
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{turno.codigo}</span>
                  <span className="text-xs text-gray-500">({turno.nombre})</span>
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
                    checked={generateForm.paralelos.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGenerateForm({ ...generateForm, paralelos: [...generateForm.paralelos, p] });
                      } else {
                        setGenerateForm({ ...generateForm, paralelos: generateForm.paralelos.filter(x => x !== p) });
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
            <Entrada
              type="number"
              value={generateForm.capacidad}
              onChange={(e) => setGenerateForm({ ...generateForm, capacidad: e.target.value })}
              placeholder="30"
            />
          </div>

          {generateResult && (
            <div className={`p-3 rounded-lg ${generateResult.creados > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {generateResult.mensaje}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton variant="outline" onClick={() => { setGenerateModalOpen(false); setGenerateResult(null); setPlanesCarrera([]); }}>
              Cerrar
            </Boton>
            <Boton
              onClick={handleGenerate}
              disabled={saving || !generateForm.planEstudioId || generateForm.turnoIds.length === 0 || generateForm.paralelos.length === 0}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Grupos'}
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
