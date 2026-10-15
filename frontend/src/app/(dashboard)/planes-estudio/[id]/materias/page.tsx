'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { api } from '@/libreria/api';
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

export default function PaginaMateriasPlan() {
  const router = useRouter();
  const parametros = useParams();
  const idPlan = parametros.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [materiasPlan, setMateriasPlan] = useState<MateriaPlan[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<Materia[]>([]);
  const [materiaEditando, setMateriaEditando] = useState<MateriaPlan | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [agregandoASemestre, setAgregandoASemestre] = useState<number | null>(null);
  const [busquedaMateria, setBusquedaMateria] = useState('');
  const [busquedaPrerrequisito, setBusquedaPrerrequisito] = useState('');
  const [idMateriaNueva, setIdMateriaNueva] = useState<number | null>(null);
  const [horasSemanalesNuevas, setHorasSemanalesNuevas] = useState<number>(0);
  const [idPrerrequisitoNuevo, setIdPrerrequisitoNuevo] = useState<number | null>(null);

  const materiasFiltradas = materiasDisponibles.filter(materia => {
    if (!busquedaMateria) return true;
    const busqueda = busquedaMateria.toLowerCase();
    return materia.codigo.toLowerCase().includes(busqueda) || materia.nombre.toLowerCase().includes(busqueda);
  });

  const prerrequisitosFiltrados = materiasDisponibles.filter(materia => {
    if (!busquedaPrerrequisito) return true;
    const busqueda = busquedaPrerrequisito.toLowerCase();
    return materia.codigo.toLowerCase().includes(busqueda) || materia.nombre.toLowerCase().includes(busqueda);
  });

  useEffect(() => {
    obtenerPlan();
    obtenerMateriasDisponibles();
  }, [idPlan]);

  useEffect(() => {
    if (plan) {
      obtenerMateriasPlan();
    }
  }, [plan]);

  const obtenerPlan = async () => {
    try {
      const respuesta = await api.get(`/planes-estudio/${idPlan}`);
      setPlan(respuesta.data);
    } catch (error) {
      console.error('Error al obtener el plan:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerMateriasPlan = async () => {
    try {
      const respuesta = await api.get(`/planes-estudio/${idPlan}/materias`);
      setMateriasPlan(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las materias del plan:', error);
    }
  };

  const obtenerMateriasDisponibles = async () => {
    try {
      const respuesta = await api.get('/materias/todos');
      setMateriasDisponibles(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las materias:', error);
    }
  };

  const obtenerMateriasSemestre = (semestre: number) => {
    return materiasPlan.filter(materiaPlan => materiaPlan.semestre === semestre);
  };

  const obtenerMaxSemestre = () => {
    if (materiasPlan.length === 0) return 6;
    return Math.max(...materiasPlan.map(materiaPlan => materiaPlan.semestre));
  };

  const obtenerTotalHoras = (semestre: number) => {
    return obtenerMateriasSemestre(semestre).reduce((suma, materiaPlan) => suma + materiaPlan.horasSemanales, 0);
  };

  const iniciarAgregar = (semestre: number) => {
    setAgregandoASemestre(semestre);
    setBusquedaMateria('');
    setBusquedaPrerrequisito('');
    setIdMateriaNueva(null);
    setHorasSemanalesNuevas(0);
    setIdPrerrequisitoNuevo(null);
    setErrores({});
  };

  const cancelarAgregar = () => {
    setAgregandoASemestre(null);
    setBusquedaMateria('');
    setBusquedaPrerrequisito('');
    setIdMateriaNueva(null);
    setHorasSemanalesNuevas(0);
    setIdPrerrequisitoNuevo(null);
  };

  const guardarNuevaMateria = async () => {
    if (!idMateriaNueva || !horasSemanalesNuevas) {
      setErrores({ submit: 'Selecciona una materia e ingresa las horas' });
      return;
    }

    setGuardando(true);
    setErrores({});

    try {
      await api.post(`/planes-estudio/${idPlan}/materias`, {
        materiaId: idMateriaNueva,
        semestre: agregandoASemestre,
        horasSemanales: horasSemanalesNuevas,
        prerrequisitoId: idPrerrequisitoNuevo || null,
      });
      cancelarAgregar();
      obtenerMateriasPlan();
    } catch (error: any) {
      console.error('Error al guardar la materia:', error);
      setErrores({ submit: error.response?.data?.mensaje || 'Error al guardar materia' });
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicionMateria = (materiaPlan: MateriaPlan) => {
    setMateriaEditando({ ...materiaPlan });
  };

  const cancelarEdicionMateria = () => {
    setMateriaEditando(null);
  };

  const guardarEdicionMateria = async () => {
    if (!materiaEditando) return;

    setGuardando(true);
    try {
      await api.patch(`/planes-estudio/${idPlan}/materias/${materiaEditando.id}`, {
        semestre: materiaEditando.semestre,
        horasSemanales: materiaEditando.horasSemanales,
      });
      setMateriaEditando(null);
      obtenerMateriasPlan();
    } catch (error: any) {
      console.error('Error al actualizar la materia:', error);
      setErrores({ submit: error.response?.data?.mensaje || 'Error al actualizar materia' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMateria = async (idMateriaPlan: number) => {
    try {
      await api.delete(`/planes-estudio/${idPlan}/materias/${idMateriaPlan}`);
      obtenerMateriasPlan();
    } catch (error) {
      console.error('Error al eliminar la materia:', error);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boton variante="fantasma" tamano="icono" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Boton>
        <Migas elementos={[
          { etiqueta: 'Configuración', href: '/configuracion' },
          { etiqueta: 'Planes de Estudio', href: '/planes-estudio' },
          { etiqueta: `${plan?.numeroRm} - ${plan?.carrera?.nombre || 'Cargando...'}` }
        ]} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Plan de Estudios: {plan?.numeroRm}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Insignia variante="contorno">{plan?.carrera?.codigo}</Insignia>
            <span className="text-gray-500">{plan?.carrera?.nombre}</span>
            <Insignia variante={plan?.estado === 'vigente' ? 'exito' : 'secundario'}>
              {plan?.estado}
            </Insignia>
          </div>
        </div>
      </div>

      {errores.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errores.submit}
        </div>
      )}

      <div className="space-y-6">
        {materiasPlan.length === 0 && agregandoASemestre === null ? (
          <Tarjeta variante="conBorde">
            <ContenidoTarjeta className="py-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No hay materias asignadas</p>
              <p className="text-sm mb-4">
                Comienza agregando materias a los semestres.
              </p>
              <Boton onClick={() => iniciarAgregar(1)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Materias al Semestre 1
              </Boton>
            </ContenidoTarjeta>
          </Tarjeta>
        ) : (
          Array.from({ length: obtenerMaxSemestre() }, (_, indice) => indice + 1).map(semestre => {
            const materiasSemestre = obtenerMateriasSemestre(semestre);
            const totalHoras = obtenerTotalHoras(semestre);
            const estaAgregando = agregandoASemestre === semestre;

            return (
              <Tarjeta key={semestre} variante="conBorde">
                <EncabezadoTarjeta className="bg-gray-50 py-3">
                  <div className="flex items-center justify-between">
                    <TituloTarjeta className="text-lg">Semestre {semestre}</TituloTarjeta>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {materiasSemestre.length} materia{materiasSemestre.length !== 1 ? 's' : ''}
                      </span>
                      <Insignia variante="contorno">{totalHoras} horas/semana</Insignia>
                      {!estaAgregando && (
                        <Boton tamano="pequeno" variante="contorno" onClick={() => iniciarAgregar(semestre)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar
                        </Boton>
                      )}
                    </div>
                  </div>
                </EncabezadoTarjeta>

                <ContenidoTarjeta className="p-4">
                  {estaAgregando && (
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
                                value={busquedaMateria}
                                onChange={(e) => setBusquedaMateria(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {busquedaMateria && materiasFiltradas.length > 0 && (
                              <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg border shadow-lg max-h-40 overflow-y-auto">
                                {materiasFiltradas.map(materia => (
                                  <div
                                    key={materia.id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setIdMateriaNueva(materia.id);
                                      setBusquedaMateria(`${materia.codigo} - ${materia.nombre}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{materia.codigo}</span>
                                    <span className="text-gray-500 text-sm ml-2">{materia.nombre}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {idMateriaNueva && busquedaMateria && (
                              <div className="mt-1 px-2 py-1 bg-green-100 rounded text-xs text-green-700">
                                Seleccionado: {materiasDisponibles.find(materia => materia.id === idMateriaNueva)?.codigo} - {materiasDisponibles.find(materia => materia.id === idMateriaNueva)?.nombre}
                              </div>
                            )}
                          </div>

                          <div className="w-24">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Horas/Sem</label>
                            <Entrada
                              type="number"
                              value={horasSemanalesNuevas || ''}
                              onChange={(e) => setHorasSemanalesNuevas(parseInt(e.target.value) || 0)}
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
                                value={busquedaPrerrequisito}
                                onChange={(e) => setBusquedaPrerrequisito(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {busquedaPrerrequisito && prerrequisitosFiltrados.length > 0 && (
                              <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg border shadow-lg max-h-40 overflow-y-auto">
                                {prerrequisitosFiltrados.filter(prerrequisito => prerrequisito.id !== idMateriaNueva).map(prerrequisito => (
                                  <div
                                    key={prerrequisito.id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setIdPrerrequisitoNuevo(prerrequisito.id);
                                      setBusquedaPrerrequisito(`${prerrequisito.codigo} - ${prerrequisito.nombre}`);
                                    }}
                                  >
                                    <span className="font-medium text-sm">{prerrequisito.codigo}</span>
                                    <span className="text-gray-500 text-sm ml-2">{prerrequisito.nombre}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {idPrerrequisitoNuevo && (
                              <div className="mt-1 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700">
                                Prerrequisito: {materiasDisponibles.find(materia => materia.id === idPrerrequisitoNuevo)?.codigo}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Boton variante="contorno" tamano="pequeno" onClick={cancelarAgregar}>
                            Cancelar
                          </Boton>
                          <Boton tamano="pequeno" onClick={guardarNuevaMateria} disabled={guardando}>
                            {guardando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                            Agregar
                          </Boton>
                        </div>
                      </div>
                    </div>
                  )}

                  {materiasSemestre.length === 0 && !estaAgregando ? (
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
                        {materiasSemestre.map(materiaPlan => (
                          <FilaTabla key={materiaPlan.id}>
                            <CeldaTabla className="font-medium">{materiaPlan.materia?.codigo || materiaPlan.materiaId}</CeldaTabla>
                            <CeldaTabla>{materiaPlan.materia?.nombre || '-'}</CeldaTabla>
                            <CeldaTabla className="text-center">{materiaPlan.horasSemanales}</CeldaTabla>
                            <CeldaTabla>
                              {materiaPlan.prerrequisitoId ? (
                                <Insignia variante="secundario">{materiaPlan.prerrequisito?.codigo || materiaPlan.prerrequisitoId}</Insignia>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </CeldaTabla>
                            <CeldaTabla className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Boton variante="fantasma" tamano="icono" onClick={() => iniciarEdicionMateria(materiaPlan)}>
                                  <Edit2 className="w-4 h-4" />
                                </Boton>
                                <Boton variante="fantasma" tamano="icono" onClick={() => eliminarMateria(materiaPlan.id)}>
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
