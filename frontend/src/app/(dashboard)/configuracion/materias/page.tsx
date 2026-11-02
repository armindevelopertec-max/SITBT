'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { ModalConfirmacion } from '@/componentes/iu/modal';
import { api } from '@/libreria/api';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface Materia {
  id: number;
  codigo: string;
  nombre: string;
}

export default function PaginaMaterias() {
  const router = useRouter();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [materiaEliminando, setMateriaEliminando] = useState<Materia | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerMaterias();
  }, []);

  const obtenerMaterias = async () => {
    try {
      const respuesta = await api.get('/materias/todos');
      setMaterias(respuesta.data || []);
    } catch (error) {
      console.error('Error al obtener las materias:', error);
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async () => {
    if (!materiaEliminando) return;
    setGuardando(true);
    try {
      await api.delete(`/materias/${materiaEliminando.id}`);
      setModalEliminarAbierto(false);
      setMateriaEliminando(null);
      obtenerMaterias();
    } catch (error: any) {
      console.error('Error al eliminar la materia:', error);
      import('@/libreria/utilidades').then(({ mensajeDeError }) => {
        alert(mensajeDeError(error, 'Error al eliminar la materia'));
      }).catch(() => {
        alert('Error al eliminar la materia');
      });
    } finally {
      setGuardando(false);
    }
  };

  const materiasFiltradas = materias.filter(materia =>
    materia.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
    materia.codigo.toLowerCase().includes(consultaBusqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Migas elementos={[{ etiqueta: 'Configuración', href: '/configuracion' }, { etiqueta: 'Materias' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Materias</h1>
        <Boton tamano="pequeno" onClick={() => router.push('/configuracion/materias/nuevo')}>
          <Plus className="w-3 h-3 mr-1" />
          Nueva
        </Boton>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Entrada
          placeholder="Buscar..."
          className="pl-7 h-8 text-sm"
          value={consultaBusqueda}
          onChange={(e) => setConsultaBusqueda(e.target.value)}
        />
      </div>

      {materiasFiltradas.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {consultaBusqueda ? 'Sin resultados' : 'Sin materias registradas'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {materiasFiltradas.map((materia) => (
            <div
              key={materia.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-muted/40 group"
            >
              <div className="flex-1 mr-2">
                <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">{materia.codigo}</p>
                <p className="text-sm font-medium break-words">{materia.nombre}</p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Boton variante="fantasma" tamano="icono" className="h-6 w-6" onClick={() => router.push(`/materias/${materia.id}`)}>
                  <Edit2 className="w-3 h-3" />
                </Boton>
                <Boton variante="fantasma" tamano="icono" className="h-6 w-6" onClick={() => { setMateriaEliminando(materia); setModalEliminarAbierto(true); }}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Boton>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        alCerrar={() => { setModalEliminarAbierto(false); setMateriaEliminando(null); }}
        alConfirmar={eliminar}
        titulo="Eliminar Materia"
        mensaje={`¿Eliminar "${materiaEliminando?.nombre}"?`}
        textoConfirmar="Eliminar"
        variante="destructivo"
        cargando={guardando}
      />
    </div>
  );
}
