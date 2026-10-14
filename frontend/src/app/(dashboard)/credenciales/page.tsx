'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Printer, X, Loader2, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type CredentialStatus = 'emitida' | 'anulada' | 'reemplazada';

interface Credencial {
  id: number;
  estudianteId: number;
  gestion: string;
  gestionId?: number;
  gestionEntity?: {
    id: number;
    anio: string;
    tipoPeriodo: string;
    estado: string;
  };
  semestre: number;
  fechaEmision: string;
  validoHasta: string;
  fotoUrl?: string;
  estado: CredentialStatus;
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

interface Institution {
  id: number;
  nombre: string;
  nombre_corto: string;
  lema: string;
  logo_url: string;
  direccion: string;
  telefono: string;
  correo: string;
  website: string;
  ciudad: string;
  pais: string;
  departamento: string;
}

const STATUS_CONFIG = {
  emitida: { label: 'Emitida', bg: '#e8f7ee', color: '#217a45' },
  anulada: { label: 'Anulada', bg: '#fdecec', color: '#b42318' },
  reemplazada: { label: 'Reemplazada', bg: '#fff5df', color: '#946200' },
};

const NAVY = '#14213d';
const GOLD = '#c89b3c';

function formatDate(date?: string) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: CredentialStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 999,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
      {config.label}
    </span>
  );
}

