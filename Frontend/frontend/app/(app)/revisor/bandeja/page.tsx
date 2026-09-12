'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { TablaEvidencias } from '@/components/siac/tabla-evidencias'
import { EncabezadoPagina, PanelVacio } from '@/components/siac/tarjeta-acceso'

export default function BandejaRevisorPage() {
  return (
    <PlantillaPaginaApp titulo="Bandeja de revisión" rol="Revisor">
      <ContenidoBandeja />
    </PlantillaPaginaApp>
  )
}

function ContenidoBandeja() {
  const { datos } = usarAlmacen()
  const pendientes = useMemo(
    () =>
      datos.evidencias.filter(
        (evidencia) => evidencia.estado === 'Borrador' || evidencia.estado === 'EnRevision',
      ),
    [datos.evidencias],
  )

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        etiqueta="Flujo de aprobación"
        titulo="Bandeja de revisión"
        descripcion="Evidencias en borrador o en revisión pendientes de dictamen."
      />

      {pendientes.length === 0 ? (
        <PanelVacio mensaje="No hay evidencias pendientes de revisión." />
      ) : (
        <TablaEvidencias
          evidencias={pendientes}
          enlaceDetalle={(id) => `/revisor/bandeja/${id}`}
        />
      )}
    </div>
  )
}
