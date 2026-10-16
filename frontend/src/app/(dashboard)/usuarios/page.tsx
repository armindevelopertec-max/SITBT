'use client';

import { useState, useEffect } from 'react';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { usarUsuarios, UsuarioRespuesta } from '@/ganchos/usarUsuarios';
import { Rol } from '@/tipos';
import { Plus, Search, Edit2, Trash2, Shield, Key, X, Loader2 } from 'lucide-react';

const coloresRol: Record<string, 'predeterminado' | 'primario' | 'secundario' | 'exito' | 'advertencia' | 'error'> = {
  administrador: 'error',
  rector: 'predeterminado',
  director_academico: 'primario',
  secretaria: 'secundario',
  docente: 'exito',
  estudiante: 'advertencia',
  apoyo: 'predeterminado',
};

const ROLES = [
  { codigo: 'administrador', nombre: 'Administrador' },
  { codigo: 'secretaria', nombre: 'Secretaría' },
  { codigo: 'director_academico', nombre: 'Director Académico' },
  { codigo: 'rector', nombre: 'Rector' },
  { codigo: 'docente', nombre: 'Docente' },
  { codigo: 'estudiante', nombre: 'Estudiante' },
  { codigo: 'apoyo', nombre: 'Apoyo' },
];

export default function PaginaUsuarios() {
  const { usuarios, cargando, error, paginacion, recargar, crearUsuario, actualizarUsuario, eliminarUsuario, cambiarContrasena } = usarUsuarios();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [modalRestablecer, setModalRestablecer] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<UsuarioRespuesta | null>(null);

  const [datosFormulario, setDatosFormulario] = useState({ nombreUsuario: '', contrasena: '', personaId: 1, codigoRol: 'estudiante' });
  const [cargandoFormulario, setCargandoFormulario] = useState(false);

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [modalRestablecerContrasena, setModalRestablecerContrasena] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombreUsuario.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    usuario.persona?.correo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    usuario.persona?.nombres?.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const obtenerInsigniaRol = (roles: UsuarioRespuesta['roles']) => {
    if (!roles || roles.length === 0) return <Insignia variante="predeterminado">Sin rol</Insignia>;
    const rolPrincipal = roles[0];
    return (
      <Insignia variante={coloresRol[rolPrincipal.codigo] || 'predeterminado'} className="capitalize">
        {rolPrincipal.nombre}
      </Insignia>
    );
  };

  const crear = async () => {
    try {
      setCargandoFormulario(true);
      await crearUsuario({ ...datosFormulario, codigoRol: datosFormulario.codigoRol as Rol });
      setModalCrear(false);
      setDatosFormulario({ nombreUsuario: '', contrasena: '', personaId: 1, codigoRol: 'estudiante' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setCargandoFormulario(false);
    }
  };

  const editar = async () => {
    if (!modalEditar) return;
    try {
      setCargandoFormulario(true);
      await actualizarUsuario(modalEditar.id, { nombreUsuario: datosFormulario.nombreUsuario });
      setModalEditar(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    } finally {
      setCargandoFormulario(false);
    }
  };

  const eliminar = async () => {
    if (!modalEliminar.usuario) return;
    try {
      setCargandoFormulario(true);
      await eliminarUsuario(modalEliminar.usuario.id);
      setModalEliminar({ abierto: false, usuario: null });
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar usuario'));
      }).catch(() => {
        alert('Error al eliminar usuario');
      });
    } finally {
      setCargandoFormulario(false);
    }
  };

  const restablecerContrasena = async () => {
    if (!modalRestablecerContrasena.usuario) return;
    try {
      setCargandoRestablecer(true);
      await cambiarContrasena(modalRestablecerContrasena.usuario.id, nuevaContrasena);
      setModalRestablecerContrasena({ abierto: false, usuario: null });
      setNuevaContrasena('');
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

  const abrirModalEdicion = (usuario: UsuarioRespuesta) => {
    setDatosFormulario({ ...datosFormulario, nombreUsuario: usuario.nombreUsuario });
    setModalEditar(usuario);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Migas elementos={[{ etiqueta: 'Usuarios' }]} />
        <div className="p-4 text-red-500">Error: {error}</div>
        <Boton onClick={recargar}>Reintentar</Boton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Usuarios' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Boton onClick={() => setModalCrear(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Usuarios del Sistema</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada
                placeholder="Buscar usuario..."
                className="pl-10"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
              />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          {cargando && usuarios.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabla>
              <EncabezadoTabla>
                <FilaTabla>
                  <CeldaEncabezado>Usuario</CeldaEncabezado>
                  <CeldaEncabezado>Correo</CeldaEncabezado>
                  <CeldaEncabezado>Rol</CeldaEncabezado>
                  <CeldaEncabezado>Estado</CeldaEncabezado>
                  <CeldaEncabezado>Acciones</CeldaEncabezado>
                </FilaTabla>
              </EncabezadoTabla>
              <CuerpoTabla>
                {usuariosFiltrados.map((usuario) => (
                  <FilaTabla key={usuario.id}>
                    <CeldaTabla>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium">{usuario.nombreUsuario}</span>
                      </div>
                    </CeldaTabla>
                    <CeldaTabla>{usuario.persona?.correo || '-'}</CeldaTabla>
                    <CeldaTabla>{obtenerInsigniaRol(usuario.roles)}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variante={usuario.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                        {usuario.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <div className="flex items-center gap-2">
                        <Boton variante="fantasma" tamano="icono" title="Restablecer contraseña" onClick={() => setModalRestablecerContrasena({ abierto: true, usuario })}>
                          <Key className="w-4 h-4" />
                        </Boton>
                        <Boton variante="fantasma" tamano="icono" title="Editar" onClick={() => abrirModalEdicion(usuario)}>
                          <Edit2 className="w-4 h-4" />
                        </Boton>
                        <Boton variante="fantasma" tamano="icono" title="Eliminar" onClick={() => setModalEliminar({ abierto: true, usuario })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Boton>
                      </div>
                    </CeldaTabla>
                  </FilaTabla>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <FilaTabla>
                    <CeldaTabla colSpan={5} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </CeldaTabla>
                  </FilaTabla>
                )}
              </CuerpoTabla>
            </Tabla>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal abierto={modalCrear} alCerrar={() => setModalCrear(false)} titulo="Nuevo Usuario" tamano="mediano">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Entrada
              value={datosFormulario.nombreUsuario}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, nombreUsuario: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <Entrada
              type="password"
              value={datosFormulario.contrasena}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, contrasena: e.target.value })}
              placeholder="Contraseña segura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              className="w-full p-2 border rounded-md"
              value={datosFormulario.codigoRol}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, codigoRol: e.target.value })}
            >
              {ROLES.map((role) => (
                <option key={role.codigo} value={role.codigo}>{role.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalCrear(false)}>Cancelar</Boton>
            <Boton onClick={crear} cargando={cargandoFormulario}>Crear Usuario</Boton>
          </div>
        </div>
      </Modal>

      <Modal abierto={!!modalEditar} alCerrar={() => setModalEditar(null)} titulo="Editar Usuario" tamano="mediano">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <Entrada
              value={datosFormulario.nombreUsuario}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, nombreUsuario: e.target.value })}
              placeholder="juan.perez"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalEditar(null)}>Cancelar</Boton>
            <Boton onClick={editar} cargando={cargandoFormulario}>Guardar Cambios</Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={modalEliminar.abierto}
        alCerrar={() => setModalEliminar({ abierto: false, usuario: null })}
        alConfirmar={eliminar}
        titulo="Eliminar Usuario"
        mensaje={`¿Está seguro de eliminar el usuario "${modalEliminar.usuario?.nombreUsuario}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={cargandoFormulario}
      />

      <Modal abierto={modalRestablecerContrasena.abierto} alCerrar={() => setModalRestablecerContrasena({ abierto: false, usuario: null })} titulo="Restablecer Contraseña" tamano="pequeno">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingrese la nueva contraseña para el usuario &quot;{modalRestablecerContrasena.usuario?.nombreUsuario}&quot;:
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <Entrada
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="Nueva contraseña"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Boton variante="contorno" onClick={() => setModalRestablecerContrasena({ abierto: false, usuario: null })}>Cancelar</Boton>
            <Boton onClick={restablecerContrasena} cargando={cargandoRestablecer}>Restablecer</Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
