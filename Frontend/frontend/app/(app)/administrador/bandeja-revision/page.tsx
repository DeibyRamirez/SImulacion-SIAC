'use client'

import { useMemo, useState } from 'react'
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
  { valor: 'EnRevision', etiqueta: 'Pendientes' },
  { valor: 'Validado', etiqueta: 'Aprobados' },
  { valor: 'Rechazado', etiqueta: 'Corrección' },
]

export default function BandejaRevisionAdminPage() {
  return (
    <PlantillaPaginaApp titulo="Bandeja de revisión" rol="Administrador">
      <ContenidoBandeja />
    </PlantillaPaginaApp>
  )
}

function ContenidoBandeja() {
  const { datos, dictaminarEvidencia } = usarAlmacen()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const evidenciasFiltradas = useMemo(() => {
    return datos.evidencias.filter((evidencia) => {
      const texto = `${evidencia.nombre} ${evidencia.factor}`.toLowerCase()
      const coincideTexto = texto.includes(busqueda.toLowerCase())
      const coincideEstado =
        filtroEstado === 'todos' || evidencia.estado === (filtroEstado as EstadoEvidencia)
      return coincideTexto && coincideEstado
    })
  }, [datos.evidencias, busqueda, filtroEstado])

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        etiqueta="Flujo de aprobación"
        titulo="Bandeja de revisión"
        descripcion="Revisa y gestiona las evidencias asignadas al proceso de calidad."
      />

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
        <span>{evidenciasFiltradas.length} documentos</span>
        <Button variant="outline" size="sm" onClick={() => toast.info('Exportación en backend')}>
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      {evidenciasFiltradas.length === 0 ? (
        <PanelVacio mensaje="No hay evidencias en la bandeja con los filtros actuales." />
      ) : (
        <TablaEvidencias
          evidencias={evidenciasFiltradas}
          mostrarAccionesRapidas
          onAprobar={(id) => {
            dictaminarEvidencia(id, 'Validado')
            toast.success('Evidencia aprobada.')
          }}
          onRechazar={(id) => {
            dictaminarEvidencia(id, 'Rechazado', 'Requiere corrección según revisión administrativa.')
            toast.warning('Evidencia devuelta para corrección.')
          }}
          enlaceDetalle={(id) => `/revisor/bandeja/${id}`}
        />
      )}
    </div>
  )
}
