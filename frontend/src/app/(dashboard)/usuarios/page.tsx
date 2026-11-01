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
import { usarRoles } from '@/ganchos/usarRoles';
import { mensajeDeError } from '@/libreria/utilidades';
import { Search, Edit2, Trash2, Shield, Key, X, Loader2, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';

const coloresRol: Record<string, 'predeterminado' | 'primario' | 'secundario' | 'exito' | 'advertencia' | 'error'> = {
  administrador: 'error',
  rector: 'predeterminado',
  director_academico: 'primario',
  secretaria: 'secundario',
  docente: 'exito',
  estudiante: 'advertencia',
  apoyo: 'predeterminado',
};

export default function PaginaUsuarios() {
  const { usuarios, cargando, error, paginacion, recargar, actualizarUsuario, eliminarUsuario, cambiarContrasena, obtenerUsuarios, asignarRol, removerRol } = usarUsuarios();
  const { roles, cargando: cargandoRoles, error: errorCatalogoRoles } = usarRoles();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const [modalRoles, setModalRoles] = useState<UsuarioRespuesta | null>(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<number[]>([]);
  const [guardandoRoles, setGuardandoRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);

  const [modalRestablecer, setModalRestablecer] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [modalEditar, setModalEditar] = useState<UsuarioRespuesta | null>(null);

  const [datosFormulario, setDatosFormulario] = useState({ nombreUsuario: '' });
  const [cargandoFormulario, setCargandoFormulario] = useState(false);

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [modalRestablecerContrasena, setModalRestablecerContrasena] = useState({ abierto: false, usuario: null as UsuarioRespuesta | null });
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombreUsuario.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    usuario.persona?.correo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    usuario.persona?.nombres?.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const generarPaginas = (paginaActual: number, totalPag: number): (number | '...')[] => {
    if (totalPag <= 1) return [1];
    const paginas: (number | '...')[] = [];
    const inicio = Math.max(2, paginaActual - 1);
    const fin = Math.min(totalPag - 1, paginaActual + 1);
    paginas.push(1);
    if (inicio > 2) paginas.push('...');
    for (let p = inicio; p <= fin; p++) {
      paginas.push(p);
    }
    if (fin < totalPag - 1) paginas.push('...');
    paginas.push(totalPag);
    return paginas;
  };

  const totalPaginas = Math.max(1, Math.ceil(paginacion.total / paginacion.limite));
  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas || nuevaPagina === paginacion.pagina || cargando) return;
    obtenerUsuarios(nuevaPagina, paginacion.limite);
  };

  const inicioRango = paginacion.total === 0 ? 0 : (paginacion.pagina - 1) * paginacion.limite + 1;
  const finRango = Math.min(paginacion.pagina * paginacion.limite, paginacion.total);

  const obtenerInsigniaRol = (roles: UsuarioRespuesta['roles']) => {
    if (!roles || roles.length === 0) return <Insignia variante="predeterminado">Sin rol</Insignia>;
    const rolPrincipal = roles[0];
    return (
      <Insignia variante={coloresRol[rolPrincipal.codigo] || 'predeterminado'} className="capitalize">
        {rolPrincipal.nombre}
      </Insignia>
    );
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

  const abrirRoles = (usuario: UsuarioRespuesta) => {
    setMensaje(null);
    setErrorRoles(null);
    setRolesSeleccionados((usuario.roles ?? []).map((rol) => rol.id));
    setModalRoles(usuario);
  };

  const alternarRol = (rolId: number) => {
    setRolesSeleccionados((actual) =>
      actual.includes(rolId)
        ? actual.filter((id) => id !== rolId)
        : [...actual, rolId],
    );
  };

  const guardarRoles = async () => {
    if (!modalRoles) return;

    setGuardandoRoles(true);
    setErrorRoles(null);

    try {
      const actuales = new Set((modalRoles.roles ?? []).map((rol) => rol.id));
      const nuevos = new Set(rolesSeleccionados);
      const agregar = Array.from(nuevos).filter((id) => !actuales.has(id));
      const quitar = Array.from(actuales).filter((id) => !nuevos.has(id));

      for (const rolId of agregar) {
        await asignarRol(modalRoles.id, rolId);
      }

      for (const rolId of quitar) {
        await removerRol(modalRoles.id, rolId);
      }

      await recargar();
      setMensaje({
        tipo: 'exito',
        texto: `Roles de "${modalRoles.nombreUsuario}" actualizados correctamente`,
      });
      setModalRoles(null);
    } catch (err) {
      setErrorRoles(mensajeDeError(err, 'No se pudieron actualizar los roles'));
    } finally {
      setGuardandoRoles(false);
    }
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

      <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>

      {mensaje && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensaje.tipo === 'exito'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

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
                  <CeldaEncabezado>Nombre</CeldaEncabezado>
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
                    <CeldaTabla>
                      {usuario.persona
                        ? [usuario.persona.nombres, usuario.persona.apellidoPaterno, usuario.persona.apellidoMaterno]
                            .filter(Boolean)
                            .join(' ')
                        : '-'}
                    </CeldaTabla>
                    <CeldaTabla>{obtenerInsigniaRol(usuario.roles)}</CeldaTabla>
                    <CeldaTabla>
                      <Insignia variante={usuario.estado === 'activo' ? 'exito' : 'error'} className="capitalize">
                        {usuario.estado}
                      </Insignia>
                    </CeldaTabla>
                    <CeldaTabla>
                      <div className="flex items-center gap-2">
                        <Boton variante="fantasma" tamano="icono" title="Asignar roles" onClick={() => abrirRoles(usuario)}>
                          <UserCog className="w-4 h-4" />
                        </Boton>
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
          {paginacion.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Mostrando {inicioRango} a {finRango} de {paginacion.total} usuarios
              </div>
              <div className="flex items-center gap-2">
                <Boton
                  variante="contorno"
                  tamano="pequeno"
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1 || cargando}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Boton>
                {generarPaginas(paginacion.pagina, totalPaginas).map((p, indice) =>
                  p === '...' ? (
                    <span key={`ellipsis-${indice}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Boton
                      key={p}
                      variante={p === paginacion.pagina ? 'primario' : 'contorno'}
                      tamano="pequeno"
                      onClick={() => cambiarPagina(p as number)}
                      disabled={cargando}
                    >
                      {p}
                    </Boton>
                  )
                )}
                <Boton
                  variante="contorno"
                  tamano="pequeno"
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina >= totalPaginas || cargando}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Boton>
              </div>
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

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

      <Modal
        abierto={!!modalRoles}
        alCerrar={() => setModalRoles(null)}
        titulo={`Roles de ${modalRoles?.nombreUsuario ?? ''}`}
        descripcion="Los permisos del usuario se suman según los roles que tenga asignados."
        tamano="mediano"
      >
        <div className="space-y-4">
          {errorCatalogoRoles && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorCatalogoRoles}
            </div>
          )}

          {cargandoRoles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : roles.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              No hay roles registrados. Crea uno desde la sección Roles.
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {roles.map((rol) => {
                const seleccionado = rolesSeleccionados.includes(rol.id);
                const inactivo = rol.estado === 'inactivo';

                return (
                  <label
                    key={rol.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      seleccionado
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
                      checked={seleccionado}
                      onChange={() => alternarRol(rol.id)}
                      disabled={inactivo && !seleccionado}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900">{rol.nombre}</span>
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          {rol.codigo}
                        </code>
                        {inactivo && (
                          <Insignia variante="predeterminado">Inactivo</Insignia>
                        )}
                      </div>
                      {rol.descripcion && (
                        <p className="mt-1 text-xs text-gray-500">{rol.descripcion}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {errorRoles && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorRoles}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Boton
              variante="contorno"
              onClick={() => setModalRoles(null)}
              disabled={guardandoRoles}
            >
              Cancelar
            </Boton>
            <Boton onClick={guardarRoles} cargando={guardandoRoles}>
              Guardar Roles
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
