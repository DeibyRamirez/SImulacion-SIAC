'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { usarSesion } from '@/components/auth/proveedor-sesion'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { TablaEvidencias } from '@/components/siac/tabla-evidencias'
import { EncabezadoPagina, PanelVacio } from '@/components/siac/tarjeta-acceso'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MisEvidenciasPage() {
  return (
    <PlantillaPaginaApp titulo="Mis evidencias" rol="Cargador">
      <ContenidoMisEvidencias />
    </PlantillaPaginaApp>
  )
}

function ContenidoMisEvidencias() {
  const { sesion } = usarSesion()
  const { datos, actualizarEvidencia, eliminarEvidencia } = usarAlmacen()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')

  const misEvidencias = useMemo(
    () => datos.evidencias.filter((evidencia) => evidencia.autorId === sesion?.usuarioId),
    [datos.evidencias, sesion?.usuarioId],
  )

  function guardarEdicion(id: string) {
    actualizarEvidencia(id, { nombre: nombreEditado.trim() })
    setEditandoId(null)
    toast.success('Evidencia actualizada.')
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        etiqueta="Gestión documental"
        titulo="Mis evidencias"
        descripcion="Listado de tus documentos. Solo puedes editar o eliminar borradores propios."
        accion={
          <Link href="/cargador/evidencias/nueva">
            <Button>Cargar evidencia</Button>
          </Link>
        }
      />

      {editandoId && (
        <div className="flex gap-2 rounded-xl border border-primary/15 bg-white p-4 shadow-sm">
          <Input
            value={nombreEditado}
            onChange={(e) => setNombreEditado(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => guardarEdicion(editandoId)}>Guardar</Button>
          <Button variant="outline" onClick={() => setEditandoId(null)}>
            Cancelar
          </Button>
        </div>
      )}

      {misEvidencias.length === 0 ? (
        <PanelVacio mensaje="Aún no has registrado evidencias." />
      ) : (
        <TablaEvidencias
          evidencias={misEvidencias}
          onEliminar={(id) => {
            const ev = misEvidencias.find((e) => e.id === id)
            if (ev?.estado === 'Borrador') {
              eliminarEvidencia(id)
              toast.success('Evidencia eliminada.')
            } else {
              toast.error('Solo se pueden eliminar borradores.')
            }
          }}
        />
      )}
    </div>
  )
}
