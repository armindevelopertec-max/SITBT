'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { Search, Plus, Printer, X, Loader2, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type EstadoCredencial = 'emitida' | 'anulada' | 'reemplazada';

interface Credencial {
  id: number;
  estudianteId: number;
  gestion: string;
  gestionId?: number;
  gestionRelacionada?: {
    id: number;
    anio: string;
    tipoPeriodo: string;
    estado: string;
  };
  semestre: number;
  fechaEmision: string;
  validoHasta: string;
  fotoUrl?: string;
  estado: EstadoCredencial;
  impreso: boolean;
  notas?: string;
  estudiante?: {
    id: number;
    codigoInscripcion: string;
    estado: string;
    persona?: {
      id: number;
      ci: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
    carrera?: {
      id: number;
      nombre: string;
    };
  };
}

interface Institucion {
  id: number;
  nombre: string;
  nombreCorto: string;
  lema: string;
  logoUrl: string;
  direccion: string;
  telefono: string;
  correo: string;
  sitioWeb: string;
  ciudad: string;
  pais: string;
  departamento: string;
}

const CONFIGURACION_ESTADOS = {
  emitida: { etiqueta: 'Emitida', bg: '#e8f7ee', color: '#217a45' },
  anulada: { etiqueta: 'Anulada', bg: '#fdecec', color: '#b42318' },
  reemplazada: { etiqueta: 'Reemplazada', bg: '#fff5df', color: '#946200' },
};

const AZUL_MARINO = '#14213d';
const ORO = '#c89b3c';

function formatearFecha(fecha?: string) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function InsigniaEstado({ estado }: { estado: EstadoCredencial }) {
  const configuracion = CONFIGURACION_ESTADOS[estado];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 999,
        background: configuracion.bg,
        color: configuracion.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: configuracion.color }} />
      {configuracion.etiqueta}
    </span>
  );
}

