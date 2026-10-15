'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal } from '@/componentes/iu/modal';
import { ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { Gestion, Periodo } from '@/tipos';
import { Plus, Edit2, Trash2, Lock, Unlock, Star, StarOff, Loader2, Calendar } from 'lucide-react';

export default function PaginaGestiones() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<{ type: string; id: number | null; titulo: string; mensaje: string } | null>(null);
  const [gestionEditando, setGestionEditando] = useState<Gestion | null>(null);
  const [gestionEliminando, setGestionEliminando] = useState<Gestion | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    anio: '',
    tipoPeriodo: 'semestral',
    notas: '',
    esActual: false,
  });

  useEffect(() => {
    obtenerGestiones();
  }, []);

  const obtenerGestiones = async () => {
    try {
      const respuesta = await api.get('/gestiones');
      setGestiones(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al obtener las gestiones:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerInsigniaEstado = (estado: string) => {
    const variantes: Record<string, 'exito' | 'error' | 'advertencia' | 'secundario'> = {
      abierta: 'exito',
      cerrada: 'error',
      pendiente: 'advertencia',
    };
    return <Insignia variante={variantes[estado] || 'secundario'}>{estado}</Insignia>;
  };

  const obtenerInsigniaPeriodo = (tipo: string) => {
    const variantes: Record<string, 'primario' | 'secundario' | 'contorno'> = {
      anual: 'primario',
      semestral: 'secundario',
      trimestral: 'contorno',
    };
    return <Insignia variante={variantes[tipo] || 'secundario'}>{tipo}</Insignia>;
  };

  const abrirModal = (gestion?: Gestion) => {
    if (gestion) {
      setGestionEditando(gestion);
      setDatosFormulario({
        anio: gestion.anio,
        tipoPeriodo: gestion.tipoPeriodo,
        notas: gestion.notas || '',
        esActual: gestion.esActual,
      });
    } else {
      setGestionEditando(null);
      setDatosFormulario({
        anio: new Date().getFullYear().toString(),
        tipoPeriodo: 'semestral',
        notas: '',
        esActual: false,
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setGestionEditando(null);
  };

  const guardar = async () => {
    if (!datosFormulario.anio) return;

    setGuardando(true);
    try {
      if (gestionEditando) {
        await api.patch(`/gestiones/${gestionEditando.id}`, datosFormulario);
      } else {
        await api.post('/gestiones', { ...datosFormulario, estado: 'pendiente' });
      }
      obtenerGestiones();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar la gestión:', error);
    } finally {
      setGuardando(false);
    }
  };

  const abrirGestion = (gestion: Gestion) => {
    setAccionConfirmar({
      type: 'openGestion',
      id: gestion.id,
      titulo: 'Abrir Gestión',
      mensaje: `¿Estás seguro de abrir la gestión ${gestion.anio}?`,
    });
    setModalConfirmarAbierto(true);
  };

  const cerrarGestion = (gestion: Gestion) => {
    setAccionConfirmar({
      type: 'closeGestion',
      id: gestion.id,
      titulo: 'Cerrar Gestión',
      mensaje: `¿Estás seguro de cerrar la gestión ${gestion.anio}? Esto cerrará todos los períodos abiertos.`,
    });
    setModalConfirmarAbierto(true);
  };

  const marcarActual = (gestion: Gestion) => {
    setAccionConfirmar({
      type: 'setCurrent',
      id: gestion.id,
      titulo: 'Marcar como Actual',
      mensaje: `¿Estás seguro de marcar la gestión ${gestion.anio} como actual?`,
    });
    setModalConfirmarAbierto(true);
  };

  const eliminar = async () => {
    if (!gestionEliminando) return;

    setGuardando(true);
    try {
      await api.delete(`/gestiones/${gestionEliminando.id}`);
      setModalEliminarAbierto(false);
      setGestionEliminando(null);
      obtenerGestiones();
    } catch (error) {
      console.error('Error al eliminar la gestión:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar la gestión'));
      }).catch(() => {
        alert('Error al eliminar la gestión');
      });
    } finally {
      setGuardando(false);
    }
  };

  const abrirPeriodo = (periodoId: number, numeroPeriodo: string) => {
    setAccionConfirmar({
      type: 'openPeriodo',
      id: periodoId,
      titulo: 'Abrir Período',
      mensaje: `¿Estás seguro de abrir el ${numeroPeriodo}?`,
    });
    setModalConfirmarAbierto(true);
  };

  const cerrarPeriodo = (periodoId: number, numeroPeriodo: string) => {
    setAccionConfirmar({
      type: 'closePeriodo',
      id: periodoId,
      titulo: 'Cerrar Período',
      mensaje: `¿Estás seguro de cerrar el ${numeroPeriodo}?`,
    });
    setModalConfirmarAbierto(true);
  };

  const confirmar = async () => {
    if (!accionConfirmar || !accionConfirmar.id) return;

    setGuardando(true);
    try {
      switch (accionConfirmar.type) {
        case 'openGestion':
          await api.post(`/gestiones/${accionConfirmar.id}/abrir`);
          break;
        case 'closeGestion':
          await api.post(`/gestiones/${accionConfirmar.id}/cerrar`);
          break;
        case 'setCurrent':
          await api.post(`/gestiones/${accionConfirmar.id}/establecer-actual`);
          break;
        case 'openPeriodo':
          await api.post(`/gestiones/periodos/${accionConfirmar.id}/abrir`);
          break;
        case 'closePeriodo':
          await api.post(`/gestiones/periodos/${accionConfirmar.id}/cerrar`);
          break;
      }
      setModalConfirmarAbierto(false);
      setAccionConfirmar(null);
      obtenerGestiones();
    } catch (error) {
      console.error('Error al confirmar la acción:', error);
    } finally {
      setGuardando(false);
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
      <Migas elementos={[{ etiqueta: 'Configuración', href: '/configuracion' }, { etiqueta: 'Gestiones' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestiones Académicas</h1>
          <p className="text-gray-500">Administra los períodos académicos</p>
        </div>
        <Boton onClick={() => abrirModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Gestión
        </Boton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...gestiones].sort((a, b) => (b.esActual ? 1 : 0) - (a.esActual ? 1 : 0)).map((gestion) => (
          <Tarjeta key={gestion.id} variante="conBorde">
            <EncabezadoTarjeta className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <TituloTarjeta className="text-lg flex items-center gap-2">
                      {gestion.anio}
                      {gestion.esActual && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </TituloTarjeta>
                    <p className="text-sm text-gray-500">{gestion.tipoPeriodo}</p>
                  </div>
                </div>
                {obtenerInsigniaEstado(gestion.estado)}
              </div>
            </EncabezadoTarjeta>
            <ContenidoTarjeta>
              {gestion.periodos && gestion.periodos.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-700">Períodos:</p>
                  {[...gestion.periodos].sort((a, b) => a.numero.localeCompare(b.numero)).map((periodo) => (
                    <div
                      key={periodo.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{periodo.numero}</span>
                        <span className="text-gray-500">({periodo.nombre || 'Sin nombre'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {obtenerInsigniaEstado(periodo.estado)}
                        {periodo.estado === 'pendiente' && (
                          <Boton
                            tamano="pequeno"
                            variante="fantasma"
                            className="h-6 w-6 p-0"
                            onClick={() => abrirPeriodo(periodo.id, `${periodo.numero} - ${periodo.nombre}`)}
                          >
                            <Unlock className="w-3 h-3" />
                          </Boton>
                        )}
                        {periodo.estado === 'abierta' && (
                          <Boton
                            tamano="pequeno"
                            variante="fantasma"
                            className="h-6 w-6 p-0"
                            onClick={() => cerrarPeriodo(periodo.id, `${periodo.numero} - ${periodo.nombre}`)}
                          >
                            <Lock className="w-3 h-3" />
                          </Boton>
                        )}
                        {periodo.estado === 'cerrada' && (
                          <Boton
                            tamano="pequeno"
                            variante="fantasma"
                            className="h-6 w-6 p-0"
                            onClick={() => abrirPeriodo(periodo.id, `${periodo.numero} - ${periodo.nombre}`)}
                          >
                            <Unlock className="w-3 h-3" />
                          </Boton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {gestion.notas && (
                <p className="text-sm text-gray-500 mb-4">{gestion.notas}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {gestion.estado === 'pendiente' && (
                  <Boton tamano="pequeno" variante="contorno" className="flex-1" onClick={() => abrirGestion(gestion)}>
                    <Unlock className="w-4 h-4 mr-1" />
                    Abrir
                  </Boton>
                )}
                {gestion.estado === 'abierta' && (
                  <Boton tamano="pequeno" variante="contorno" className="flex-1" onClick={() => cerrarGestion(gestion)}>
                    <Lock className="w-4 h-4 mr-1" />
                    Cerrar
                  </Boton>
                )}
                {gestion.estado === 'cerrada' && (
                  <Boton tamano="pequeno" variante="contorno" className="flex-1" onClick={() => abrirGestion(gestion)}>
                    <Unlock className="w-4 h-4 mr-1" />
                    Reabrir
                  </Boton>
                )}
                {!gestion.esActual && (
                  <Boton
                    tamano="pequeno"
                    variante="fantasma"
                    onClick={() => marcarActual(gestion)}
                    title="Marcar como actual"
                  >
                    <StarOff className="w-4 h-4" />
                  </Boton>
                )}
                <Boton tamano="pequeno" variante="fantasma" onClick={() => abrirModal(gestion)}>
                  <Edit2 className="w-4 h-4" />
                </Boton>
                <Boton
                  tamano="pequeno"
                  variante="fantasma"
                  onClick={() => {
                    setGestionEliminando(gestion);
                    setModalEliminarAbierto(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Boton>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ))}

        {gestiones.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay gestiones registradas</p>
            <Boton variante="contorno" className="mt-4" onClick={() => abrirModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera gestión
            </Boton>
          </div>
        )}
      </div>

      <Modal
        abierto={modalAbierto}
        alCerrar={cerrarModal}
        titulo={gestionEditando ? 'Editar Gestión' : 'Nueva Gestión'}
        tamano="mediano"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Entrada
              etiqueta="Año *"
              value={datosFormulario.anio}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, anio: e.target.value })}
              placeholder="2025"
              disabled={!!gestionEditando}
            />
            <Selector
              etiqueta="Régimen *"
              value={datosFormulario.tipoPeriodo}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, tipoPeriodo: e.target.value })}
              opciones={[
                { value: 'semestral', etiqueta: 'Semestral' },
              ]}
              disabled={!!gestionEditando}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="esActual"
              checked={datosFormulario.esActual}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, esActual: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="esActual" className="text-sm text-gray-700">
              Marcar como gestión actual (se mostrará por defecto en formularios)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows={3}
              value={datosFormulario.notas}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
              placeholder="Observaciones adicionales..."
            />
          </div>

          {!gestionEditando && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium">Períodos que se crearán:</p>
              {datosFormulario.tipoPeriodo === 'semestral' && (
                <>
                  <p>I - Primer Semestre (20 feb - 10 jul)</p>
                  <p>II - Segundo Semestre (20 jul - 11 dic)</p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Boton variante="contorno" onClick={cerrarModal}>
              Cancelar
            </Boton>
            <Boton onClick={guardar} disabled={guardando || !datosFormulario.anio}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        alCerrar={() => {
          setModalEliminarAbierto(false);
          setGestionEliminando(null);
        }}
        alConfirmar={eliminar}
        titulo="Eliminar Gestión"
        mensaje={`¿Estás seguro de eliminar la gestión ${gestionEliminando?.anio}? Se eliminarán también todos sus períodos. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />

      <ModalConfirmacion
        abierto={modalConfirmarAbierto}
        alCerrar={() => {
          setModalConfirmarAbierto(false);
          setAccionConfirmar(null);
        }}
        alConfirmar={confirmar}
        titulo={accionConfirmar?.titulo || ''}
        mensaje={accionConfirmar?.mensaje || ''}
        textoConfirmar="Confirmar"
        variante="predeterminado"
        cargando={guardando}
      />
    </div>
  );
}
