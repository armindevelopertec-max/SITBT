'use client';

import { useState } from 'react';
import { Migas } from '@/componentes/iu/migas';
import {
  Tarjeta,
  ContenidoTarjeta,
  EncabezadoTarjeta,
  TituloTarjeta,
  DescripcionTarjeta,
} from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada, AreaTexto } from '@/componentes/iu/entrada';
import { Insignia } from '@/componentes/iu/insignia';
import {
  Tabla,
  CuerpoTabla,
  CeldaTabla,
  CeldaEncabezado,
  EncabezadoTabla,
  FilaTabla,
} from '@/componentes/iu/tabla';
import { Modal, ModalConfirmacion } from '@/componentes/iu/modal';
import { ModalPermisos } from '@/componentes/roles/modal-permisos';
import { usarRoles } from '@/ganchos/usarRoles';
import { mensajeDeError } from '@/libreria/utilidades';
import { RolSistema } from '@/tipos';
import { Plus, Search, Edit2, Trash2, Loader2, ShieldCheck } from 'lucide-react';

const CODIGOS_SUGERIDOS = [
  { codigo: 'administrador', nombre: 'Administrador' },
  { codigo: 'secretaria', nombre: 'Secretaría' },
  { codigo: 'director_academico', nombre: 'Director Académico' },
  { codigo: 'rector', nombre: 'Rector' },
  { codigo: 'docente', nombre: 'Docente' },
  { codigo: 'estudiante', nombre: 'Estudiante' },
  { codigo: 'apoyo', nombre: 'Apoyo' },
];

const FORMULARIO_INICIAL = {
  codigo: '',
  nombre: '',
  descripcion: '',
  estado: 'activo' as 'activo' | 'inactivo',
};

const normalizarCodigo = (valor: string) =>
  valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

