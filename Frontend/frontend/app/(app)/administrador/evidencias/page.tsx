'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { BarraHerramientasTabla } from '@/components/siac/barra-herramientas-tabla'
import { FiltroPrograma } from '@/components/siac/filtro-programa'
import { FiltrosSegmentados } from '@/components/siac/filtros-segmentados'
import { TablaEvidencias } from '@/components/siac/tabla-evidencias'
import { EncabezadoPagina, PanelVacio } from '@/components/siac/tarjeta-acceso'
import { Button } from '@/components/ui/button'
import { apiDisponible } from '@/lib/servicios/cliente-api'
import { listarEvidenciasApi } from '@/lib/servicios/evidencias.servicio'
import type { EstadoEvidencia, Evidencia } from '@/lib/tipos'

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
  const searchParams = useSearchParams()
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [programaId, setProgramaId] = useState(searchParams.get('programaId') ?? 'todos')
  const [cargando, setCargando] = useState(true)

  const cargarEvidencias = useCallback(async () => {
    setCargando(true)
    try {
      if (apiDisponible()) {
        const resp = await listarEvidenciasApi({
          limite: 100,
          programaId: programaId === 'todos' ? undefined : programaId,
          estado: filtroEstado === 'todos' ? undefined : filtroEstado,
          busqueda: busqueda || undefined,
        })
        setEvidencias(
          resp.datos.map((e) => ({
            ...e,
            fechaCarga:
              typeof e.fechaCarga === 'string'
                ? e.fechaCarga.slice(0, 10)
                : new Date().toISOString().slice(0, 10),
          })),
        )
      }
    } finally {
      setCargando(false)
    }
  }, [programaId, filtroEstado, busqueda])

  useEffect(() => {
    const timer = setTimeout(cargarEvidencias, 300)
    return () => clearTimeout(timer)
  }, [cargarEvidencias])

  const evidenciasFiltradas = useMemo(() => evidencias, [evidencias])

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        etiqueta="Gestión documental"
        titulo="Evidencias y documentos"
        descripcion="Consulta evidencias de acreditación por carrera. La carga corresponde al rol Cargador."
      />

      <BarraHerramientasTabla
        placeholder="Buscar por nombre, programa o factor…"
        valorBusqueda={busqueda}
        onBuscar={setBusqueda}
      >
        <FiltroPrograma valor={programaId} onCambiar={setProgramaId} />
        <FiltrosSegmentados
          opciones={filtrosEstado}
          valorActivo={filtroEstado}
          onCambiar={setFiltroEstado}
        />
      </BarraHerramientasTabla>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{evidenciasFiltradas.length} documentos desde API</span>
        <Button variant="outline" size="sm" onClick={() => toast.info('Exportación disponible en backend')}>
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      {cargando ? (
        <p className="text-sm text-muted-foreground">Cargando evidencias…</p>
      ) : evidenciasFiltradas.length === 0 ? (
        <PanelVacio mensaje="No hay evidencias que coincidan con los filtros." />
      ) : (
        <TablaEvidencias
          evidencias={evidenciasFiltradas}
          enlaceDetalle={(id) => `/administrador/evidencias/${id}`}
        />
      )}
    </div>
  )
}
