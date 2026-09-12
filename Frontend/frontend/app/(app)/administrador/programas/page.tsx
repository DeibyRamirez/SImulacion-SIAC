'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { BarraHerramientasTabla } from '@/components/siac/barra-herramientas-tabla'
import { RejillaProgramas } from '@/components/siac/rejilla-programas'
import { EncabezadoPagina } from '@/components/siac/tarjeta-acceso'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { programasSemilla } from '@/lib/datos-semilla'
import { manejarCambioSelect } from '@/lib/utilidades-siac'

export default function ProgramasAdministradorPage() {
  return (
    <PlantillaPaginaApp titulo="Programas académicos" rol="Administrador">
      <ContenidoProgramas />
    </PlantillaPaginaApp>
  )
}

function ContenidoProgramas() {
  const [busqueda, setBusqueda] = useState('')
  const [nivel, setNivel] = useState('todos')

  const programasFiltrados = useMemo(() => {
    return programasSemilla.filter((programa) => {
      const coincideTexto =
        programa.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        programa.codigo.toLowerCase().includes(busqueda.toLowerCase())
      const coincideNivel = nivel === 'todos' || programa.nivel === nivel
      return coincideTexto && coincideNivel
    })
  }, [busqueda, nivel])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <EncabezadoPagina
          etiqueta="Catálogo académico"
          titulo="Programas académicos"
          descripcion={`Monitorea el avance de los ${programasSemilla.length} programas en proceso de acreditación.`}
        />
        <Link href="/cargador/evidencias/nueva">
          <Button>
            <Plus className="size-4" />
            Nueva evidencia
          </Button>
        </Link>
      </div>

      <BarraHerramientasTabla
        placeholder="Buscar programa…"
        valorBusqueda={busqueda}
        onBuscar={setBusqueda}
        accionSecundaria={{ etiqueta: 'Más filtros', onClick: () => {} }}
      >
        <Select value={nivel} onValueChange={manejarCambioSelect(setNivel)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            <SelectItem value="Pregrado">Pregrado</SelectItem>
            <SelectItem value="Posgrado">Posgrado</SelectItem>
          </SelectContent>
        </Select>
      </BarraHerramientasTabla>

      <RejillaProgramas programas={programasFiltrados} />
    </div>
  )
}