export default function PaginaRoles() {
  const { roles, cargando, error, recargar, crearRol, actualizarRol, eliminarRol } = usarRoles();

  const [busqueda, setBusqueda] = useState('');
  const [modalFormulario, setModalFormulario] = useState(false);
  const [rolEditando, setRolEditando] = useState<RolSistema | null>(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [rolEliminando, setRolEliminando] = useState<RolSistema | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [rolPermisos, setRolPermisos] = useState<RolSistema | null>(null);

  const abrirCrear = () => {
    setRolEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErrorFormulario(null);
    setMensaje(null);
    setModalFormulario(true);
  };

  const abrirEditar = (rol: RolSistema) => {
    setRolEditando(rol);
    setFormulario({
      codigo: rol.codigo,
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      estado: rol.estado === 'inactivo' ? 'inactivo' : 'activo',
    });
    setErrorFormulario(null);
    setMensaje(null);
    setModalFormulario(true);
  };

  const guardar = async () => {
    const codigo = normalizarCodigo(formulario.codigo);
    const nombre = formulario.nombre.trim();

    if (!codigo || !nombre) {
      setErrorFormulario('El código y el nombre son obligatorios');
      return;
    }

    setGuardando(true);
    setErrorFormulario(null);

    try {
      if (rolEditando) {
        await actualizarRol(rolEditando.id, {
          nombre,
          descripcion: formulario.descripcion.trim(),
          estado: formulario.estado,
        });
        setMensaje({ tipo: 'exito', texto: `Rol "${nombre}" actualizado correctamente` });
      } else {
        await crearRol({
          codigo,
          nombre,
          descripcion: formulario.descripcion.trim(),
          estado: formulario.estado,
        });
        setMensaje({ tipo: 'exito', texto: `Rol "${nombre}" creado correctamente` });
      }
      setModalFormulario(false);
    } catch (err: any) {
      setErrorFormulario(mensajeDeError(err, 'No se pudo guardar el rol'));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!rolEliminando) return;

    setEliminando(true);
    try {
      await eliminarRol(rolEliminando.id);
      setMensaje({
        tipo: 'exito',
        texto: `Rol "${rolEliminando.nombre}" eliminado correctamente`,
      });
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: mensajeDeError(err, 'No se pudo eliminar el rol'),
      });
    } finally {
      setRolEliminando(null);
      setEliminando(false);
    }
  };

  const rolesFiltrados = roles.filter((rol) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;

    return (
      rol.codigo.toLowerCase().includes(texto) ||
      rol.nombre.toLowerCase().includes(texto) ||
      (rol.descripcion || '').toLowerCase().includes(texto)
    );
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Roles' }]} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crea y administra los roles que se asignan a los usuarios del sistema.
          </p>
        </div>
        <Boton onClick={abrirCrear}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </Boton>
      </div>

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

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{error}</span>
          <Boton variante="contorno" tamano="pequeno" onClick={() => recargar()}>
            Reintentar
          </Boton>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">Permisos por rol</p>
        <p className="mt-1">
          Los accesos se asignan por módulo y acción con el botón{' '}
          <strong>Permisos</strong>. El menú lateral muestra los módulos donde el
          rol tiene permiso de lectura. El rol <code>administrador</code> tiene
          acceso total. Los módulos <strong>Usuarios</strong>, <strong>Roles</strong>,{' '}
          <strong>Permisos</strong>, <strong>Auditoría</strong> y la configuración
          institucional siguen siendo exclusivos del administrador.
        </p>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between gap-4">
            <div>
              <TituloTarjeta>Roles del sistema</TituloTarjeta>
              <DescripcionTarjeta>
                {roles.length} rol{roles.length === 1 ? '' : 'es'} registrado
                {roles.length === 1 ? '' : 's'}
              </DescripcionTarjeta>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada
                placeholder="Buscar rol..."
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </EncabezadoTarjeta>

        <ContenidoTarjeta>
          {rolesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-10 h-10 mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                {busqueda
                  ? 'No hay roles que coincidan con la búsqueda'
                  : 'Todavía no hay roles registrados'}
              </p>
              {!busqueda && (
                <Boton className="mt-4" onClick={abrirCrear}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear el primer rol
                </Boton>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Tabla>
                <EncabezadoTabla>
                  <FilaTabla>
                    <CeldaEncabezado>Código</CeldaEncabezado>
                    <CeldaEncabezado>Nombre</CeldaEncabezado>
                    <CeldaEncabezado>Descripción</CeldaEncabezado>
                    <CeldaEncabezado>Estado</CeldaEncabezado>
                    <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                  </FilaTabla>
                </EncabezadoTabla>
                <CuerpoTabla>
                  {rolesFiltrados.map((rol) => (
                    <FilaTabla key={rol.id}>
                      <CeldaTabla>
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {rol.codigo}
                        </code>
                      </CeldaTabla>
                      <CeldaTabla className="font-medium text-gray-900">{rol.nombre}</CeldaTabla>
                      <CeldaTabla className="text-gray-500">
                        {rol.descripcion || '—'}
                      </CeldaTabla>
                      <CeldaTabla>
                        <Insignia variante={rol.estado === 'activo' ? 'exito' : 'predeterminado'}>
                          {rol.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Insignia>
                      </CeldaTabla>
                      <CeldaTabla className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Boton
                            variante="fantasma"
                            tamano="icono"
                            onClick={() => {
                              setMensaje(null);
                              setRolPermisos(rol);
                            }}
                            title="Asignar permisos"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Boton>
                          <Boton
                            variante="fantasma"
                            tamano="icono"
                            onClick={() => abrirEditar(rol)}
                            title="Editar rol"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Boton>
                          <Boton
                            variante="fantasma"
                            tamano="icono"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setMensaje(null);
                              setRolEliminando(rol);
                            }}
                            title="Eliminar rol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Boton>
                        </div>
                      </CeldaTabla>
                    </FilaTabla>
                  ))}
                </CuerpoTabla>
              </Tabla>
            </div>
          )}
        </ContenidoTarjeta>
      </Tarjeta>

      <Modal
        abierto={modalFormulario}
        alCerrar={() => setModalFormulario(false)}
        titulo={rolEditando ? 'Editar Rol' : 'Nuevo Rol'}
        descripcion={
          rolEditando
            ? 'Puedes cambiar el nombre, la descripción y el estado. El código no se modifica.'
            : 'El código es solo un identificador. Después de crearlo, asigna sus permisos con el botón Permisos.'
        }
        tamano="mediano"
      >
        <div className="space-y-4">
          <div>
            <Entrada
              etiqueta="Código"
              value={formulario.codigo}
              onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
              onBlur={() => {
                if (!rolEditando) {
                  setFormulario((actual) => ({
                    ...actual,
                    codigo: normalizarCodigo(actual.codigo),
                  }));
                }
              }}
              placeholder="ej. estudiante"
              list="codigos-rol"
              disabled={!!rolEditando}
              textoAyuda={
                rolEditando
                  ? 'El código no se puede cambiar para no romper las asignaciones.'
                  : 'Se guardará en minúsculas, sin espacios ni acentos. Puedes usar el código que prefieras.'
              }
            />
            <datalist id="codigos-rol">
              {CODIGOS_SUGERIDOS.map(({ codigo, nombre }) => (
                <option key={codigo} value={codigo}>
                  {nombre}
                </option>
              ))}
            </datalist>
          </div>

          <Entrada
            etiqueta="Nombre"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            placeholder="ej. Estudiante"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <AreaTexto
              rows={3}
              value={formulario.descripcion}
              onChange={(e) =>
                setFormulario({ ...formulario, descripcion: e.target.value })
              }
              placeholder="Para qué sirve este rol (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              value={formulario.estado}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  estado: e.target.value as 'activo' | 'inactivo',
                })
              }
              disabled={rolEditando?.codigo === 'administrador'}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            {rolEditando?.codigo === 'administrador' && (
              <p className="mt-1 text-xs text-gray-500">
                El rol administrador siempre debe permanecer activo.
              </p>
            )}
          </div>

          {errorFormulario && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorFormulario}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Boton
              variante="contorno"
              onClick={() => setModalFormulario(false)}
              disabled={guardando}
            >
              Cancelar
            </Boton>
            <Boton onClick={guardar} cargando={guardando}>
              {rolEditando ? 'Guardar Cambios' : 'Crear Rol'}
            </Boton>
          </div>
        </div>
      </Modal>

      <ModalPermisos
        abierto={!!rolPermisos}
        rol={rolPermisos}
        alCerrar={() => setRolPermisos(null)}
        alGuardar={(texto) => setMensaje({ tipo: 'exito', texto })}
      />

      <ModalConfirmacion
        abierto={!!rolEliminando}
        alCerrar={() => setRolEliminando(null)}
        alConfirmar={confirmarEliminar}
        titulo="Eliminar Rol"
        mensaje={`¿Está seguro de eliminar el rol "${rolEliminando?.nombre}" (${rolEliminando?.codigo})? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={eliminando}
      />
    </div>
  );
}
