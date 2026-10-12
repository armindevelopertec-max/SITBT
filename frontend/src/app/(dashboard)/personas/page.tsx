'use client';

import { Migas } from '@/components/ui/migas';
import { Tarjeta, ContenidoTarjeta, EncabezadoTarjeta, TituloTarjeta } from '@/components/ui/tarjeta';
import { Boton } from '@/components/ui/boton';
import { Entrada } from '@/components/ui/entrada';
import { Tabla, CuerpoTabla, CeldaTabla, CeldaEncabezado, EncabezadoTabla, FilaTabla } from '@/components/ui/tabla';
import { Insignia } from '@/components/ui/insignia';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const personsData = [
  { id: 1, ci: '12345678', nombre: 'Juan', primerApellido: 'Perez', segundoApellido: 'Gomez', telefono: '76543210', email: 'juan.perez@email.com', genero: 'M' },
  { id: 2, ci: '87654321', nombre: 'Maria', primerApellido: 'Lopez', segundoApellido: 'Rodriguez', telefono: '71234567', email: 'maria.lopez@email.com', genero: 'F' },
  { id: 3, ci: '11223344', nombre: 'Carlos', primerApellido: 'Mendez', segundoApellido: 'Fernandez', telefono: '77889900', email: 'carlos.mendez@email.com', genero: 'M' },
];

export default function PersonsPage() {
  return (
    <div className="space-y-6">
      <Migas items={[{ label: 'Personas' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Personas</h1>
        <Boton>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Persona
        </Boton>
      </div>

      <Tarjeta variant="bordered">
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
                <CeldaEncabezado>Email</CeldaEncabezado>
                <CeldaEncabezado>Género</CeldaEncabezado>
                <CeldaEncabezado>Acciones</CeldaEncabezado>
              </FilaTabla>
            </EncabezadoTabla>
            <CuerpoTabla>
              {personsData.map((person) => (
                <FilaTabla key={person.id}>
                  <CeldaTabla className="font-medium">{person.ci}</CeldaTabla>
                  <CeldaTabla>{person.nombre}</CeldaTabla>
                  <CeldaTabla>{person.primerApellido} {person.segundoApellido}</CeldaTabla>
                  <CeldaTabla>{person.telefono}</CeldaTabla>
                  <CeldaTabla>{person.email}</CeldaTabla>
                  <CeldaTabla>
                    <Insignia variant={person.genero === 'M' ? 'primary' : 'secondary'}>
                      {person.genero === 'M' ? 'Masculino' : 'Femenino'}
                    </Insignia>
                  </CeldaTabla>
                  <CeldaTabla>
                    <div className="flex items-center gap-2">
                      <Boton variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Boton>
                      <Boton variant="ghost" size="icon">
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
