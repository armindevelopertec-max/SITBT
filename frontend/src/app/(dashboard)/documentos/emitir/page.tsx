'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/hooks/useDocuments';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, FileText, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function EmitDocumentPage() {
  const router = useRouter();
  const { generateBoleta, generateRecibo } = useDocuments();

  const [documentType, setDocumentType] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [gestion, setGestion] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const searchStudents = async () => {
    if (!studentSearch || studentSearch.length < 2) return;
    setSearching(true);
    try {
      const response = await api.get('/estudiantes', {
        params: { search: studentSearch, limit: 10 },
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (studentSearch) searchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType || !studentId) return;

    setLoading(true);
    setError(null);

    try {
      if (documentType === 'boleta_inscripcion') {
        await generateBoleta(parseInt(studentId), gestion);
      } else if (documentType === 'recibo_pago') {
        await generateRecibo(parseInt(studentId), gestion, 0);
      }
      router.push('/documentos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/documentos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emitir Documento</h1>
          <p className="text-gray-500">Generar nuevo documento</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Datos del documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento *
              </label>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar tipo' },
                  { value: 'boleta_inscripcion', label: 'Boleta de Inscripción' },
                  { value: 'recibo_pago', label: 'Recibo de Pago' },
                  { value: 'carnet', label: 'Carnet de Estudiante' },
                  { value: 'certificado', label: 'Certificado' },
                  { value: 'constancia', label: 'Constancia' },
                ]}
                placeholder="Seleccionar tipo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o CI..."
                  className="pl-10"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentId('');
                  }}
                />
              </div>

              {students.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setStudentId(student.id.toString());
                        setStudentSearch(
                          `${student.persona?.names} ${student.persona?.lastname_paternal} - ${student.persona?.ci}`
                        );
                        setStudents([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <p className="font-medium">
                        {student.persona?.names} {student.persona?.lastname_paternal} {student.persona?.lastname_maternal}
                      </p>
                      <p className="text-sm text-gray-500">
                        CI: {student.persona?.ci} - Código: {student.inscription_code}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {studentId && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Estudiante seleccionado
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gestión *
              </label>
              <Select
                value={gestion}
                onChange={(e) => setGestion(e.target.value)}
                options={[
                  { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                  { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                  { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
                ]}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/documentos">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !documentType || !studentId}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generar documento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
