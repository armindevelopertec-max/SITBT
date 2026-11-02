'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta, DescripcionTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Paginacion } from '@/componentes/iu/paginacion';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import {
  BarraFiltros,
  BuscadorFiltro,
  CampoFiltro,
} from '@/componentes/iu/barra-filtros';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { api } from '@/libreria/api';
import { Search, Lock, Unlock, Trash2, Loader2, Eye } from 'lucide-react';

interface Grupo {
  id: number;
  codigo: string;
  carreraId: number;
  planEstudioId: number;
  materiaId: number | null;
  semestre: number;
  turnoId: number;
  paralelo: string;
  gestion: string;
  periodoId: number | null;
  periodo?: Periodo | null;
  capacidad: number;
  estado: 'activo' | 'cerrado';
  carrera?: { id: number; codigo: string; nombre: string };
  plan_estudio?: { id: number; numeroRm: string };
  turno?: { id: number; codigo: string; nombre: string; horaInicio: string; horaFin: string };
  materia?: { id: number; codigo: string; nombre: string } | null;
  inscritos?: number;
  cuposDisponibles?: number;
}

interface Periodo {
  id: number;
  numero: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  gestion?: { id: number; anio: string } | null;
}

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

/** Periodo aplanado con su gestión, listo para los selectores. */
interface Turno {
  id: number;
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

export default function PaginaGrupos() {
  const router = useRouter();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [total, setTotal] = useState(0);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modales / acciones
  const [guardando, setGuardando] = useState(false);
  const [grupoEliminando, setGrupoEliminando] = useState<Grupo | null>(null);
  const [grupoCambiandoEstado, setGrupoCambiandoEstado] = useState<Grupo | null>(null);

  // Carga inicial
  useEffect(() => {
    obtenerDatosIniciales();
    obtenerGrupos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerDatosIniciales = async () => {
    try {
      const respuestaTurnos = await api.get('/turnos/todos');
      setTurnos(respuestaTurnos.data.datos || respuestaTurnos.data || []);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const obtenerGrupos = async () => {
    try {
      setCargando(true);
      const parametros: Record<string, string | number> = { pagina: 1, limite: 100 };

      const respuesta = await api.get('/grupos', { params: parametros });
      setGrupos(respuesta.data.datos || []);
      setTotal(respuesta.data.total || 0);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) =>
        alert(mensajeDeError(error, 'Error al obtener grupos')),
      );
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!grupoEliminando) return;
    setGuardando(true);
    try {
      await api.delete(`/grupos/${grupoEliminando.id}`);
      setGrupoEliminando(null);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar grupo'));
      });
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCambiarEstado = async () => {
    if (!grupoCambiandoEstado) return;
    setGuardando(true);
    try {
      const nuevoEstado = grupoCambiandoEstado.estado === 'activo' ? 'cerrado' : 'activo';
      await api.patch(`/grupos/${grupoCambiandoEstado.id}/estado`, { estado: nuevoEstado });
      setGrupoCambiandoEstado(null);
      obtenerGrupos();
    } catch (error) {
      console.error('Error al cambiar estado del grupo:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al cambiar el estado del grupo'));
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Grupos' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Grupos y Paralelos</h1>
      </div>

      <Tarjeta variante="conBorde">
        <ContenidoTarjeta>
          {cargando ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : (
            <>
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Código</CeldaEncabezado>
                    <CeldaEncabezado>Carrera</CeldaEncabezado>
                    <CeldaEncabezado>Nivel / Semestre</CeldaEncabezado>
                    <CeldaEncabezado>Periodo</CeldaEncabezado>
                    <CeldaEncabezado>Turno</CeldaEncabezado>
                    <CeldaEncabezado>Paralelo</CeldaEncabezado>
                    <CeldaEncabezado>Capacidad</CeldaEncabezado>
                    <CeldaEncabezado>Inscritos</CeldaEncabezado>
                    <CeldaEncabezado>Cupos</CeldaEncabezado>
                    <CeldaEncabezado>Estado</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {grupos.length === 0 ? (
                    <FilaTabla>
                      <CeldaTabla colSpan={11} className="text-center py-8 text-muted-foreground">
                        No se encontraron grupos
                      </CeldaTabla>
                    </FilaTabla>
                  ) : (
                    grupos.map((grupo) => (
                      <FilaTabla key={grupo.id}>
                        <CeldaTabla className="font-medium">
                          <button
                            onClick={() => router.push(`/grupos/${grupo.id}`)}
                            className="text-primary-600 dark:text-primary-400 hover:underline text-left font-bold"
                          >
                            {grupo.codigo}
                          </button>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm font-medium">{grupo.carrera?.nombre || '-'}</div>
                          <div className="text-xs text-muted-foreground">{grupo.carrera?.codigo || ''}</div>
                        </CeldaTabla>
                        <CeldaTabla>{grupo.semestre}.º semestre</CeldaTabla>
                        <CeldaTabla>
                          <Insignia variante="primario">
                            {grupo.periodo ? `${grupo.periodo.gestion?.anio || ''} · ${grupo.periodo.numero}` : '-'}
                          </Insignia>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="text-sm">{grupo.turno?.nombre || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            {grupo.turno ? `${grupo.turno.horaInicio} - ${grupo.turno.horaFin}` : ''}
                          </div>
                        </CeldaTabla>
                        <CeldaTabla>{grupo.paralelo}</CeldaTabla>
                        <CeldaTabla>{grupo.capacidad}</CeldaTabla>
                        <CeldaTabla>{grupo.inscritos ?? 0}</CeldaTabla>
                        <CeldaTabla>{grupo.cuposDisponibles ?? grupo.capacidad}</CeldaTabla>
                        <CeldaTabla>
                          <Insignia variante={grupo.estado === 'activo' ? 'exito' : 'secundario'}>
                            {grupo.estado === 'activo' ? 'Activo' : 'Cerrado'}
                          </Insignia>
                        </CeldaTabla>
                        <CeldaTabla>
                          <div className="flex items-center justify-end gap-1">
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Ver detalle"
                              onClick={() => router.push(`/grupos/${grupo.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Boton>
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title={grupo.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar grupo'}
                              onClick={() => setGrupoCambiandoEstado(grupo)}
                            >
                              {grupo.estado === 'activo' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Boton>
                            <Boton
                              variante="fantasma"
                              tamano="icono"
                              title="Eliminar"
                              onClick={() => setGrupoEliminando(grupo)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Boton>
                          </div>
                        </CeldaTabla>
                      </FilaTabla>
                    ))
                  )}
                </CuerpoTabla>
              </Tabla>
              <Paginacion
                className="mt-4"
                pagina={1}
                totalPaginas={1}
                alCambiar={() => {}}
                informacion={`Mostrando ${grupos.length} de ${total} grupo(s).`}
              />
            </>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Confirmación de eliminación */}
      <ModalConfirmacion
        abierto={!!grupoEliminando}
        alCerrar={() => setGrupoEliminando(null)}
        alConfirmar={confirmarEliminar}
        titulo="Eliminar grupo"
        mensaje={`¿Estás seguro de eliminar el grupo "${grupoEliminando?.codigo}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />

      {/* Confirmación de cambio de estado */}
      <ModalConfirmacion
        abierto={!!grupoCambiandoEstado}
        alCerrar={() => setGrupoCambiandoEstado(null)}
        alConfirmar={confirmarCambiarEstado}
        titulo={grupoCambiandoEstado?.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar grupo'}
        mensaje={
          grupoCambiandoEstado?.estado === 'activo'
            ? `El grupo "${grupoCambiandoEstado?.codigo}" pasará a estado cerrado.`
            : `El grupo "${grupoCambiandoEstado?.codigo}" volverá a estar activo.`
        }
        textoConfirmar={grupoCambiandoEstado?.estado === 'activo' ? 'Cerrar grupo' : 'Reactivar'}
        cargando={guardando}
      />
    </div>
  );
}
