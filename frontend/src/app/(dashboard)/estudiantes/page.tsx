'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key, Filter } from 'lucide-react';
import { api } from '@/libreria/api';
import { Estudiante } from '@/tipos';
import { Selector } from '@/componentes/iu/selector';

const etiquetasEstado: Record<string, { etiqueta: string; color: string }> = {
  pre_registro: { etiqueta: 'Pre-registro', color: 'bg-purple-100 text-purple-800' },
  verificado: { etiqueta: 'Verificado', color: 'bg-blue-100 text-blue-800' },
  matriculado: { etiqueta: 'Matriculado', color: 'bg-green-100 text-green-800' },
  egresado: { etiqueta: 'Egresado', color: 'bg-gray-100 text-gray-800' },
  retirado: { etiqueta: 'Retirado', color: 'bg-red-100 text-red-800' },
};

const etiquetasOrigen: Record<string, string> = {
  web: 'Web',
  secretaria: 'Secretaría',
};

export default function PaginaEstudiantes() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroOrigen, setFiltroOrigen] = useState<string>('');

  const [estudianteEliminando, setEstudianteEliminando] = useState<Estudiante | null>(null);
  const [modalCredenciales, setModalCredenciales] = useState<{ nombreUsuario: string; contrasena: string; nombre: string; estudianteId: number; personaId: number } | null>(null);
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const obtenerEstudiantes = async () => {
    try {
      const respuesta = await api.get('/estudiantes');
      setEstudiantes(respuesta.data.datos);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setCargando(false);
    }
  };

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const persona = estudiante.persona;
    if (!persona) return false;
    const nombreCompleto = `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase();
    const ci = persona.ci.toLowerCase();
    const busqueda = terminoBusqueda.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda) || ci.includes(busqueda);
    const coincideEstado = !filtroEstado || estudiante.estadoMatricula === filtroEstado;
    const coincideOrigen = !filtroOrigen || estudiante.origen === filtroOrigen;
    return coincideBusqueda && coincideEstado && coincideOrigen;
  });

  const obtenerInsigniaEstado = (estado: string) => {
    const configuracion = etiquetasEstado[estado] || { etiqueta: estado, color: 'bg-gray-100 text-gray-800' };
    return <Insignia className={configuracion.color}>{configuracion.etiqueta}</Insignia>;
  };

  const eliminar = async () => {
    if (!estudianteEliminando) return;
    setCargandoFormulario(true);
    try {
      await api.delete(`/estudiantes/${estudianteEliminando.id}`);
      setEstudianteEliminando(null);
      obtenerEstudiantes();
    } catch (error: any) {
      console.error('Error al eliminar estudiante:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar estudiante'));
      }).catch(() => {
        alert('Error al eliminar estudiante');
      });
    } finally {
      setCargandoFormulario(false);
    }
  };

  const verCredenciales = async (estudiante: Estudiante) => {
    try {
      const respuesta = await api.get(`/usuarios?personaId=${estudiante.personaId}`);
      const usuarios = respuesta.data.datos;
      const persona = estudiante.persona;
      const nombre = persona ? `${persona.nombres} ${persona.apellidoPaterno}` : 'Estudiante';

      if (usuarios && usuarios.length > 0 && persona) {
        const usuario = usuarios[0];
        const nuevaContrasena = `${persona.ci}-${new Date().getFullYear()}`;
        setModalCredenciales({ nombreUsuario: usuario.nombreUsuario, contrasena: nuevaContrasena, nombre, estudianteId: estudiante.id, personaId: estudiante.personaId });
      } else {
        setModalCredenciales({ nombreUsuario: 'No tiene usuario', contrasena: '', nombre, estudianteId: estudiante.id, personaId: estudiante.personaId });
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      setModalCredenciales({ nombreUsuario: 'Error al cargar', contrasena: '', nombre: estudiante.persona?.nombres || '', estudianteId: estudiante.id, personaId: estudiante.personaId });
    }
  };

  const restablecerContrasena = async () => {
    if (!modalCredenciales) return;
    setCargandoRestablecer(true);
    try {
      const respuesta = await api.get(`/usuarios?personaId=${modalCredenciales.personaId}`);
      const usuarios = respuesta.data.datos;
      if (usuarios && usuarios.length > 0) {
        await api.post(`/usuarios/${usuarios[0].id}/cambiar-contrasena`, { nuevaContrasena: modalCredenciales.contrasena });
      }
      setModalCredenciales(null);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al restablecer la contraseña'));
      }).catch(() => {
        alert('Error al restablecer la contraseña');
      });
    } finally {
      setCargandoRestablecer(false);
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
      <Migas elementos={[{ etiqueta: 'Estudiantes' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        <Boton onClick={() => router.push('/estudiantes/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Estudiante
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TituloTarjeta>Lista de Estudiantes ({estudiantesFiltrados.length})</TituloTarjeta>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Selector
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  opciones={[
                    { value: '', etiqueta: 'Todos' },
                    { value: 'pre_registro', etiqueta: 'Pre-registro' },
                    { value: 'verificado', etiqueta: 'Verificado' },
                    { value: 'matriculado', etiqueta: 'Matriculado' },
                    { value: 'egresado', etiqueta: 'Egresado' },
                    { value: 'retirado', etiqueta: 'Retirado' },
                  ]}
                  placeholder="Estado"
                />
                <Selector
                  value={filtroOrigen}
                  onChange={(e) => setFiltroOrigen(e.target.value)}
                  opciones={[
                    { value: '', etiqueta: 'Todos' },
                    { value: 'web', etiqueta: 'Web' },
                    { value: 'secretaria', etiqueta: 'Secretaría' },
                  ]}
                  placeholder="Origen"
                />
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  placeholder="Buscar por nombre o CI..."
                  className="pl-10"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre Completo</CeldaEncabezado>
                <CeldaEncabezado>Código</CeldaEncabezado>
                <CeldaEncabezado>Origen</CeldaEncabezado>
                <CeldaEncabezado>Estado Matrícula</CeldaEncabezado>
                <CeldaEncabezado>Fecha Ingreso</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {estudiantesFiltrados.map((estudiante) => (
                <FilaTabla key={estudiante.id}>
                  <CeldaTabla className="font-medium">
                    {estudiante.persona?.ci}
                  </CeldaTabla>
                  <CeldaTabla>
                    {estudiante.persona?.nombres} {estudiante.persona?.apellidoPaterno} {estudiante.persona?.apellidoMaterno}
                  </CeldaTabla>
                  <CeldaTabla>{estudiante.codigoInscripcion}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante="contorno">{etiquetasOrigen[estudiante.origen || 'secretaria'] || '-'}</Insignia>
                  </CeldaTabla>
                  <CeldaTabla>{obtenerInsigniaEstado(estudiante.estadoMatricula || 'matriculado')}</CeldaTabla>
                  <CeldaTabla>{new Date(estudiante.fechaAdmision).toLocaleDateString('es-BO')}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" title="Ver credenciales" onClick={() => verCredenciales(estudiante)}>
                        <Eye className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" title="Editar" onClick={() => router.push(`/estudiantes/editar/${estudiante.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" title="Eliminar" onClick={() => setEstudianteEliminando(estudiante)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {estudiantesFiltrados.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={7} className="text-center py-8 text-gray-500">
                    {terminoBusqueda || filtroEstado || filtroOrigen ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      <ModalConfirmacion
        abierto={!!estudianteEliminando}
        alCerrar={() => setEstudianteEliminando(null)}
        alConfirmar={eliminar}
        titulo="Eliminar Estudiante"
        mensaje={`¿Está seguro de eliminar al estudiante "${estudianteEliminando?.persona?.nombres} ${estudianteEliminando?.persona?.apellidoPaterno}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={cargandoFormulario}
      />

      <Modal abierto={!!modalCredenciales} alCerrar={() => setModalCredenciales(null)} titulo="Credenciales del Estudiante" tamano="mediano">
        {modalCredenciales && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Credenciales de acceso para <strong>{modalCredenciales.nombre}</strong>:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nombre de usuario</p>
                  <p className="font-mono font-medium">{modalCredenciales.nombreUsuario}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Contraseña temporal</p>
                  <p className="font-mono font-medium text-green-600">{modalCredenciales.contrasena}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ Esta contraseña es temporal. El estudiante debe cambiarla después de iniciar sesión.
            </p>
            <div className="flex justify-end gap-3">
              <Boton variante="contorno" onClick={() => setModalCredenciales(null)}>Cerrar</Boton>
              <Boton onClick={restablecerContrasena} cargando={cargandoRestablecer} disabled={modalCredenciales.nombreUsuario === 'No tiene usuario' || modalCredenciales.nombreUsuario === 'Error al cargar'}>
                Restablecer Contraseña
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
