'use client';

import { useCallback, useEffect, useState } from 'react';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Selector } from '@/componentes/iu/selector';
import {
  Tabla,
  CuerpoTabla,
  CeldaTabla,
  CeldaEncabezado,
  EncabezadoTabla,
  FilaTabla,
} from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import {
  Fingerprint,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  Users,
} from 'lucide-react';
import { api } from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import {
  EstadoPersonalHoy,
  HuellaPersonal,
  MarcacionPersonal,
  Personal,
  TipoMarcacion,
} from '@/tipos';

const formatearHora = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';

const formatearFecha = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

const etiquetaCargo = (cargo: string) =>
  cargo.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function PaginaAsistencias() {
  const [estado, setEstado] = useState<EstadoPersonalHoy[]>([]);
  const [resumen, setResumen] = useState({ total: 0, dentro: 0 });
  const [cargandoEstado, setCargandoEstado] = useState(true);

  const [personalActivos, setPersonalActivos] = useState<Personal[]>([]);

  const [historial, setHistorial] = useState<MarcacionPersonal[]>([]);
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [pagina, setPagina] = useState(1);
  const limite = 20;
  const [filtroPersonal, setFiltroPersonal] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  const [huellas, setHuellas] = useState<HuellaPersonal[]>([]);
  const [cargandoHuellas, setCargandoHuellas] = useState(true);
  const [modalHuella, setModalHuella] = useState(false);
  const [formHuella, setFormHuella] = useState({
    personalId: '',
    codigoBiometrico: '',
    dedo: '',
  });
  const [guardandoHuella, setGuardandoHuella] = useState(false);
  const [huellaEliminando, setHuellaEliminando] = useState<HuellaPersonal | null>(
    null,
  );

  const [marcando, setMarcando] = useState<number | null>(null);

  const cargarEstado = useCallback(async () => {
    setCargandoEstado(true);
    try {
      const respuesta = await api.get('/asistencias-personal/estado-hoy');
      setEstado(respuesta.data.personal ?? []);
      setResumen({
        total: respuesta.data.total ?? 0,
        dentro: respuesta.data.dentro ?? 0,
      });
    } catch (error) {
      console.error('Error al cargar estado de asistencias:', error);
    } finally {
      setCargandoEstado(false);
    }
  }, []);

  const cargarPersonal = useCallback(async () => {
    try {
      const respuesta = await api.get('/personal/activos');
      setPersonalActivos(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    }
  }, []);

  const cargarHuellas = useCallback(async () => {
    setCargandoHuellas(true);
    try {
      const respuesta = await api.get('/huellas-personal');
      setHuellas(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (error) {
      console.error('Error al cargar huellas:', error);
    } finally {
      setCargandoHuellas(false);
    }
  }, []);

  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true);
    try {
      const parametros = new URLSearchParams();
      parametros.set('pagina', String(pagina));
      parametros.set('limite', String(limite));
      if (filtroPersonal) parametros.set('personalId', filtroPersonal);
      if (filtroTipo) parametros.set('tipo', filtroTipo);
      if (filtroDesde) parametros.set('desde', filtroDesde);
      if (filtroHasta) parametros.set('hasta', filtroHasta);

      const respuesta = await api.get(
        `/asistencias-personal/historial?${parametros.toString()}`,
      );
      setHistorial(respuesta.data.datos ?? []);
      setTotalHistorial(respuesta.data.total ?? 0);
    } catch (error) {
      console.error('Error al cargar historial de asistencias:', error);
    } finally {
      setCargandoHistorial(false);
    }
  }, [pagina, filtroPersonal, filtroTipo, filtroDesde, filtroHasta]);

  useEffect(() => {
    cargarEstado();
    cargarPersonal();
    cargarHuellas();
  }, [cargarEstado, cargarPersonal, cargarHuellas]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    setPagina(1);
  }, [filtroPersonal, filtroTipo, filtroDesde, filtroHasta]);

  const marcar = async (personalId: number, tipo: TipoMarcacion) => {
    setMarcando(personalId);
    try {
      await api.post('/asistencias-personal/marcar', { personalId, tipo });
      await Promise.all([cargarEstado(), cargarHistorial()]);
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      alert(mensajeDeError(error, 'Error al registrar la marcación'));
    } finally {
      setMarcando(null);
    }
  };

  const registrarHuella = async () => {
    if (!formHuella.personalId || !formHuella.codigoBiometrico.trim()) {
      alert('Seleccione el personal e ingrese el código biométrico');
      return;
    }
    setGuardandoHuella(true);
    try {
      await api.post('/huellas-personal', {
        personalId: Number(formHuella.personalId),
        codigoBiometrico: formHuella.codigoBiometrico.trim(),
        dedo: formHuella.dedo.trim() || undefined,
      });
      setModalHuella(false);
      setFormHuella({ personalId: '', codigoBiometrico: '', dedo: '' });
      await cargarHuellas();
    } catch (error) {
      console.error('Error al registrar huella:', error);
      alert(mensajeDeError(error, 'Error al registrar la huella'));
    } finally {
      setGuardandoHuella(false);
    }
  };

  const eliminarHuella = async () => {
    if (!huellaEliminando) return;
    try {
      await api.delete(`/huellas-personal/${huellaEliminando.id}`);
      setHuellaEliminando(null);
      await cargarHuellas();
    } catch (error) {
      console.error('Error al eliminar huella:', error);
      alert(mensajeDeError(error, 'Error al eliminar la huella'));
    }
  };

  const totalPaginas = Math.max(1, Math.ceil(totalHistorial / limite));

  const opcionesPersonal = personalActivos.map((p) => ({
    value: p.id,
    etiqueta: `${p.persona?.nombres ?? ''} ${p.persona?.apellidoPaterno ?? ''} ${p.persona?.apellidoMaterno ?? ''}`.trim(),
  }));

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Asistencias' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Control de Asistencias del Personal
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresos y salidas del personal mediante lector biométrico dactilar
            (o marcación manual).
          </p>
        </div>
        <Boton variante="contorno" onClick={() => cargarEstado()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Boton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                En la institución
              </p>
              <p className="text-2xl font-bold text-green-600">
                {resumen.dentro}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <LogIn className="h-6 w-6 text-green-600" />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Ya salieron</p>
              <p className="text-2xl font-bold text-red-600">
                {Math.max(0, resumen.total - resumen.dentro)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
        <Tarjeta variante="conBorde">
          <ContenidoTarjeta className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Personal activo
              </p>
              <p className="text-2xl font-bold text-gray-900">{resumen.total}</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Personal en la institución</TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargandoEstado ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : estado.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No hay personal activo registrado.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {estado.map((p) => (
                <div
                  key={p.personalId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded-full ${
                        p.dentro
                          ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                          : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                      }`}
                      title={p.dentro ? 'En la institución' : 'Fuera'}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {p.nombres} {p.apellidoPaterno}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {etiquetaCargo(p.cargo)} · {p.ci}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Entrada: {formatearHora(p.horaEntrada)}
                        {p.horaSalida ? ` · Salida: ${formatearHora(p.horaSalida)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Boton
                      variante="fantasma"
                      tamano="icono"
                      title="Registrar entrada"
                      disabled={marcando === p.personalId}
                      onClick={() => marcar(p.personalId, 'entrada')}
                    >
                      <LogIn className="h-4 w-4 text-green-600" />
                    </Boton>
                    <Boton
                      variante="fantasma"
                      tamano="icono"
                      title="Registrar salida"
                      disabled={marcando === p.personalId}
                      onClick={() => marcar(p.personalId, 'salida')}
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                    </Boton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <TituloTarjeta>
              Huellas registradas ({huellas.length})
            </TituloTarjeta>
            <Boton onClick={() => setModalHuella(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar huella
            </Boton>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargandoHuellas ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Código biométrico</CeldaEncabezado>
                  <CeldaEncabezado>Personal</CeldaEncabezado>
                  <CeldaEncabezado>Dedo</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {huellas.map((h) => (
                  <FilaTabla key={h.id}>
                    <CeldaTabla className="font-mono">
                      {h.codigoBiometrico}
                    </CeldaTabla>
                    <CeldaTabla>
                      {h.personal?.persona?.nombres}{' '}
                      {h.personal?.persona?.apellidoPaterno}
                    </CeldaTabla>
                    <CeldaTabla>{h.dedo || '—'}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia
                        variante={h.estado === 'activa' ? 'exito' : 'secundario'}
                      >
                        {h.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <Boton
                        variante="fantasma"
                        tamano="icono"
                        title="Eliminar huella"
                        onClick={() => setHuellaEliminando(h)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Boton>
                    </CeldaTabla>
                  </FilaTabla>
                ))}
                {huellas.length === 0 && (
                  <FilaTabla>
                    <CeldaTabla colSpan={5} className="py-8 text-center text-gray-500">
                      Aún no hay huellas registradas.
                    </CeldaTabla>
                  </FilaTabla>
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <TituloTarjeta>Historial de marcaciones</TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Selector
              etiqueta="Personal"
              value={filtroPersonal}
              onChange={(e) => setFiltroPersonal(e.target.value)}
              opciones={[{ value: '', etiqueta: 'Todo el personal' }, ...opcionesPersonal]}
            />
            <Selector
              etiqueta="Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              opciones={[
                { value: '', etiqueta: 'Entradas y salidas' },
                { value: 'entrada', etiqueta: 'Entradas' },
                { value: 'salida', etiqueta: 'Salidas' },
              ]}
            />
            <Entrada
              type="date"
              etiqueta="Desde"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
            <Entrada
              type="date"
              etiqueta="Hasta"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </div>

          {cargandoHistorial ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Fecha</CeldaEncabezado>
                    <CeldaEncabezado>Hora</CeldaEncabezado>
                    <CeldaEncabezado>Personal</CeldaEncabezado>
                    <CeldaEncabezado>Tipo</CeldaEncabezado>
                    <CeldaEncabezado>Método</CeldaEncabezado>
                    <CeldaEncabezado>Dispositivo</CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {historial.map((m) => (
                    <FilaTabla key={m.id}>
                      <CeldaTabla>{formatearFecha(m.fechaHora)}</CeldaTabla>
                      <CeldaTabla>{formatearHora(m.fechaHora)}</CeldaTabla>
                      <CeldaTabla>
                        {m.personal?.persona?.nombres}{' '}
                        {m.personal?.persona?.apellidoPaterno}
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia
                          variante={m.tipo === 'entrada' ? 'exito' : 'error'}
                        >
                          {m.tipo}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia
                          variante={
                            m.metodo === 'biometrico' ? 'primario' : 'secundario'
                          }
                        >
                          {m.metodo === 'biometrico' ? 'Biométrico' : 'Manual'}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla>{m.dispositivo || '—'}</CeldaTabla>
                    </FilaTabla>
                  ))}
                  {historial.length === 0 && (
                    <FilaTabla>
                      <CeldaTabla colSpan={6} className="py-8 text-center text-gray-500">
                        No hay marcaciones registradas con esos filtros.
                      </CeldaTabla>
                    </FilaTabla>
                  )}
                </CuerpoTabla>
              </Tabla>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {historial.length} de {totalHistorial} marcaciones
                </p>
                <div className="flex items-center gap-2">
                  <Boton
                    variante="contorno"
                    tamano="pequeno"
                    disabled={pagina <= 1}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Boton>
                  <span className="text-sm text-gray-600">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <Boton
                    variante="contorno"
                    tamano="pequeno"
                    disabled={pagina >= totalPaginas}
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  >
                    Siguiente
                  </Boton>
                </div>
              </div>
            </>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal
        abierto={modalHuella}
        alCerrar={() => setModalHuella(false)}
        titulo="Registrar Huella"
        tamano="mediano"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Asocie un código biométrico (ID de usuario en el lector) a una
            persona del personal. Cuando el lector envíe ese código, la
            marcación se registrará automáticamente.
          </p>
          <Selector
            etiqueta="Personal"
            placeholder="Seleccione personal"
            value={formHuella.personalId}
            onChange={(e) =>
              setFormHuella((f) => ({ ...f, personalId: e.target.value }))
            }
            opciones={opcionesPersonal}
          />
          <Entrada
            etiqueta="Código biométrico"
            placeholder="Ej. 1001"
            value={formHuella.codigoBiometrico}
            onChange={(e) =>
              setFormHuella((f) => ({ ...f, codigoBiometrico: e.target.value }))
            }
          />
          <Entrada
            etiqueta="Dedo (opcional)"
            placeholder="Ej. pulgar_derecho"
            value={formHuella.dedo}
            onChange={(e) =>
              setFormHuella((f) => ({ ...f, dedo: e.target.value }))
            }
          />
          <div className="flex justify-end gap-3">
            <Boton variante="contorno" onClick={() => setModalHuella(false)}>
              Cancelar
            </Boton>
            <Boton onClick={registrarHuella} cargando={guardandoHuella}>
              <Fingerprint className="mr-2 h-4 w-4" />
              Registrar
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={!!huellaEliminando}
        alCerrar={() => setHuellaEliminando(null)}
        alConfirmar={eliminarHuella}
        titulo="Eliminar Huella"
        mensaje={`¿Eliminar la huella "${huellaEliminando?.codigoBiometrico}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
      />
    </div>
  );
}
