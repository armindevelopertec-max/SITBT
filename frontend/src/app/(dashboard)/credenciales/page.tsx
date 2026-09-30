'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { Search, Plus, Printer, X, Loader2 } from 'lucide-react';

type CredentialStatus = 'emitida' | 'anulada' | 'reemplazada';

interface Credencial {
  id: number;
  student_id: number;
  gestion: string;
  semester: number;
  issued_date: string;
  valid_until: string;
  photo_url?: string;
  status: CredentialStatus;
  printed: boolean;
  notes?: string;
  estudiante?: {
    id: number;
    inscription_code: string;
    status: string;
    persona?: {
      id: number;
      ci: string;
      names: string;
      lastname_paternal: string;
      lastname_maternal: string;
    };
    carrera?: {
      id: number;
      name: string;
    };
  };
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
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

function CredentialCard({ credential, selected, onClick }: { credential: Credencial; selected: boolean; onClick: () => void }) {
  const student = credential.estudiante;
  const person = student?.persona;
  const fullName = person ? `${person.names} ${person.lastname_paternal} ${person.lastname_maternal}` : 'Sin nombre';

  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${selected ? 'border-primary-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {person?.names?.charAt(0) || '?'}{person?.lastname_paternal?.charAt(0) || ''}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{fullName}</p>
          <p className="text-xs text-gray-500">{student?.inscription_code}</p>
          <p className="text-xs text-gray-400">{student?.carrera?.name || 'Sin carrera'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              Sem {credential.semester}
            </span>
            <StatusBadge status={credential.status} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{credential.printed ? '✓ Impresa' : 'Sin imprimir'}</p>
        </div>
      </div>
    </div>
  );
}

function CredentialPreview({ credential }: { credential: Credencial }) {
  const student = credential.estudiante;
  const person = student?.persona;
  const fullName = person ? `${person.names} ${person.lastname_paternal} ${person.lastname_maternal}` : 'Sin nombre';

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-500 mb-3">Vista previa</p>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">ANVERSO</span>
          <div className="w-[320px] h-[200px] bg-gradient-to-br from-[#faf7f1] to-[#f0ebe3] rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
            <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat opacity-5" />
            <div className="h-16 bg-gradient-to-r from-[#14213d] to-[#1e3a5f] flex items-center gap-3 px-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shadow">
                AMA
              </div>
              <div className="flex-1 text-center">
                <p className="text-white font-bold text-[11px] tracking-wide">INSTITUCIÓN EDUCATIVA</p>
                <p className="text-[#c89b3c] font-bold text-[10px]">CREDENCIAL ESTUDIANTIL</p>
              </div>
              <div className="bg-[#c89b3c] text-[#14213d] rounded-lg px-3 py-1 text-center">
                <p className="text-[6px] font-bold uppercase">Gestión</p>
                <p className="text-sm font-bold">{credential.gestion}</p>
              </div>
            </div>
            <div className="p-3 flex gap-3 relative z-10">
              <div className="flex-1 space-y-1.5">
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Código Estudiante</p>
                  <p className="text-[10px] font-bold text-[#14213d]">{student?.inscription_code}</p>
                </div>
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Semestre</p>
                  <p className="text-[10px] font-semibold">{credential.semester}° Semestre</p>
                </div>
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Apellidos</p>
                  <p className="text-[9px] font-medium text-gray-800">{person?.lastname_paternal} {person?.lastname_maternal}</p>
                </div>
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Nombres</p>
                  <p className="text-[9px] font-medium text-gray-800">{person?.names}</p>
                </div>
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Carrera</p>
                  <p className="text-[9px] font-medium text-gray-800">{student?.carrera?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[5px] text-gray-500 uppercase tracking-wide">Válida Hasta</p>
                  <p className="text-[9px] font-medium">{formatDate(credential.valid_until)}</p>
                </div>
              </div>
              <div className="w-[75px] h-[90px] border-2 border-gray-300 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl mb-1">👤</span>
                <span className="text-[5px] text-gray-400">FOTO</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#14213d]/90 flex items-center justify-center">
              <p className="text-white text-[5px] font-medium tracking-widest">CREDENCIAL ESTUDIANTIL · {credential.gestion} · {credential.semester}° SEMESTRE</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 mb-1 font-medium">REVERSO</span>
          <div className="w-[320px] h-[200px] bg-gradient-to-br from-[#faf7f1] to-[#f0ebe3] rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
            <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat opacity-5" />
            <div className="h-16 bg-gradient-to-r from-[#14213d] to-[#1e3a5f] flex items-center gap-3 px-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shadow">
                AMA
              </div>
              <div className="flex-1 text-center">
                <p className="text-white font-bold text-[11px] tracking-wide">INSTITUCIÓN EDUCATIVA</p>
                <p className="text-[#c89b3c] font-bold text-[10px]">CREDENCIAL ESTUDIANTIL</p>
              </div>
            </div>
            <div className="p-3 flex gap-3 relative z-10">
              <div className="flex-1 space-y-1">
                <div className="bg-white/60 p-1.5 rounded border border-gray-200">
                  <p className="text-[5px] text-gray-500 uppercase">C.I.</p>
                  <p className="text-[8px] font-semibold">{person?.ci || '—'}</p>
                </div>
                <div className="bg-white/60 p-1.5 rounded border border-gray-200">
                  <p className="text-[5px] text-gray-500 uppercase">Fecha de Emisión</p>
                  <p className="text-[8px] font-semibold">{formatDate(credential.issued_date)}</p>
                </div>
                <div className="bg-white/60 p-1.5 rounded border border-gray-200">
                  <p className="text-[5px] text-gray-500 uppercase">Válida Hasta</p>
                  <p className="text-[8px] font-semibold">{formatDate(credential.valid_until)}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-[5px] text-gray-500 uppercase mb-1">Dirección</p>
                  <p className="text-[6px] text-gray-600">Av. Principal N° 123, La Paz - Bolivia</p>
                </div>
              </div>
              <div className="w-[85px] h-[85px] border-2 border-gray-300 rounded-lg bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center mb-1">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-[5px] text-gray-500 text-center px-1">Código QR de verificación</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#c89b3c]/90 flex items-center justify-center">
              <p className="text-[#14213d] text-[5px] font-bold tracking-widest">AUTORIZADO POR EL MINISTERIO DE EDUCACIÓN</p>
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await api.get('/credenciales', { params: { limit: 100 } });
      setCredentials(response.data.data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = useMemo(() => {
    const q = search.toLowerCase();
    return credentials.filter((cred) => {
      const person = cred.estudiante?.persona;
      const fullName = person ? `${person.names} ${person.lastname_paternal} ${person.lastname_maternal}`.toLowerCase() : '';
      const matchesSearch = !q || fullName.includes(q) || (person?.ci || '').includes(q) || (cred.estudiante?.inscription_code || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || cred.status === statusFilter;
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
      console.error('Error cancelling credential:', error);
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
      console.error('Error marking as printed:', error);
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
          .cred-card-print { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      <Breadcrumb items={[{ label: 'Configuración', href: '/configuracion' }, { label: 'Credenciales' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Credenciales</h1>
        <Button size="sm" onClick={() => router.push('/credenciales/nuevo')}>
          <Plus className="w-3 h-3 mr-1" />
          Nueva
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-7 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
          {filteredCredentials.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">Sin credenciales registradas</p>
          ) : (
            filteredCredentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} selected={selected?.id === cred.id} onClick={() => setSelected(cred)} />
            ))
          )}
        </div>

        <div className="print-area">
          {selected ? (
            <Card variant="bordered">
              <CardContent className="p-4">
                <CredentialPreview credential={selected} />
                <div className="flex gap-2 mt-4 justify-center">
                  <Button size="sm" onClick={handlePrint}>
                    <Printer className="w-3 h-3 mr-1" />
                    Imprimir
                  </Button>
                  {selected.status === 'emitida' && (
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => setCancelModal(selected)}>
                      <X className="w-3 h-3 mr-1" />
                      Anular
                    </Button>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500">Código</p>
                    <p className="font-medium">{selected.estudiante?.inscription_code}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gestión</p>
                    <p className="font-medium">{selected.gestion}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Semestre</p>
                    <p className="font-medium">{selected.semester}°</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha de emisión</p>
                    <p className="font-medium">{formatDate(selected.issued_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card variant="bordered">
              <CardContent className="p-8 text-center text-gray-500 text-sm">
                Selecciona una credencial para visualizarla
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!cancelModal}
        onClose={() => setCancelModal(null)}
        onConfirm={handleCancel}
        title="Anular Credencial"
        message={`¿Anular la credencial de "${cancelModal?.estudiante?.persona?.names} ${cancelModal?.estudiante?.persona?.lastname_paternal}" Semestre ${cancelModal?.semester}?`}
        confirmText="Anular"
        variant="destructive"
        loading={saving}
      />
    </div>
  );
}