function Fila({ etiqueta, value, pequeno, grande, dorado }: { etiqueta: string; value: string; pequeno?: boolean; grande?: boolean; dorado?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: pequeno ? 5.5 : 6, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: 0.5 }}>{etiqueta}</div>
      <div style={{ fontSize: grande ? 12.5 : pequeno ? 8 : 9.5, fontWeight: 800, color: dorado ? AZUL_MARINO : '#141414', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

function CajaLogo({ url, tamano = 50 }: { url?: string; tamano?: number }) {
  return (
    <img src={url || '/logo.png'} alt="" style={{ width: tamano, height: tamano, objectFit: 'contain', flexShrink: 0 }} />
  );
}

function CajaFoto({ url }: { url?: string }) {
  const [roto, setRoto] = useState(false);
  const tamano = 100;
  const caja = { width: tamano, height: tamano, border: `1.5px solid ${AZUL_MARINO}`, flexShrink: 0, background: '#fff' };
  if (!url || roto) {
    return (
      <div style={{ ...caja, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f2' }}>
        <svg width="46%" height="46%" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="22" r="13" fill="#c4c4c4" />
          <path d="M9 62c0-13.5 10.3-22 23-22s23 8.5 23 22v2H9v-2z" fill="#c4c4c4" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ ...caja, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={url} alt="" onError={() => setRoto(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function MarcaAgua({ url }: { url?: string }) {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '58%', zIndex: 0, pointerEvents: 'none', opacity: 0.12 }}>
      <img src={url || '/logo.png'} alt="" style={{ width: '100%', height: 'auto' }} />
    </div>
  );
}

function TarjetaCredencial({ credencial, seleccionada, onClick }: { credencial: Credencial; seleccionada: boolean; onClick: () => void }) {
  const estudiante = credencial.estudiante;
  const persona = estudiante?.persona;
  const nombreCompleto = persona ? `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}` : 'Sin nombre';

  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${seleccionada ? 'border-primary-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {persona?.nombres?.charAt(0) || '?'}{persona?.apellidoPaterno?.charAt(0) || ''}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{nombreCompleto}</p>
          <p className="text-xs text-gray-500">{estudiante?.codigoInscripcion}</p>
          <p className="text-xs text-gray-400">{estudiante?.carrera?.nombre || 'Sin carrera'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              Sem {credencial.semestre}
            </span>
            <InsigniaEstado estado={credencial.estado} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{credencial.impreso ? '✓ Impresa' : 'Sin imprimir'}</p>
        </div>
      </div>
    </div>
  );
}

function VistaPreviaCredencial({ credencial, institucion }: { credencial: Credencial; institucion?: Institucion }) {
  const estudiante = credencial.estudiante;
  const persona = estudiante?.persona;
  const apellidos = persona ? `${persona.apellidoPaterno} ${persona.apellidoMaterno}` : '—';
  const nombres = persona?.nombres || '—';
  const nombreCarrera = estudiante?.carrera?.nombre || '—';
  const CREMA = '#faf7f1';

  const nombreInstitucion = institucion?.nombre || 'INSTITUCIÓN EDUCATIVA';
  const nombreCortoInstitucion = institucion?.nombreCorto || 'IE';
  const lema = institucion?.lema || '"Conectando Mentes, Impulsando el Progreso"';
  const logoUrl = institucion?.logoUrl;

  const franja = { height: 62, background: '#14213d26', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', position: 'relative' as const, zIndex: 1 };

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-500 mb-3">Vista previa</p>
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">ANVERSO</span>
          <div className="cred-card" style={{ background: CREMA, width: 340, height: 214, position: 'relative', overflow: 'hidden' }}>
            <MarcaAgua url={logoUrl} />
            <div style={franja}>
              <CajaLogo url={logoUrl} tamano={50} />
              <div style={{ minWidth: 0, flex: 1, paddingRight: 64, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0c1a2b', lineHeight: 1.15 }}>{nombreInstitucion.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: '#3576a3', fontWeight: 700, fontStyle: 'italic', letterSpacing: 0.4, marginTop: 1 }}>{lema}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, padding: '10px 12px', flex: 1 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Fila etiqueta="Código" value={estudiante?.codigoInscripcion || '—'} grande dorado />
                <Fila etiqueta="Apellidos" value={apellidos} />
                <Fila etiqueta="Nombres" value={nombres} />
                <Fila etiqueta="Carrera" value={nombreCarrera} />
                <Fila etiqueta="Nivel" value={`${credencial.semestre}° Semestre`} />
                <Fila etiqueta="Gestión" value={`${credencial.semestre === 1 ? 'I' : 'II'}/${credencial.gestion}`} />
              </div>
              <CajaFoto url={credencial.fotoUrl} />
            </div>
            <div style={{ position: 'absolute', top: 31, right: 6, transform: 'translateY(-50%)', zIndex: 2, background: ORO, color: AZUL_MARINO, borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: 0.5 }}>GESTIÓN</div>
              <div style={{ fontSize: 10.5, fontWeight: 800 }}>{credencial.semestre === 1 ? 'I' : 'II'}/{credencial.gestion}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">REVERSO</span>
          <div className="cred-card" style={{ background: CREMA, width: 340, height: 214, position: 'relative', overflow: 'hidden' }}>
            <MarcaAgua url={logoUrl} />
            <div style={franja}>
              <CajaLogo url={logoUrl} tamano={50} />
              <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0c1a2b', lineHeight: 1.15 }}>{nombreInstitucion.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: '#3576a3', fontWeight: 700, fontStyle: 'italic', letterSpacing: 0.4, marginTop: 1 }}>{lema}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '10px 12px', flex: 1 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Fila etiqueta="Apellidos" value={apellidos} pequeno />
                <Fila etiqueta="Nombres" value={nombres} pequeno />
                <Fila etiqueta="C.I." value={persona?.ci || '—'} pequeno />
                <Fila etiqueta="Nivel" value={`${credencial.semestre}° Semestre`} pequeno />
                <Fila etiqueta="Gestión" value={`${credencial.semestre === 1 ? 'I' : 'II'}/${credencial.gestion}`} pequeno />
                <Fila etiqueta="Válida hasta" value={formatearFecha(credencial.validoHasta)} pequeno />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, justifyContent: 'center' }}>
                <QRCodeSVG value={`http://localhost:3000/credenciales/verify/${credencial.id}`} size={88} />
                <span style={{ fontSize: 6.5, color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Verificar credencial</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 17, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 5.5, color: '#777' }}>Válida hasta: {formatearFecha(credencial.validoHasta)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaCredenciales() {
  const router = useRouter();
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState<Credencial | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | EstadoCredencial>('TODOS');
  const [filtroGestion, setFiltroGestion] = useState<string>('TODOS');
  const [modalAnular, setModalAnular] = useState<Credencial | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Credencial | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [institucion, setInstitucion] = useState<Institucion | undefined>(undefined);

  useEffect(() => {
    obtenerCredenciales();
    obtenerInstitucion();
  }, []);

  const obtenerCredenciales = async () => {
    try {
      const respuesta = await api.get('/credenciales', { params: { limite: 100 } });
      setCredenciales(respuesta.data.datos || []);
    } catch (error) {
      console.error('Error al obtener las credenciales:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerInstitucion = async () => {
    try {
      const respuesta = await api.get('/configuracion-institucional/publico');
      setInstitucion(respuesta.data);
    } catch (error) {
      console.error('Error al obtener la institución:', error);
    }
  };

  const credencialesFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return credenciales.filter((credencial) => {
      const persona = credencial.estudiante?.persona;
      const nombreCompleto = persona ? `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase() : '';
      const coincideBusqueda = !q || nombreCompleto.includes(q) || (persona?.ci || '').includes(q) || (credencial.estudiante?.codigoInscripcion || '').toLowerCase().includes(q);
      const coincideEstado = filtroEstado === 'TODOS' || credencial.estado === filtroEstado;
      const coincideGestion = filtroGestion === 'TODOS' || credencial.gestion === filtroGestion;
      return coincideBusqueda && coincideEstado && coincideGestion;
    });
  }, [credenciales, busqueda, filtroEstado, filtroGestion]);

  const gestiones = useMemo(() => {
    const unicos = Array.from(new Set(credenciales.map((credencial) => credencial.gestion)));
    return unicos.sort((a, b) => b.localeCompare(a));
  }, [credenciales]);

  const anular = async () => {
    if (!modalAnular) return;
    setGuardando(true);
    try {
      await api.patch(`/credenciales/${modalAnular.id}/anular`);
      setModalAnular(null);
      obtenerCredenciales();
      if (seleccionada?.id === modalAnular.id) {
        setSeleccionada(null);
      }
    } catch (error) {
      console.error('Error al anular la credencial:', error);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!modalEliminar) return;
    setGuardando(true);
    try {
      await api.delete(`/credenciales/${modalEliminar.id}`);
      setModalEliminar(null);
      obtenerCredenciales();
      if (seleccionada?.id === modalEliminar.id) {
        setSeleccionada(null);
      }
    } catch (error) {
      console.error('Error al eliminar la credencial:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar la credencial'));
      }).catch(() => {
        alert('Error al eliminar la credencial');
      });
    } finally {
      setGuardando(false);
    }
  };

  const imprimir = async () => {
    if (!seleccionada) return;
    try {
      await api.patch(`/credenciales/${seleccionada.id}/marcar-impreso`);
      obtenerCredenciales();
      window.print();
    } catch (error) {
      console.error('Error al marcar como impresa:', error);
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
    <div className="space-y-4">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <Migas elementos={[{ etiqueta: 'Configuración', href: '/configuracion' }, { etiqueta: 'Credenciales' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Credenciales</h1>
        <Boton tamano="pequeno" onClick={() => router.push('/credenciales/nuevo')}>
          <Plus className="w-3 h-3 mr-1" />
          Nueva
        </Boton>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Entrada placeholder="Buscar por nombre o código..." className="pl-7 h-8 text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select className="h-8 text-sm border rounded px-2" value={filtroGestion} onChange={(e) => setFiltroGestion(e.target.value)}>
          <option value="TODOS">Todas las gestiones</option>
          {gestiones.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="h-8 text-sm border rounded px-2" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as any)}>
          <option value="TODOS">Todos los estados</option>
          <option value="emitida">Emitidas</option>
          <option value="anulada">Anuladas</option>
          <option value="reemplazada">Reemplazadas</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">{credencialesFiltradas.length} credenciales</span>
      </div>

      {credencialesFiltradas.length > 0 && !seleccionada && (
        <div className="flex gap-2 flex-wrap">
          {credencialesFiltradas.slice(0, 6).map((credencial) => (
            <div
              key={credencial.id}
              onClick={() => setSeleccionada(credencial)}
              className="px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <span className="font-medium">{credencial.estudiante?.persona?.nombres?.charAt(0) || '?'}{credencial.estudiante?.persona?.apellidoPaterno?.charAt(0) || ''}</span>
              <span className="text-gray-600">{credencial.estudiante?.persona?.nombres} {credencial.estudiante?.persona?.apellidoPaterno}</span>
              <span className="text-xs text-gray-400">Sem {credencial.semestre}</span>
            </div>
          ))}
        </div>
      )}

      <div className="print-area">
        {seleccionada ? (
          <Tarjeta variante="conBorde">
            <ContenidoTarjeta className="p-6">
              <VistaPreviaCredencial credencial={seleccionada} institucion={institucion} />
              <div className="flex gap-2 mt-4 justify-center">
                <Boton tamano="pequeno" onClick={imprimir}>
                  <Printer className="w-3 h-3 mr-1" />
                  Imprimir
                </Boton>
                {seleccionada.estado === 'emitida' && (
                  <Boton tamano="pequeno" variante="contorno" className="text-red-600" onClick={() => setModalAnular(seleccionada)}>
                    <X className="w-3 h-3 mr-1" />
                    Anular
                  </Boton>
                )}
                <Boton tamano="pequeno" variante="contorno" className="text-red-600" onClick={() => setModalEliminar(seleccionada)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Boton>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Código</p>
                  <p className="font-medium">{seleccionada.estudiante?.codigoInscripcion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gestión</p>
                  <p className="font-medium">{seleccionada.gestion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Semestre</p>
                  <p className="font-medium">{seleccionada.semestre}°</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha de emisión</p>
                  <p className="font-medium">{formatearFecha(seleccionada.fechaEmision)}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ) : (
          <Tarjeta variante="conBorde">
            <ContenidoTarjeta className="p-12 text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-gray-500">Selecciona una credencial para visualizarla</p>
              <p className="text-xs text-gray-400 mt-1">Usa el buscador para filtrar por nombre o código</p>
            </ContenidoTarjeta>
          </Tarjeta>
        )}
      </div>

      <ModalConfirmacion
        abierto={!!modalAnular}
        alCerrar={() => setModalAnular(null)}
        alConfirmar={anular}
        titulo="Anular Credencial"
        mensaje={`¿Anular la credencial de "${modalAnular?.estudiante?.persona?.nombres} ${modalAnular?.estudiante?.persona?.apellidoPaterno}" Semestre ${modalAnular?.semestre}?`}
        textoConfirmar="Anular"
        variante="destructivo"
        cargando={guardando}
      />

      <ModalConfirmacion
        abierto={!!modalEliminar}
        alCerrar={() => setModalEliminar(null)}
        alConfirmar={eliminar}
        titulo="Eliminar Credencial"
        mensaje={`¿Eliminar permanentemente la credencial de "${modalEliminar?.estudiante?.persona?.nombres} ${modalEliminar?.estudiante?.persona?.apellidoPaterno}"?`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />
    </div>
  );
}
