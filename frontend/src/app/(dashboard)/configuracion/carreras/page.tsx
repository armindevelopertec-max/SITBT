'use client';

import { useEffect, useState } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { BuscadorFiltro, FilaFiltros, CampoFiltro } from '@/componentes/iu/barra-filtros';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal } from '@/componentes/iu/modal';
import { Loader2, Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { api } from '@/libreria/api';

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
  estado: string;
  creadoEn: string;
}

interface DatosFormularioCarrera {
  nombre: string;
  codigo: string;
  descripcion: string;
  area: string;
}

export default function PaginaCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [carreraEditando, setCarreraEditando] = useState<Carrera | null>(null);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [carreraEliminando, setCarreraEliminando] = useState<Carrera | null>(null);
  const [formulario, setFormulario] = useState<DatosFormularioCarrera>({
    nombre: '',
    codigo: '',
    descripcion: '',
    area: '',
  });

  const obtenerCarreras = async () => {
    try {
      setCargando(true);
      const parametros: any = {};
      if (filtroEstado) parametros.status = filtroEstado;
      const respuesta = await api.get('/carreras', { params: parametros });
      setCarreras(respuesta.data.datos || respuesta.data);
    } catch (error) {
      console.error('Error al obtener las carreras:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCarreras();
  }, [filtroEstado]);

  const carrerasFiltradas = carreras.filter((carrera) => {
    const busqueda = terminoBusqueda.toLowerCase();
    return (
      carrera.nombre.toLowerCase().includes(busqueda) ||
      carrera.codigo.toLowerCase().includes(busqueda) ||
      carrera.area.toLowerCase().includes(busqueda)
    );
  });

  const abrirModal = (carrera?: Carrera) => {
    if (carrera) {
      setCarreraEditando(carrera);
      setFormulario({
        nombre: carrera.nombre,
        codigo: carrera.codigo,
        descripcion: carrera.descripcion || '',
        area: carrera.area || '',
      });
    } else {
      setCarreraEditando(null);
      setFormulario({ nombre: '', codigo: '', descripcion: '', area: '' });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCarreraEditando(null);
    setFormulario({ nombre: '', codigo: '', descripcion: '', area: '' });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoFormulario(true);
    try {
      if (carreraEditando) {
        await api.patch(`/carreras/${carreraEditando.id}`, formulario);
      } else {
        await api.post('/carreras', formulario);
      }
      cerrarModal();
      obtenerCarreras();
    } catch (error) {
      console.error('Error al guardar la carrera:', error);
      alert('Error al guardar la carrera');
    } finally {
      setCargandoFormulario(false);
    }
  };

  const eliminar = async () => {
    if (!carreraEliminando) return;
    setCargandoFormulario(true);
    try {
      await api.delete(`/carreras/${carreraEliminando.id}`);
      setCarreraEliminando(null);
      obtenerCarreras();
    } catch (error: any) {
      console.error('Error al eliminar la carrera:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar la carrera'));
      }).catch(() => {
        alert('Error al eliminar la carrera');
      });
    } finally {
      setCargandoFormulario(false);
    }
  };

  const obtenerInsigniaEstado = (estado: string) => {
    const configuracionInsignia = estado === 'activo'
      ? { etiqueta: 'Activo', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' }
      : { etiqueta: 'Inactivo', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' };
    return <Insignia className={configuracionInsignia.color}>{configuracionInsignia.etiqueta}</Insignia>;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Panel' }, { etiqueta: 'Carreras' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Carreras</h1>
        <Boton onClick={() => abrirModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Carrera
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <FilaFiltros>
              <CampoFiltro
                etiqueta="Estado"
                value={filtroEstado}
                onChange={setFiltroEstado}
                placeholder="Todos los estados"
                className="w-full sm:w-44"
                opciones={[
                  { value: 'activo', etiqueta: 'Activo' },
                  { value: 'inactivo', etiqueta: 'Inactivo' },
                ]}
              />
              <BuscadorFiltro
                placeholder="Buscar por nombre, código o área..."
                value={terminoBusqueda}
                onChange={setTerminoBusqueda}
              />
            </FilaFiltros>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>Código</CeldaEncabezado>
                <CeldaEncabezado>Nombre</CeldaEncabezado>
                <CeldaEncabezado>Área</CeldaEncabezado>
                <CeldaEncabezado>Descripción</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {carrerasFiltradas.map((carrera) => (
                <FilaTabla key={carrera.id}>
                  <CeldaTabla className="font-medium">{carrera.codigo}</CeldaTabla>
                  <CeldaTabla>{carrera.nombre}</CeldaTabla>
                  <CeldaTabla>{carrera.area || '-'}</CeldaTabla>
                  <CeldaTabla className="max-w-xs truncate">{carrera.descripcion || '-'}</CeldaTabla>
                  <CeldaTabla>{obtenerInsigniaEstado(carrera.estado)}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" onClick={() => abrirModal(carrera)}>
                        <Pencil className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" onClick={() => setCarreraEliminando(carrera)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {carrerasFiltradas.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={6} className="text-center py-8 text-muted-foreground">
                    {terminoBusqueda || filtroEstado ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      {/* Modal Crear/Editar */}
      <Modal abierto={modalAbierto} alCerrar={cerrarModal} titulo={carreraEditando ? 'Editar Carrera' : 'Nueva Carrera'} tamano="mediano">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Código *</label>
            <Entrada
              value={formulario.codigo}
              onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
              placeholder="Ej: ING-SIS"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
            <Entrada
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              placeholder="Ej: Ingeniería de Sistemas"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Área</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg"
              value={formulario.area}
              onChange={(e) => setFormulario({ ...formulario, area: e.target.value })}
            >
              <option value="">Seleccionar área</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Salud">Salud</option>
              <option value="Administración">Administración</option>
              <option value="Industrial">Industrial</option>
              <option value="Social">Social</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg"
              rows={3}
              value={formulario.descripcion}
              onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
              placeholder="Descripción de la carrera..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Boton type="button" variante="contorno" onClick={cerrarModal}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={cargandoFormulario}>
              {cargandoFormulario ? 'Guardando...' : carreraEditando ? 'Actualizar' : 'Crear'}
            </Boton>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal abierto={!!carreraEliminando} alCerrar={() => setCarreraEliminando(null)} titulo="Eliminar Carrera" tamano="pequeno">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Está seguro de eliminar la carrera <strong>{carreraEliminando?.nombre}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Boton variante="contorno" onClick={() => setCarreraEliminando(null)}>
              Cancelar
            </Boton>
            <Boton variante="destructivo" onClick={eliminar} disabled={cargandoFormulario}>
              {cargandoFormulario ? 'Eliminando...' : 'Eliminar'}
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
