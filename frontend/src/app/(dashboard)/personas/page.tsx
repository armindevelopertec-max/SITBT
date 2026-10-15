'use client';

import { Migas } from '@/componentes/iu/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/componentes/iu/tarjeta';
import { Boton } from '@/componentes/iu/boton';
import { Entrada } from '@/componentes/iu/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/componentes/iu/tabla';
import { Insignia } from '@/componentes/iu/insignia';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const datosPersonas = [
  { id: 1, ci: '12345678', nombre: 'Juan', primerApellido: 'Perez', segundoApellido: 'Gomez', telefono: '76543210', correo: 'juan.perez@email.com', genero: 'M' },
  { id: 2, ci: '87654321', nombre: 'Maria', primerApellido: 'Lopez', segundoApellido: 'Rodriguez', telefono: '71234567', correo: 'maria.lopez@email.com', genero: 'F' },
  { id: 3, ci: '11223344', nombre: 'Carlos', primerApellido: 'Mendez', segundoApellido: 'Fernandez', telefono: '77889900', correo: 'carlos.mendez@email.com', genero: 'M' },
];

export default function PaginaPersonas() {
  return (
    <div className="space-y-6">
      <Migas elementos={[{ etiqueta: 'Personas' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personas</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Persona
        </Boton>
      </div>

      <Tarjeta variante="conBorde">
        <EncabezadoTarjeta>
          <div className="flex items-center justify-between">
            <TituloTarjeta>Lista de Personas</TituloTarjeta>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Entrada placeholder="Buscar persona..." className="pl-10" />
            </div>
          </div>
        </EncabezadoTarjeta>
        <ContenidoTarjeta>
          <Tabla>
            <EncabezadoTabla>
              <FilaTabla>
                <CeldaEncabezado>CI</CeldaEncabezado>
                <CeldaEncabezado>Nombre</CeldaEncabezado>
                <CeldaEncabezado>Apellidos</CeldaEncabezado>
                <CeldaEncabezado>Teléfono</CeldaEncabezado>
                <CeldaEncabezado>Correo</CeldaEncabezado>
                <CeldaEncabezado>Género</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {datosPersonas.map((persona) => (
                <FilaTabla key={persona.id}>
                  <CeldaTabla className="font-medium">{persona.ci}</CeldaTabla>
                  <CeldaTabla>{persona.nombre}</CeldaTabla>
                  <CeldaTabla>{persona.primerApellido} {persona.segundoApellido}</CeldaTabla>
                  <CeldaTabla>{persona.telefono}</CeldaTabla>
                  <CeldaTabla>{persona.correo}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variante={persona.genero === 'M' ? 'primario' : 'secundario'}>
                      {persona.genero === 'M' ? 'Masculino' : 'Femenino'}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variante="fantasma" tamano="icono">
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variante="fantasma" tamano="icono">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Boton>
                    </div>
                  </CeldaTabla>
                </FilaTabla>
              ))}
            </CuerpoTabla>
          </Tabla>
        </ContenidoTarjeta>
      </Tarjeta>
    </div>
  );
}
