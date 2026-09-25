'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, FileText, Download } from 'lucide-react';

const certificatesData = [
  { id: 1, estudiante: 'Juan Perez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-01-20', estado: 'entregado' },
  { id: 2, estudiante: 'Maria Lopez', tipo: 'Certificado de Estudios', fechaEmision: '2024-03-15', estado: 'emitido' },
  { id: 3, estudiante: 'Carlos Mendez', tipo: 'Certificado de Graduación', fechaEmision: '2024-03-10', estado: 'pendiente' },
  { id: 4, estudiante: 'Ana Rodriguez', tipo: 'Certificado de Inscripción', fechaEmision: '2024-02-28', estado: 'entregado' },
];

const estadoColors: Record<string, 'exito' | 'advertencia' | 'secondary' | 'error'> = {
  entregado: 'exito',
  emitido: 'advertencia',
  pendiente: 'secondary',
  anulado: 'error',
};

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Certificados' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Certificados</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Certificado
        </Button>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Certificados</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar certificado..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha de Emisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificatesData.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.estudiante}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {cert.tipo}
                    </div>
                  </TableCell>
                  <TableCell>{cert.fechaEmision}</TableCell>
                  <TableCell>
                    <Badge variant={estadoColors[cert.estado]} className="capitalize">
                      {cert.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Descargar">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
