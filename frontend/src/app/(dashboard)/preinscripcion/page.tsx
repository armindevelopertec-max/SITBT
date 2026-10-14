'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Selector } from '@/components/ui/selector';
import { Insignia } from '@/components/ui/insignia';
import { api } from '@/lib/api';
import { Search, Loader2, CheckCircle, AlertCircle, User, BookOpen, Calendar, CreditCard, FileText, Users } from 'lucide-react';

interface Estudiante {
  id: number;
  codigoInscripcion: string;
  gestionAdmision: string;
  persona?: {
    ci: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  carrera?: {
    id: number;
    nombre: string;
  };
  plan_estudio?: {
    id: number;
    numeroRm: string;
  };
}

interface PaymentStatus {
  puedeInscribir: boolean;
  pagosFaltantes: { tipo: string; concepto: string; monto: number }[];
  pagosRealizados: { tipo: string; concepto: string; monto: number; fechaPago: string }[];
  esEstudianteNuevo: boolean;
}

interface SubjectToEnroll {
  materiaPlanId: number;
  materiaId: number;
  materiaCodigo: string;
  materiaNombre: string;
  semestre: number;
  esReprobada: boolean;
  notaAnteriorReprobada?: number;
  prerrequisitoBloqueado: boolean;
  nombrePrerrequisito?: string;
}

interface Grupo {
  id: number;
  semestre: number;
  paralelo: string;
  gestion: string;
  carreraId: number;
  turnoId: number;
  capacidad: number;
  turno?: { id: number; codigo: string; nombre: string };
}

interface Gestion {
  id: number;
  anio: string;
  estado: string;
  esActual: boolean;
  periodos?: { id: number; numero: string; nombre: string; estado: string }[];
}

interface Turno {
  id: number;
  codigo: string;
  nombre: string;
}

type Step = 'search' | 'payments' | 'subjects' | 'groups' | 'confirm' | 'success';

const badgeColors: Record<string, 'exito' | 'advertencia' | 'error' | 'secondary'> = {
  cursando: 'advertencia',
  aprobado: 'exito',
  reprobado: 'error',
  convalidada: 'secondary',
};

export default function PreinscripcionPage() {
  const [step, setStep] = useState<Step>('search');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [subjects, setSubjects] = useState<SubjectToEnroll[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectToEnroll[]>([]);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [selectedTurno, setSelectedTurno] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [currentPeriodo, setCurrentPeriodo] = useState<string>('I');
  const [currentGestion, setCurrentGestion] = useState<string>(new Date().getFullYear().toString());
  const [enrollmentResult, setEnrollmentResult] = useState<any>(null);

  useEffect(() => {
    fetchTurnos();
    fetchCurrentGestion();
  }, []);

  const fetchTurnos = async () => {
    try {
      const res = await api.get('/turnos/todos');
      setTurnos(res.data || []);
    } catch (error) {
      console.error('Error al obtener los turnos:', error);
    }
  };

  const fetchCurrentGestion = async () => {
    try {
      const res = await api.get('/gestiones/actual');
      if (res.data) {
        setCurrentGestion(res.data.anio);
        const openPeriodo = res.data.periodos?.find((p: any) => p.estado === 'abierta');
        if (openPeriodo) {
          setCurrentPeriodo(openPeriodo.numero);
        }
      }
    } catch (error) {
      console.error('Error al obtener la gestión:', error);
    }
  };

  const searchStudents = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/estudiantes', {
        params: { buscar: searchQuery, limite: 20 }
      });
      setStudents(res.data.datos || []);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (student: Estudiante) => {
    setSelectedStudent(student);
    setStep('payments');
    await checkPayments(student.id);
  };

