'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { DialogoConfirmacion } from '@/components/siac/dialogo-confirmacion'
import { HistorialVersionesEvidencia } from '@/components/siac/historial-versiones-evidencia'
import { InsigniaEstado } from '@/components/siac/insignia-estado'
import { EncabezadoPagina } from '@/components/siac/tarjeta-acceso'
import { VisorDocumentoInline } from '@/components/siac/visor-documento-inline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { apiDisponible } from '@/lib/servicios/cliente-api'
import {
  dictaminarEvidenciaApi,
  obtenerEvidenciaApi,
  obtenerUrlDescargaApi,
} from '@/lib/servicios/evidencias.servicio'
import type { Evidencia } from '@/lib/tipos'
import { formatearFecha, obtenerNombrePrograma } from '@/lib/utilidades-siac'

export default function DictamenPage() {
  return (
    <PlantillaPaginaApp titulo="Dictamen de evidencia" rol="Revisor">
      <ContenidoDictamen />
    </PlantillaPaginaApp>
  )
}

function ContenidoDictamen() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { dictaminarEvidencia } = usarAlmacen()
  const [evidencia, setEvidencia] = useState<Evidencia | null>(null)
  const [urlDocumento, setUrlDocumento] = useState<string | undefined>()
  const [cargando, setCargando] = useState(true)
  const [observaciones, setObservaciones] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [confirmarAprobar, setConfirmarAprobar] = useState(false)
  const [confirmarRechazar, setConfirmarRechazar] = useState(false)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      try {
        if (apiDisponible()) {
          const ev = await obtenerEvidenciaApi(params.id)
          const descarga = await obtenerUrlDescargaApi(params.id).catch(() => null)
          setEvidencia({
            ...ev,
            fechaCarga:
              typeof ev.fechaCarga === 'string'
                ? ev.fechaCarga.slice(0, 10)
                : new Date().toISOString().slice(0, 10),
          })
          if (descarga?.url) setUrlDocumento(descarga.url)
        }
      } catch (err) {
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar la evidencia.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
    const intervalo = setInterval(cargar, 15000)
    return () => clearInterval(intervalo)
  }, [params.id])

  if (cargando) {
    return <p className="text-sm text-muted-foreground">Cargando evidencia…</p>
  }

  if (!evidencia) {
    return (
      <>
        <EncabezadoPagina
          etiqueta="Flujo de aprobación"
          titulo="Evidencia no encontrada"
          descripcion="La evidencia solicitada no existe o ya fue dictaminada."
        />
        <Link href="/revisor/bandeja">
          <Button variant="outline">Volver a la bandeja</Button>
        </Link>
      </>
    )
  }

  const puedeDictaminar = evidencia.estado === 'EnRevision'
  const extension = evidencia.nombreArchivo.split('.').pop()?.toLowerCase()
  const formato = extension === 'xlsx' ? 'XLSX' : 'PDF'
  const versionActual = evidencia.version ?? 1

  async function aprobar() {
    if (!puedeDictaminar) {
      setMensaje('Solo se puede dictaminar evidencias en estado En revisión.')
      return
    }
    setProcesando(true)
    try {
      if (apiDisponible()) {
        await dictaminarEvidenciaApi(evidencia!.id, 'Validado')
      }
      await dictaminarEvidencia(evidencia!.id, 'Validado')
      router.push('/revisor/bandeja')
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo aprobar la evidencia.')
    } finally {
      setProcesando(false)
      setConfirmarAprobar(false)
    }
  }

  async function rechazar() {
    if (!puedeDictaminar) {
      setMensaje('Solo se puede dictaminar evidencias en estado En revisión.')
      return
    }
    if (!observaciones.trim()) {
      setMensaje('Debes registrar observaciones para rechazar la evidencia.')
      return
    }
    setProcesando(true)
    try {
      if (apiDisponible()) {
        await dictaminarEvidenciaApi(evidencia!.id, 'Rechazado', observaciones.trim())
      }
      await dictaminarEvidencia(evidencia!.id, 'Rechazado', observaciones.trim())
      router.push('/revisor/bandeja')
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo rechazar la evidencia.')
    } finally {
      setProcesando(false)
      setConfirmarRechazar(false)
    }
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        etiqueta="Flujo de aprobación"
        titulo={evidencia.nombre}
        descripcion="Visualiza la evidencia y emite tu dictamen con observaciones si es necesario."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 pt-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Versión {versionActual}</Badge>
              <InsigniaEstado estado={evidencia.estado} />
            </div>
            <VisorDocumentoInline
              titulo={evidencia.nombreArchivo}
              urlDocumento={urlDocumento}
              formato={formato}
              claveCache={versionActual}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Programa</p>
                <p>{obtenerNombrePrograma(evidencia.programaId)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Periodo</p>
                <p>{evidencia.periodo}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Factor</p>
                <p>{evidencia.factor}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Indicador</p>
                <p>{evidencia.indicador}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Fecha de carga</p>
                <p>{formatearFecha(evidencia.fechaCarga)}</p>
              </div>
            </div>
            <HistorialVersionesEvidencia
              evidenciaId={evidencia.id}
              versionActiva={versionActual}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {!puedeDictaminar && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Esta evidencia no está en revisión. Estado actual: {evidencia.estado}.
              </p>
            )}
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Observaciones</span>
              <Textarea
                value={observaciones}
                onChange={(evento) => setObservaciones(evento.target.value)}
                placeholder="Registra observaciones si rechazas la evidencia."
                disabled={!puedeDictaminar}
              />
            </label>
            {mensaje && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{mensaje}</p>
            )}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setConfirmarAprobar(true)}
                disabled={!puedeDictaminar || procesando}
              >
                Aprobar evidencia
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!observaciones.trim()) {
                    setMensaje('Debes registrar observaciones para rechazar la evidencia.')
                    return
                  }
                  setConfirmarRechazar(true)
                }}
                disabled={!puedeDictaminar || procesando}
              >
                Rechazar con observaciones
              </Button>
              <Link href="/revisor/bandeja">
                <Button variant="outline" className="w-full">
                  Volver
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogoConfirmacion
        abierto={confirmarAprobar}
        titulo="¿Aprobar evidencia?"
        descripcion="La evidencia pasará a estado Validado y se notificará al cargador."
        etiquetaConfirmar="Sí, aprobar"
        cargando={procesando}
        onConfirmar={aprobar}
        onCancelar={() => setConfirmarAprobar(false)}
      />
      <DialogoConfirmacion
        abierto={confirmarRechazar}
        titulo="¿Rechazar evidencia?"
        descripcion="El cargador recibirá tus observaciones y podrá subir una versión corregida."
        etiquetaConfirmar="Sí, rechazar"
        variant="destructive"
        cargando={procesando}
        onConfirmar={rechazar}
        onCancelar={() => setConfirmarRechazar(false)}
      />
    </div>
  )
}
