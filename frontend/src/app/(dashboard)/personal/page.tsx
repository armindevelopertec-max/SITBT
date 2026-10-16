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
import { Plus, Search, Edit2, Trash2, Loader2, User, Eye, Key } from 'lucide-react';
import { api } from '@/libreria/api';
import { Personal } from '@/tipos';

const OPCIONES_CARGO = [
  { value: 'docente', etiqueta: 'Docente' },
  { value: 'secretaria', etiqueta: 'Secretaría' },
  { value: 'director_academico', etiqueta: 'Director Académico' },
  { value: 'rector', etiqueta: 'Rector' },
  { value: 'apoyo', etiqueta: 'Personal de Apoyo' },
  { value: 'bibliotecario', etiqueta: 'Bibliotecario' },
];

export default function PaginaPersonal() {
  const router = useRouter();
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [personalEliminando, setPersonalEliminando] = useState<Personal | null>(null);
  const [modalCredenciales, setModalCredenciales] = useState<{ nombreUsuario: string; contrasena: string; nombre: string; personalId: number; personaId: number } | null>(null);

  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  useEffect(() => {
    obtenerPersonal();
  }, []);

  const obtenerPersonal = async () => {
    try {
      const respuesta = await api.get('/personal');
      setPersonal(respuesta.data.datos);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    } finally {
      setCargando(false);
    }
  };

  const personalFiltrado = personal.filter((elemento) => {
    const persona = elemento.persona;
    if (!persona) return false;
    const nombreCompleto = `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase();
    const ci = persona.ci.toLowerCase();
    const busqueda = terminoBusqueda.toLowerCase();
    return nombreCompleto.includes(busqueda) || ci.includes(busqueda);
  });

  const obtenerInsigniaEstado = (estado: string) => {
    const variantes: Record<string, 'exito' | 'error' | 'advertencia' | 'secundario'> = {
      activo: 'exito',
      inactivo: 'error',
      licencia: 'advertencia',
    };
    return <Insignia variante={variantes[estado] || 'secundario'}>{estado}</Insignia>;
  };

  const obtenerInsigniaCargo = (cargo: string) => {
    const variantes: Record<string, 'primario' | 'secundario' | 'advertencia' | 'exito'> = {
      docente: 'primario',
      rector: 'advertencia',
      secretaria: 'secundario',
      director_academico: 'exito',
      apoyo: 'secundario',
      bibliotecario: 'secundario',
    };
    return <Insignia variante={variantes[cargo] || 'secundario'}>{cargo.replace('_', ' ')}</Insignia>;
  };

  const eliminar = async () => {
    if (!personalEliminando) return;
    setCargandoFormulario(true);
    try {
      await api.delete(`/personal/${personalEliminando.id}`);
      setPersonalEliminando(null);
      obtenerPersonal();
    } catch (error) {
      console.error('Error al eliminar personal:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar personal'));
      }).catch(() => {
        alert('Error al eliminar personal');
      });
    } finally {
      setCargandoFormulario(false);
    }
  };

  const verCredenciales = async (elemento: Personal) => {
    try {
      const respuesta = await api.get(`/usuarios?personaId=${elemento.personaId}`);
      const usuarios = respuesta.data.datos;
      const persona = elemento.persona;
      const nombre = persona ? `${persona.nombres} ${persona.apellidoPaterno}` : 'Personal';

      if (usuarios && usuarios.length > 0 && persona) {
        const usuario = usuarios[0];
        const nuevaContrasena = `${persona.ci}-${new Date().getFullYear()}`;
        setModalCredenciales({ nombreUsuario: usuario.nombreUsuario, contrasena: nuevaContrasena, nombre, personalId: elemento.id, personaId: elemento.personaId });
      } else {
        setModalCredenciales({ nombreUsuario: 'No tiene usuario', contrasena: '', nombre, personalId: elemento.id, personaId: elemento.personaId });
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      setModalCredenciales({ nombreUsuario: 'Error al cargar', contrasena: '', nombre: elemento.persona?.nombres || '', personalId: elemento.id, personaId: elemento.personaId });
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
      <Migas elementos={[{ etiqueta: 'Personal' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
        <Boton onClick={() => router.push('/personal/nuevo')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Personal
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Personal ({personal.length})</TituloTarjeta>
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
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre Completo</CeldaEncabezado>
                <CeldaEncabezado>Cargo</CeldaEncabezado>
                <CeldaEncabezado>Profesión</CeldaEncabezado>
                <CeldaEncabezado>Estado</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {personalFiltrado.map((elemento) => (
                <FilaTabla key={elemento.id}>
                  <CeldaTabla className="font-medium">
                    {elemento.persona?.ci}
                  </CeldaTabla>
                  <CeldaTabla>
                    {elemento.persona?.nombres} {elemento.persona?.apellidoPaterno} {elemento.persona?.apellidoMaterno}
                  </CeldaTabla>
                  <CeldaTabla>{obtenerInsigniaCargo(elemento.cargo)}</CeldaTabla>
                  <CeldaTabla>{elemento.profesion || '-'}</CeldaTabla>
                  <CeldaTabla>{obtenerInsigniaEstado(elemento.estado)}</CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono" title="Ver credenciales" onClick={() => verCredenciales(elemento)}>
                        <Eye className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" title="Editar" onClick={() => router.push(`/personal/editar/${elemento.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono" title="Eliminar" onClick={() => setPersonalEliminando(elemento)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
              {personalFiltrado.length === 0 && (
                <FilaTabla>
                  <CeldaTabla colSpan={6} className="text-center py-8 text-gray-500">
                    {terminoBusqueda ? 'No se encontró personal' : 'No hay personal registrado'}
                  </CeldaTabla>
                </FilaTabla>
              )}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>

      <ModalConfirmacion
        abierto={!!personalEliminando}
        alCerrar={() => setPersonalEliminando(null)}
        alConfirmar={eliminar}
        titulo="Eliminar Personal"
        mensaje={`¿Está seguro de eliminar a "${personalEliminando?.persona?.nombres} ${personalEliminando?.persona?.apellidoPaterno}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={cargandoFormulario}
      />

      <Modal abierto={!!modalCredenciales} alCerrar={() => setModalCredenciales(null)} titulo="Credenciales del Personal" tamano="mediano">
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
              ⚠️ Esta contraseña es temporal. El usuario debe cambiarla después de iniciar sesión.
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