  const checkPayments = async (studentId: number) => {
    setLoading(true);
    try {
      const res = await api.post('/preinscripcion/verificar-pagos', {
        estudianteId: studentId,
        gestion: currentGestion,
        periodo: currentPeriodo,
      });
      setPaymentStatus(res.data);

      if (res.data.puedeInscribir) {
        await calculateSubjects(studentId);
      }
    } catch (error) {
      console.error('Error al verificar los pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubjects = async (studentId: number) => {
    try {
      const res = await api.post('/preinscripcion/calcular-materias', {
        estudianteId: studentId,
        gestion: currentGestion,
        periodo: currentPeriodo,
      });

      const data = res.data;
      setSubjects(data.materias || []);
      setSelectedSubjects(data.materias?.filter((s: any) => !s.prerrequisitoBloqueado) || []);

      if (data.materias?.length > 0) {
        await fetchGroups(data.materias[0].materiaId);
      }
    } catch (error) {
      console.error('Error al calcular las materias:', error);
    }
  };

  const fetchGroups = async (subjectId: number) => {
    if (!selectedStudent) return;
    try {
      const res = await api.get('/preinscripcion/grupos', {
        params: {
          carreraId: selectedStudent.carrera?.id,
          gestion: currentGestion,
          semestre: subjects[0]?.semestre || 1,
        }
      });
      setGroups(res.data || []);
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
    }
  };

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroup(groupId);
    setSelectedTurno(groupId);
  };

  const toggleSubject = (subject: SubjectToEnroll) => {
    setSelectedSubjects(prev => {
      const exists = prev.find(s => s.materiaId === subject.materiaId);
      if (exists) {
        return prev.filter(s => s.materiaId !== subject.materiaId);
      }
      return [...prev, subject];
    });
  };

  const confirmEnrollment = async () => {
    if (!selectedStudent || !selectedGroup || selectedSubjects.length === 0) return;

    setLoading(true);
    try {
      const res = await api.post('/preinscripcion/inscribir-lote', {
        estudianteId: selectedStudent.id,
        gestion: currentGestion,
        periodo: currentPeriodo,
        grupoId: selectedGroup,
        materias: selectedSubjects,
      });
      setEnrollmentResult(res.data);
      setStep('success');
    } catch (error) {
      console.error('Error al inscribir:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('search');
    setSelectedStudent(null);
    setPaymentStatus(null);
    setSubjects([]);
    setSelectedSubjects([]);
    setGroups([]);
    setSelectedTurno(null);
    setSelectedGroup(null);
    setEnrollmentResult(null);
    setSearchQuery('');
    setStudents([]);
  };

  const renderSearch = () => (
    <div className="space-y-6">
      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <TituloTarjeta>Buscar Estudiante</TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Entrada
                placeholder="Buscar por nombre, CI o código de inscripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
              />
            </div>
            <Boton onClick={searchStudents} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Boton>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          )}

          {students.length > 0 && (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {student.persona?.nombres?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {student.persona?.nombres} {student.persona?.apellidoPaterno} {student.persona?.apellidoMaterno}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.persona?.ci} · {student.codigoInscripcion}
                    </p>
                    <p className="text-sm text-gray-400">
                      {student.carrera?.nombre} · Ingreso: {student.gestionAdmision}
                    </p>
                  </div>
                  <Insignia variant={student.gestionAdmision === currentGestion ? 'exito' : 'secondary'}>
                    {student.gestionAdmision === currentGestion ? 'Nuevo' : 'Antiguo'}
                  </Insignia>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !loading && students.length === 0 && (
            <p className="text-center text-gray-500 py-4">No se encontraron estudiantes</p>
          )}
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {selectedStudent?.persona?.nombres} {selectedStudent?.persona?.apellidoPaterno}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">CI</p>
              <p className="font-medium">{selectedStudent?.persona?.ci}</p>
            </div>
            <div>
              <p className="text-gray-500">Código</p>
              <p className="font-medium">{selectedStudent?.codigoInscripcion}</p>
            </div>
            <div>
              <p className="text-gray-500">Carrera</p>
              <p className="font-medium">{selectedStudent?.carrera?.nombre}</p>
            </div>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>

      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Estado de Pagos - {currentPeriodo}/{currentGestion}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : paymentStatus ? (
            <>
              {paymentStatus.puedeInscribir ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Pagos completados</p>
                    <p className="text-sm text-green-600">El estudiante puede inscribirse</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Pagos pendientes</p>
                    <p className="text-sm text-red-600">El estudiante debe completar los pagos</p>
                  </div>
                </div>
              )}

              {paymentStatus.pagosRealizados.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pagos realizados</h4>
                  <div className="space-y-2">
                    {paymentStatus.pagosRealizados.map((payment, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{payment.concepto}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.fechaPago).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                        <Insignia variant="exito">Bs. {payment.monto}</Insignia>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentStatus.pagosFaltantes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pagos pendientes</h4>
                  <div className="space-y-2">
                    {paymentStatus.pagosFaltantes.map((payment, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <p className="font-medium">{payment.concepto}</p>
                        <Insignia variant="error">Bs. {payment.monto}</Insignia>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          <div className="flex gap-3 pt-4">
            <Boton variant="outline" onClick={() => setStep('search')}>
              Volver
            </Boton>
            {paymentStatus?.puedeInscribir && (
              <Boton onClick={() => setStep('subjects')}>
                Continuar
              </Boton>
            )}
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Materias a Cursar - {currentPeriodo}/{currentGestion}
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          {paymentStatus?.esEstudianteNuevo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Estudiante nuevo:</strong> Se le asignarán las materias del primer semestre según su plan de estudio.
              </p>
            </div>
          )}

          {subjects.filter(s => s.prerrequisitoBloqueado).length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                <strong>Materias bloqueadas por prerrequisitos:</strong>{' '}
                {subjects.filter(s => s.prerrequisitoBloqueado).map(s => s.materiaNombre).join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {subjects.filter(s => !s.prerrequisitoBloqueado).map((subject) => (
              <div
                key={subject.materiaId}
                onClick={() => toggleSubject(subject)}
                className={`p-4 border rounded-lg cursor-pointer flex items-center gap-4 ${
                  selectedSubjects.find(s => s.materiaId === subject.materiaId)
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selectedSubjects.find(s => s.materiaId === subject.materiaId)}
                  onChange={() => {}}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{subject.materiaNombre}</p>
                    {subject.esReprobada && (
                      <Insignia variant="advertencia">Reprobada</Insignia>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {subject.materiaCodigo} · Semestre {subject.semestre}
                  </p>
                  {subject.esReprobada && subject.notaAnteriorReprobada && (
                    <p className="text-xs text-red-500">
                      Nota anterior: {subject.notaAnteriorReprobada}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Boton variant="outline" onClick={() => setStep('payments')}>
              Volver
            </Boton>
            <Boton
              onClick={() => setStep('groups')}
              disabled={selectedSubjects.length === 0}
            >
              Continuar ({selectedSubjects.length} materias)
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-6">
      <Tarjeta variant="bordered">
        <EncabezadoTarjeta>
          <TituloTarjeta className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seleccionar Turno y Grupo
          </TituloTarjeta>
        </EncabezadoTarjeta>
        <ContenidoTarjeta className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Turnos disponibles</h4>
              <div className="space-y-2">
                {turnos.map((turno) => (
                  <div
                    key={turno.id}
                    onClick={() => setSelectedTurno(turno.id)}
                    className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedTurno === turno.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{turno.nombre}</p>
                      <p className="text-sm text-gray-500">Código: {turno.codigo}</p>
                    </div>
                    {selectedTurno === turno.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">
                Grupos - Semestre {subjects[0]?.semestre}
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {groups
                  .filter(g => !selectedTurno || g.turnoId === selectedTurno)
                  .map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupSelect(group.id)}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedGroup === group.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          Paralelo {group.paralelo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {group.turno?.nombre || 'Sin turno'} · Capacidad: {group.capacidad}
                        </p>
                      </div>
                      {selectedGroup === group.id && (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                  ))}
                {groups.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No hay grupos creados para este semestre
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Boton variant="outline" onClick={() => setStep('subjects')}>
              Volver
            </Boton>
            <Boton
              onClick={() => setStep('confirm')}
              disabled={!selectedGroup}
            >
              Confirmar Inscripción
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  const renderConfirm = () => {
    const group = groups.find(g => g.id === selectedGroup);

    return (
      <div className="space-y-6">
        <Tarjeta variant="bordered">
          <EncabezadoTarjeta>
            <TituloTarjeta className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Confirmar Inscripción
            </TituloTarjeta>
          </EncabezadoTarjeta>
          <ContenidoTarjeta className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estudiante:</span>
                <span className="font-medium">
                  {selectedStudent?.persona?.nombres} {selectedStudent?.persona?.apellidoPaterno}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gestión:</span>
                <span className="font-medium">{currentPeriodo}/{currentGestion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Turno:</span>
                <span className="font-medium">
                  {turnos.find(t => t.id === selectedTurno)?.nombre || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupo:</span>
                <span className="font-medium">
                  Paralelo {group?.paralelo}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Materias a inscribir:</h4>
              <div className="space-y-1">
                {selectedSubjects.map((subject) => (
                  <div key={subject.materiaId} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{subject.materiaNombre}</span>
                    {subject.esReprobada && (
                      <Insignia variant="advertencia" className="text-xs">Reprobada</Insignia>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Boton variant="outline" onClick={() => setStep('groups')}>
                Volver
              </Boton>
              <Boton onClick={confirmEnrollment} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Boton>
            </div>
          </ContenidoTarjeta>
        </Tarjeta>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="space-y-6">
      <Tarjeta variant="bordered">
        <ContenidoTarjeta className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Inscripción exitosa!
          </h2>
          <p className="text-gray-600 mb-6">
            Se han creado {enrollmentResult?.inscripciones?.length} inscripciones para {currentPeriodo}/{currentGestion}
          </p>

          {enrollmentResult?.boletaId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Boleta generada:</strong> La boleta de inscripción está disponible en Documentos.
              </p>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {enrollmentResult?.inscripciones?.map((e: any) => (
              <div key={e.id} className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{e.materiaNombre}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Boton variant="outline" onClick={resetFlow}>
              Nueva Inscripción
            </Boton>
            <Boton onClick={() => window.print()}>
              Imprimir Comprobante
            </Boton>
          </div>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );

  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Preinscripcion' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Preinscripción Semestral</h1>
        <div className="flex items-center gap-2 text-sm">
          <Insignia variant={currentPeriodo === 'I' ? 'primary' : 'secondary'}>
            {currentPeriodo}/{currentGestion}
          </Insignia>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(['search', 'payments', 'subjects', 'groups', 'confirm', 'success'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-primary-600 text-white' :
              ['search', 'payments', 'subjects', 'groups', 'confirm', 'success'].indexOf(step) > i
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </div>
            {i < 5 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 'search' && renderSearch()}
      {step === 'payments' && renderPayments()}
      {step === 'subjects' && renderSubjects()}
      {step === 'groups' && renderGroups()}
      {step === 'confirm' && renderConfirm()}
      {step === 'success' && renderSuccess()}
    </div>
  );
}
