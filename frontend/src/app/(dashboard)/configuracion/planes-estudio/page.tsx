'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro } from '@/componentes/iu/barra-filtros';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { Search, Plus, Edit2, Trash2, Loader2, BookOpen } from 'lucide-react';

interface PlanEstudio {
  id: number;
  carreraId: number;
  numeroRm: string;
  fechaRm: string;
  estado: 'vigente' | 'historico';
  notas: string | null;
  carrera?: { id: number; codigo: string; nombre: string };
  creadoEn: string;
  actualizadoEn: string;
}

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

export default function PaginaPlanesEstudio() {
  const router = useRouter();
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [planEliminando, setPlanEliminando] = useState<PlanEstudio | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerPlanes();
    obtenerCarreras();
  }, []);

  const obtenerPlanes = async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroCarrera) parametros.append('careerId', filtroCarrera);
      if (filtroEstado) parametros.append('status', filtroEstado);

      const respuesta = await api.get(`/planes-estudio?${parametros.toString()}`);
      setPlanes(respuesta.data.datos?.data || respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al obtener los planes:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerCarreras = async () => {
    try {
      const respuesta = await api.get('/carreras/activos');
      setCarreras(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    }
  };

  useEffect(() => {
    obtenerPlanes();
  }, [filtroCarrera, filtroEstado]);

  const eliminar = async () => {
    if (!planEliminando) return;

    setGuardando(true);
    try {
      await api.delete(`/planes-estudio/${planEliminando.id}`);
      setModalEliminarAbierto(false);
      setPlanEliminando(null);
      obtenerPlanes();
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar el plan'));
      }).catch(() => {
        alert('Error al eliminar el plan');
      });
    } finally {
      setGuardando(false);
    }
  };

  const planesFiltrados = planes.filter(plan => {
    const busquedaMinusculas = consultaBusqueda.toLowerCase();
    return (
      plan.numeroRm.toLowerCase().includes(busquedaMinusculas) ||
      (plan.carrera?.nombre && plan.carrera.nombre.toLowerCase().includes(busquedaMinusculas)) ||
      (plan.carrera?.codigo && plan.carrera.codigo.toLowerCase().includes(busquedaMinusculas))
    );
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Configuración', href: '/configuracion' }, { etiqueta: 'Planes de Estudio' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Planes de Estudio</h1>
        <Boton onClick={() => router.push('/configuracion/planes-estudio/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <TituloTarjeta>Lista de Planes</TituloTarjeta>
            <div className="flex-1 flex flex-col md:flex-row gap-4 md:justify-end">
              <BuscadorFiltro
                placeholder="Buscar plan..."
                value={consultaBusqueda}
                onChange={setConsultaBusqueda}
                className="w-full md:w-48"
              />
              <Selector
                value={filtroCarrera}
                onChange={(e) => setFiltroCarrera(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todas las carreras' },
                  ...carreras.map(c => ({ value: c.id.toString(), etiqueta: c.nombre })),
                ]}
                placeholder="Carrera"
              />
              <Selector
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                opciones={[
                  { value: '', etiqueta: 'Todos los estados' },
                  { value: 'vigente', etiqueta: 'Vigente' },
                  { value: 'historico', etiqueta: 'Histórico' },
                ]}
                placeholder="Estado"
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>RM</CeldaEncabezado>
                <CeldaEncabezado>Fecha RM</CeldaEncabezado>
                <CeldaEncabezado>Carrera</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {planesFiltrados.length === 0 ? (
                <FilaTabla>
                  <CeldaTabla colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron planes de estudio
                  </CeldaTabla>
                </FilaTabla>
              ) : (
                planesFiltrados.map((plan) => (
                  <FilaTabla key={plan.id}>
                    <CeldaTabla className="font-medium">{plan.numeroRm}</CeldaTabla>
                    <CeldaTabla>{new Date(plan.fechaRm).toLocaleDateString()}</CeldaTabla>
                    <CeldaTabla>{plan.carrera?.nombre || '-'}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variante={plan.estado === 'vigente' ? 'exito' : 'secundario'}>
                        {plan.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <div className="flex items-center gap-2">
                        <Boton variante="fantasma" tamano="icono" onClick={() => router.push(`/planes-estudio/${plan.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Boton>
                        <Boton variante="fantasma" tamano="icono" onClick={() => router.push(`/planes-estudio/${plan.id}/materias`)}>
                          <BookOpen className="w-4 h-4" />
                        </Boton>
                        <Boton variante="fantasma" tamano="icono" onClick={() => { setPlanEliminando(plan); setModalEliminarAbierto(true); }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Boton>
                      </div>
                    </CeldaTabla>
                  </FilaTabla>
                ))
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        alCerrar={() => { setModalEliminarAbierto(false); setPlanEliminando(null); }}
        alConfirmar={eliminar}
        titulo="Eliminar Plan de Estudio"
        mensaje={`¿Estás seguro de eliminar el plan "${planEliminando?.numeroRm}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />
    </div>
  );
}
