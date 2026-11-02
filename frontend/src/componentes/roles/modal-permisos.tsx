'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '@/componentes/iu/modal';
import { Boton } from '@/componentes/iu/boton';
import api from '@/libreria/api';
import { mensajeDeError } from '@/libreria/utilidades';
import { ModuloPermiso, RolSistema } from '@/tipos';

const ACCIONES = [
  { clave: 'leer', etiqueta: 'Leer' },
  { clave: 'crear', etiqueta: 'Crear' },
  { clave: 'actualizar', etiqueta: 'Actualizar' },
  { clave: 'eliminar', etiqueta: 'Eliminar' },
] as const;

interface PropsModalPermisos {
  abierto: boolean;
  rol: RolSistema | null;
  alCerrar: () => void;
  alGuardar: (mensaje: string) => void;
}

export function ModalPermisos({
  abierto,
  rol,
  alCerrar,
  alGuardar,
}: PropsModalPermisos) {
  const [catalogo, setCatalogo] = useState<ModuloPermiso[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esAdministrador = rol?.codigo === 'administrador';

  useEffect(() => {
    if (!abierto || !rol) {
      return;
    }

    let activo = true;
    setCargando(true);
    setError(null);

    Promise.all([
      api.get('/permisos/catalogo'),
      api.get(`/permisos/rol/${rol.id}`),
    ])
      .then(([respuestaCatalogo, respuestaRol]) => {
        if (!activo) return;

        setCatalogo(
          Array.isArray(respuestaCatalogo.data) ? respuestaCatalogo.data : [],
        );

        const claves = (Array.isArray(respuestaRol.data) ? respuestaRol.data : [])
          .map((permiso: any) => `${permiso.modulo}:${permiso.accion}`)
          .filter(Boolean);

        setSeleccionados(new Set(claves));
      })
      .catch((err) => {
        if (!activo) return;
        setError(mensajeDeError(err, 'No se pudieron cargar los permisos'));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [abierto, rol]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, ModuloPermiso[]>();

    catalogo.forEach((modulo) => {
      const grupo = modulo.grupo || 'General';
      if (!mapa.has(grupo)) {
        mapa.set(grupo, []);
      }
      mapa.get(grupo)!.push(modulo);
    });

    return Array.from(mapa.entries());
  }, [catalogo]);

  const alternar = (modulo: string, accion: string) => {
    setSeleccionados((actual) => {
      const siguiente = new Set(actual);
      const clave = `${modulo}:${accion}`;

      if (siguiente.has(clave)) {
        siguiente.delete(clave);
      } else {
        siguiente.add(clave);
      }

      return siguiente;
    });
  };

  const alternarModulo = (modulo: ModuloPermiso, marcar: boolean) => {
    setSeleccionados((actual) => {
      const siguiente = new Set(actual);

      modulo.acciones.forEach((accion) => {
        const clave = `${modulo.modulo}:${accion}`;

        if (marcar) {
          siguiente.add(clave);
        } else {
          siguiente.delete(clave);
        }
      });

      return siguiente;
    });
  };

  const seleccionarTodo = () => {
    const todos = new Set<string>();

    catalogo.forEach((modulo) => {
      modulo.acciones.forEach((accion) => {
        todos.add(`${modulo.modulo}:${accion}`);
      });
    });

    setSeleccionados(todos);
  };

  const guardar = async () => {
    if (!rol || esAdministrador) {
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const permisos = Array.from(seleccionados).map((clave) => {
        const [modulo, accion] = clave.split(':');
        return { modulo, accion };
      });

      await api.put(`/permisos/rol/${rol.id}`, { permisos });
      alGuardar(`Permisos de "${rol.nombre}" actualizados correctamente`);
      alCerrar();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron guardar los permisos'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={rol ? `Permisos de ${rol.nombre}` : 'Permisos del rol'}
      descripcion="Marca las acciones que este rol puede realizar en cada módulo. El menú lateral se arma con el permiso de lectura."
      tamano="extragrande"
    >
      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : esAdministrador ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            El rol <strong>administrador</strong> tiene acceso total al sistema.
            No es necesario asignarle permisos.
          </div>
          <div className="flex justify-end">
            <Boton variante="contorno" onClick={alCerrar}>
              Cerrar
            </Boton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {seleccionados.size} permiso
              {seleccionados.size === 1 ? '' : 's'} seleccionado
              {seleccionados.size === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <Boton
                variante="contorno"
                tamano="pequeno"
                onClick={() => setSeleccionados(new Set())}
                disabled={guardando}
              >
                Limpiar
              </Boton>
              <Boton
                variante="contorno"
                tamano="pequeno"
                onClick={seleccionarTodo}
                disabled={guardando}
              >
                Seleccionar todo
              </Boton>
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto scrollarea-tema rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Módulo
                  </th>
                  {ACCIONES.map((accion) => (
                    <th
                      key={accion.clave}
                      className="px-2 py-2 text-center font-medium text-muted-foreground"
                    >
                      {accion.etiqueta}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupos.map(([grupo, modulos]) => (
                  <Fragment key={grupo}>
                    <tr className="bg-muted/40 dark:bg-muted/20">
                      <td
                        colSpan={ACCIONES.length + 1}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {grupo}
                      </td>
                    </tr>
                    {modulos.map((modulo) => {
                      const seleccionadosModulo = modulo.acciones.filter(
                        (accion) =>
                          seleccionados.has(`${modulo.modulo}:${accion}`),
                      ).length;
                      const todosSeleccionados =
                        modulo.acciones.length > 0 &&
                        seleccionadosModulo === modulo.acciones.length;

                      return (
                        <tr key={modulo.modulo} className="border-t border-border">
                          <td className="px-4 py-2">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={todosSeleccionados}
                                onChange={(e) =>
                                  alternarModulo(modulo, e.target.checked)
                                }
                                disabled={guardando}
                                title="Marcar o desmarcar todas las acciones del módulo"
                              />
                              <div>
                                <p className="font-medium text-foreground">
                                  {modulo.nombre}
                                </p>
                                {modulo.descripcion && (
                                  <p className="text-xs text-muted-foreground">
                                    {modulo.descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {ACCIONES.map((accion) => {
                            const permitida = modulo.acciones.includes(
                              accion.clave,
                            );
                            const clave = `${modulo.modulo}:${accion.clave}`;

                            return (
                              <td
                                key={clave}
                                className="px-2 py-2 text-center align-middle"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-30"
                                  checked={seleccionados.has(clave)}
                                  onChange={() =>
                                    alternar(modulo.modulo, accion.clave)
                                  }
                                  disabled={!permitida || guardando}
                                  title={
                                    permitida
                                      ? `${accion.etiqueta} ${modulo.nombre}`
                                      : 'Esta acción no aplica al módulo'
                                  }
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Boton variante="contorno" onClick={alCerrar} disabled={guardando}>
              Cancelar
            </Boton>
            <Boton onClick={guardar} cargando={guardando}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Guardar Permisos
            </Boton>
          </div>
        </div>
      )}
    </Modal>
  );
}