function Row({ label, value, small, big, golden }: { label: string; value: string; small?: boolean; big?: boolean; golden?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: small ? 5.5 : 6, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: big ? 12.5 : small ? 8 : 9.5, fontWeight: 800, color: golden ? NAVY : '#141414', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

function LogoBox({ url, size = 50 }: { url?: string; size?: number }) {
  return (
    <img src={url || '/logo.png'} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
  );
}

function PhotoBox({ url }: { url?: string }) {
  const [broken, setBroken] = useState(false);
  const size = 100;
  const box = { width: size, height: size, border: `1.5px solid ${NAVY}`, flexShrink: 0, background: '#fff' };
  if (!url || broken) {
    return (
      <div style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f2' }}>
        <svg width="46%" height="46%" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="22" r="13" fill="#c4c4c4" />
          <path d="M9 62c0-13.5 10.3-22 23-22s23 8.5 23 22v2H9v-2z" fill="#c4c4c4" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ ...box, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={url} alt="" onError={() => setBroken(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function Watermark({ url }: { url?: string }) {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '58%', zIndex: 0, pointerEvents: 'none', opacity: 0.12 }}>
      <img src={url || '/logo.png'} alt="" style={{ width: '100%', height: 'auto' }} />
    </div>
  );
}

function CredentialCard({ credential, selected, onClick }: { credential: Credencial; selected: boolean; onClick: () => void }) {
  const student = credential.estudiante;
  const person = student?.persona;
  const fullName = person ? `${person.nombres} ${person.apellidoPaterno} ${person.apellidoMaterno}` : 'Sin nombre';

  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${selected ? 'border-primary-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {person?.nombres?.charAt(0) || '?'}{person?.apellidoPaterno?.charAt(0) || ''}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{fullName}</p>
          <p className="text-xs text-gray-500">{student?.codigoInscripcion}</p>
          <p className="text-xs text-gray-400">{student?.carrera?.nombre || 'Sin carrera'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              Sem {credential.semestre}
            </span>
            <StatusBadge status={credential.estado} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{credential.impreso ? '✓ Impresa' : 'Sin imprimir'}</p>
        </div>
      </div>
    </div>
  );
}

function CredentialPreview({ credential, institucion }: { credential: Credencial; institucion?: Institution }) {
  const student = credential.estudiante;
  const person = student?.persona;
  const surnames = person ? `${person.apellidoPaterno} ${person.apellidoMaterno}` : '—';
  const firstName = person?.nombres || '—';
  const careerName = student?.carrera?.nombre || '—';
  const CREAM = '#faf7f1';

  const instName = institucion?.nombre || 'INSTITUCIÓN EDUCATIVA';
  const instShort = institucion?.nombre_corto || 'IE';
  const lema = institucion?.lema || '"Conectando Mentes, Impulsando el Progreso"';
  const logoUrl = institucion?.logo_url;

  const band = { height: 62, background: '#14213d26', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', position: 'relative' as const, zIndex: 1 };

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-500 mb-3">Vista previa</p>
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">ANVERSO</span>
          <div className="cred-card" style={{ background: CREAM, width: 340, height: 214, position: 'relative', overflow: 'hidden' }}>
            <Watermark url={logoUrl} />
            <div style={band}>
              <LogoBox url={logoUrl} size={50} />
              <div style={{ minWidth: 0, flex: 1, paddingRight: 64, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0c1a2b', lineHeight: 1.15 }}>{instName.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: '#3576a3', fontWeight: 700, fontStyle: 'italic', letterSpacing: 0.4, marginTop: 1 }}>{lema}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, padding: '10px 12px', flex: 1 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Row label="Código" value={student?.codigoInscripcion || '—'} big golden />
                <Row label="Apellidos" value={surnames} />
                <Row label="Nombres" value={firstName} />
                <Row label="Carrera" value={careerName} />
                <Row label="Nivel" value={`${credential.semestre}° Semestre`} />
                <Row label="Gestión" value={`${credential.semestre === 1 ? 'I' : 'II'}/${credential.gestion}`} />
              </div>
              <PhotoBox url={credential.fotoUrl} />
            </div>
            <div style={{ position: 'absolute', top: 31, right: 6, transform: 'translateY(-50%)', zIndex: 2, background: GOLD, color: NAVY, borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: 0.5 }}>GESTIÓN</div>
              <div style={{ fontSize: 10.5, fontWeight: 800 }}>{credential.semestre === 1 ? 'I' : 'II'}/{credential.gestion}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">REVERSO</span>
          <div className="cred-card" style={{ background: CREAM, width: 340, height: 214, position: 'relative', overflow: 'hidden' }}>
            <Watermark url={logoUrl} />
            <div style={band}>
              <LogoBox url={logoUrl} size={50} />
              <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0c1a2b', lineHeight: 1.15 }}>{instName.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: '#3576a3', fontWeight: 700, fontStyle: 'italic', letterSpacing: 0.4, marginTop: 1 }}>{lema}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '10px 12px', flex: 1 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Row label="Apellidos" value={surnames} small />
                <Row label="Nombres" value={firstName} small />
                <Row label="C.I." value={person?.ci || '—'} small />
                <Row label="Nivel" value={`${credential.semestre}° Semestre`} small />
                <Row label="Gestión" value={`${credential.semestre === 1 ? 'I' : 'II'}/${credential.gestion}`} small />
                <Row label="Válida hasta" value={formatDate(credential.validoHasta)} small />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, justifyContent: 'center' }}>
                <QRCodeSVG value={`http://localhost:3000/credenciales/verify/${credential.id}`} size={88} />
                <span style={{ fontSize: 6.5, color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Verificar credencial</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 17, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 5.5, color: '#777' }}>Válida hasta: {formatDate(credential.validoHasta)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Credencial | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CredentialStatus>('ALL');
  const [gestionFilter, setGestionFilter] = useState<string>('ALL');
  const [cancelModal, setCancelModal] = useState<Credencial | null>(null);
  const [deleteModal, setDeleteModal] = useState<Credencial | null>(null);
  const [saving, setSaving] = useState(false);
  const [institucion, setInstitucion] = useState<Institution | undefined>(undefined);

  useEffect(() => {
    fetchCredentials();
    fetchInstitution();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await api.get('/credenciales', { params: { limit: 100 } });
      setCredentials(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener las credenciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitution = async () => {
    try {
      const response = await api.get('/configuracion-institucional/public');
      setInstitucion(response.data);
    } catch (error) {
      console.error('Error al obtener la institución:', error);
    }
  };

  const filteredCredentials = useMemo(() => {
    const q = search.toLowerCase();
    return credentials.filter((cred) => {
      const person = cred.estudiante?.persona;
      const fullName = person ? `${person.nombres} ${person.apellidoPaterno} ${person.apellidoMaterno}`.toLowerCase() : '';
      const matchesSearch = !q || fullName.includes(q) || (person?.ci || '').includes(q) || (cred.estudiante?.codigoInscripcion || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || cred.estado === statusFilter;
      const matchesGestion = gestionFilter === 'ALL' || cred.gestion === gestionFilter;
      return matchesSearch && matchesStatus && matchesGestion;
    });
  }, [credentials, search, statusFilter, gestionFilter]);

  const gestions = useMemo(() => {
    const unique = Array.from(new Set(credentials.map((c) => c.gestion)));
    return unique.sort((a, b) => b.localeCompare(a));
  }, [credentials]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setSaving(true);
    try {
      await api.patch(`/credenciales/${cancelModal.id}/annul`);
      setCancelModal(null);
      fetchCredentials();
      if (selected?.id === cancelModal.id) {
        setSelected(null);
      }
    } catch (error) {
      console.error('Error al anular la credencial:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSaving(true);
    try {
      await api.delete(`/credenciales/${deleteModal.id}`);
      setDeleteModal(null);
      fetchCredentials();
      if (selected?.id === deleteModal.id) {
        setSelected(null);
      }
    } catch (error) {
      console.error('Error al eliminar la credencial:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!selected) return;
    try {
      await api.patch(`/credenciales/${selected.id}/mark-printed`);
      fetchCredentials();
      window.print();
    } catch (error) {
      console.error('Error al marcar como impresa:', error);
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
    <div className="space-y-4">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <Migas items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Credenciales' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Credenciales</h1>
        <Boton size="sm" onClick={() => router.push('/credenciales/nuevo')}>
          <Plus className="w-3 h-3 mr-1" />
          Nueva
        </Boton>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Entrada placeholder="Buscar por nombre o código..." className="pl-7 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 text-sm border rounded px-2" value={gestionFilter} onChange={(e) => setGestionFilter(e.target.value)}>
          <option value="ALL">Todas las gestiones</option>
          {gestions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="h-8 text-sm border rounded px-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="ALL">Todos los estados</option>
          <option value="emitida">Emitidas</option>
          <option value="anulada">Anuladas</option>
          <option value="reemplazada">Reemplazadas</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">{filteredCredentials.length} credenciales</span>
      </div>

      {filteredCredentials.length > 0 && !selected && (
        <div className="flex gap-2 flex-wrap">
          {filteredCredentials.slice(0, 6).map((cred) => (
            <div
              key={cred.id}
              onClick={() => setSelected(cred)}
              className="px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm flex items-center gap-2"
            >
              <span className="font-medium">{cred.estudiante?.persona?.nombres?.charAt(0) || '?'}{cred.estudiante?.persona?.apellidoPaterno?.charAt(0) || ''}</span>
              <span className="text-gray-600">{cred.estudiante?.persona?.nombres} {cred.estudiante?.persona?.apellidoPaterno}</span>
              <span className="text-xs text-gray-400">Sem {cred.semestre}</span>
            </div>
          ))}
        </div>
      )}

      <div className="print-area">
        {selected ? (
          <Tarjeta variant="bordered">
            <ContenidoTarjeta className="p-6">
              <CredentialPreview credential={selected} institucion={institucion} />
              <div className="flex gap-2 mt-4 justify-center">
                <Boton size="sm" onClick={handlePrint}>
                  <Printer className="w-3 h-3 mr-1" />
                  Imprimir
                </Boton>
                {selected.estado === 'emitida' && (
                  <Boton size="sm" variant="outline" className="text-red-600" onClick={() => setCancelModal(selected)}>
                    <X className="w-3 h-3 mr-1" />
                    Anular
                  </Boton>
                )}
                <Boton size="sm" variant="outline" className="text-red-600" onClick={() => setDeleteModal(selected)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Boton>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Código</p>
                  <p className="font-medium">{selected.estudiante?.codigoInscripcion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gestión</p>
                  <p className="font-medium">{selected.gestion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Semestre</p>
                  <p className="font-medium">{selected.semestre}°</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha de emisión</p>
                  <p className="font-medium">{formatDate(selected.fechaEmision)}</p>
                </div>
              </div>
            </ContenidoTarjeta>
          </Tarjeta>
        ) : (
          <Tarjeta variant="bordered">
            <ContenidoTarjeta className="p-12 text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-gray-500">Selecciona una credencial para visualizarla</p>
              <p className="text-xs text-gray-400 mt-1">Usa el buscador para filtrar por nombre o código</p>
            </ContenidoTarjeta>
          </Tarjeta>
        )}
      </div>

      <ConfirmModal
        open={!!cancelModal}
        onClose={() => setCancelModal(null)}
        onConfirm={handleCancel}
        title="Anular Credencial"
        message={`¿Anular la credencial de "${cancelModal?.estudiante?.persona?.nombres} ${cancelModal?.estudiante?.persona?.apellidoPaterno}" Semestre ${cancelModal?.semestre}?`}
        confirmText="Anular"
        variant="destructive"
        loading={saving}
      />

      <ConfirmModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Eliminar Credencial"
        message={`¿Eliminar permanentemente la credencial de "${deleteModal?.estudiante?.persona?.nombres} ${deleteModal?.estudiante?.persona?.apellidoPaterno}"?`}
        confirmText="Eliminar"
        variant="destructive"
        loading={saving}
      />
    </div>
  );
}
