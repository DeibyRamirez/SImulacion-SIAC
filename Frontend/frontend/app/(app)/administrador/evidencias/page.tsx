'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { BarraHerramientasTabla } from '@/components/siac/barra-herramientas-tabla'
import { FiltrosSegmentados } from '@/components/siac/filtros-segmentados'
import { TablaEvidencias } from '@/components/siac/tabla-evidencias'
import { EncabezadoPagina, PanelVacio } from '@/components/siac/tarjeta-acceso'
import { Button } from '@/components/ui/button'
import type { EstadoEvidencia } from '@/lib/tipos'

const filtrosEstado = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'Borrador', etiqueta: 'Borrador' },
  { valor: 'EnRevision', etiqueta: 'En revisión' },
  { valor: 'Validado', etiqueta: 'Aprobados' },
  { valor: 'Rechazado', etiqueta: 'Corrección' },
]

export default function EvidenciasAdministradorPage() {
  return (
    <PlantillaPaginaApp titulo="Evidencias y documentos" rol="Administrador">
      <ContenidoEvidencias />
    </PlantillaPaginaApp>
  )
}

function ContenidoEvidencias() {
  const { datos, eliminarEvidencia } = usarAlmacen()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const evidenciasFiltradas = useMemo(() => {
    return datos.evidencias.filter((evidencia) => {
      const texto = `${evidencia.nombre} ${evidencia.factor} ${evidencia.periodo}`.toLowerCase()
      const coincideTexto = texto.includes(busqueda.toLowerCase())
      const coincideEstado =
        filtroEstado === 'todos' || evidencia.estado === (filtroEstado as EstadoEvidencia)
      return coincideTexto && coincideEstado
    })
  }, [datos.evidencias, busqueda, filtroEstado])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <EncabezadoPagina
          etiqueta="Gestión documental"
          titulo="Evidencias y documentos"
          descripcion="Consulta, organiza y valida los soportes del proceso de calidad."
        />
        <Link href="/cargador/evidencias/nueva">
          <Button>+ Cargar evidencia</Button>
        </Link>
      </div>

      <BarraHerramientasTabla
        placeholder="Buscar por nombre, programa o factor…"
        valorBusqueda={busqueda}
        onBuscar={setBusqueda}
        accionSecundaria={{ etiqueta: 'Filtrar', onClick: () => {} }}
      >
        <FiltrosSegmentados
          opciones={filtrosEstado}
          valorActivo={filtroEstado}
          onCambiar={setFiltroEstado}
        />
      </BarraHerramientasTabla>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{evidenciasFiltradas.length} documentos · Actualizado hace 5 minutos</span>
        <Button variant="outline" size="sm" onClick={() => toast.info('Exportación disponible en backend')}>
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      {evidenciasFiltradas.length === 0 ? (
        <PanelVacio mensaje="No hay evidencias que coincidan con los filtros." />
      ) : (
        <TablaEvidencias
          evidencias={evidenciasFiltradas}
          onEliminar={(id) => {
            eliminarEvidencia(id)
            toast.success('Evidencia eliminada del prototipo.')
          }}
        />
      )}
    </div>
  )
}
