'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { BarraProgresoVigencia } from '@/components/siac/barra-progreso-vigencia'
import { InsigniaEstado } from '@/components/siac/insignia-estado'
import { EncabezadoPagina } from '@/components/siac/tarjeta-acceso'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiDisponible } from '@/lib/servicios/cliente-api'
import {
  crearVigenciaConArchivoApi,
  listarProgramasApi,
  listarVigenciasApi,
  obtenerUrlDescargaVigenciaApi,
} from '@/lib/servicios/programas.servicio'
import type { AnexoVigencia, Programa } from '@/lib/tipos'
import { formatearFecha, manejarCambioSelect, obtenerNombrePrograma } from '@/lib/utilidades-siac'

export default function VigenciasPage() {
  return (
    <PlantillaPaginaApp titulo="Vigencias y alertas" rol="Administrador">
      <ContenidoVigencias />
    </PlantillaPaginaApp>
  )
}

function ContenidoVigencias() {
  const searchParams = useSearchParams()
  const { datos, marcarAlertaLeida } = usarAlmacen()
  const [anexos, setAnexos] = useState<AnexoVigencia[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [formulario, setFormulario] = useState({
    titulo: '',
    programaId: '',
    tipo: 'Documento institucional',
    carpeta: 'permisos',
    aniosVigencia: '7',
    responsable: '',
  })

  const cargarAnexos = useCallback(async () => {
    if (!apiDisponible()) {
      setAnexos(datos.anexosVigencia)
      return
    }
    try {
      const programaId = searchParams.get('programaId') ?? undefined
      const lista = (await listarVigenciasApi(programaId)) as AnexoVigencia[]
      setAnexos(
        lista.map((a) => ({
          ...a,
          fechaVencimiento:
            typeof a.fechaVencimiento === 'string'
              ? a.fechaVencimiento.slice(0, 10)
              : a.fechaVencimiento,
          fechaCarga:
            typeof a.fechaCarga === 'string' ? a.fechaCarga.slice(0, 10) : a.fechaCarga,
        })),
      )
    } catch {
      setAnexos(datos.anexosVigencia)
    }
  }, [datos.anexosVigencia, searchParams])

  useEffect(() => {
    cargarAnexos()
    async function cargarProgramas() {
      if (!apiDisponible()) return
      try {
        const lista = await listarProgramasApi()
        setProgramas(lista)
        if (lista[0]) {
          setFormulario((prev) => ({
            ...prev,
            programaId: searchParams.get('programaId') ?? lista[0].id,
          }))
        }
      } catch {
        setProgramas([])
      }
    }
    cargarProgramas()
  }, [cargarAnexos, searchParams])

  async function guardarAnexo() {
    if (!formulario.titulo || !archivo || !formulario.responsable) {
      toast.error('Complete título, archivo y responsable.')
      return
    }
    setGuardando(true)
    try {
      const formData = new FormData()
      formData.append('titulo', formulario.titulo)
      formData.append('programaId', formulario.programaId)
      formData.append('tipo', formulario.tipo)
      formData.append('carpeta', formulario.carpeta)
      formData.append('aniosVigencia', formulario.aniosVigencia)
      formData.append('responsable', formulario.responsable)
      formData.append('archivo', archivo)

      if (apiDisponible()) {
        await crearVigenciaConArchivoApi(formData)
        await cargarAnexos()
        toast.success('Documento cargado en bucket Documentos.')
      } else {
        toast.error('API no disponible.')
      }
      setDialogoAbierto(false)
      setArchivo(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar el documento.')
    } finally {
      setGuardando(false)
    }
  }

  async function descargarAnexo(id: string) {
    try {
      const { url } = await obtenerUrlDescargaVigenciaApi(id)
      window.open(url, '_blank')
    } catch {
      toast.error('No se pudo obtener la URL de descarga.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <EncabezadoPagina
          etiqueta="Control de vigencias"
          titulo="Vigencias y alertas"
          descripcion="Documentos institucionales con vigencia calculada desde la fecha de carga (bucket Documentos)."
        />
        <Button onClick={() => setDialogoAbierto(true)}>
          <Plus className="size-4" />
          Cargar documento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(['Vigente', 'Proximo', 'Vencido'] as const).map((estado) => {
          const total = anexos.filter((anexo) => anexo.estado === estado).length
          return (
            <Card key={estado} className="border-l-4 border-esmeralda">
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{estado}</p>
                <p className="mt-2 text-3xl font-semibold text-primary">{total}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Control de vigencias</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Carpeta</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {anexos.map((anexo) => (
                  <TableRow key={anexo.id}>
                    <TableCell>
                      <p className="font-medium text-primary">{anexo.titulo}</p>
                      <p className="text-xs text-muted-foreground">{anexo.nombreArchivo ?? anexo.tipo}</p>
                    </TableCell>
                    <TableCell>{anexo.carpeta ?? 'general'}</TableCell>
                    <TableCell>{obtenerNombrePrograma(anexo.programaId)}</TableCell>
                    <TableCell>{formatearFecha(anexo.fechaVencimiento)}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <BarraProgresoVigencia
                        porcentaje={anexo.porcentajeTranscurrido ?? 0}
                        estado={anexo.estado}
                      />
                    </TableCell>
                    <TableCell>
                      <InsigniaEstado estado={anexo.estado} tipo="vigencia" />
                    </TableCell>
                    <TableCell>
                      {anexo.nombreArchivo && (
                        <Button variant="ghost" size="sm" onClick={() => descargarAnexo(anexo.id)}>
                          Ver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas in-app</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {datos.alertas.map((alerta) => (
              <button
                key={alerta.id}
                type="button"
                onClick={() => marcarAlertaLeida(alerta.id)}
                className={`w-full rounded-lg border p-4 text-left text-sm transition-colors ${
                  alerta.leida ? 'border-border opacity-60' : 'border-esmeralda/30 bg-accent/50'
                }`}
              >
                <p>{alerta.mensaje}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatearFecha(alerta.fecha)}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar documento con vigencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del documento</Label>
              <Input
                id="titulo"
                value={formulario.titulo}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                placeholder="Ej. Certificado de bomberos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carpeta">Carpeta interna</Label>
              <Input
                id="carpeta"
                value={formulario.carpeta}
                onChange={(e) => setFormulario({ ...formulario, carpeta: e.target.value })}
                placeholder="permisos, certificados-bomberos…"
              />
            </div>
            <div className="space-y-2">
              <Label>Programa (opcional institucional)</Label>
              <Select
                value={formulario.programaId}
                onValueChange={manejarCambioSelect((v) =>
                  setFormulario({ ...formulario, programaId: v }),
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anios">Años de vigencia</Label>
              <Input
                id="anios"
                type="number"
                min={1}
                max={30}
                value={formulario.aniosVigencia}
                onChange={(e) =>
                  setFormulario({ ...formulario, aniosVigencia: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={formulario.responsable}
                onChange={(e) => setFormulario({ ...formulario, responsable: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo PDF/DOCX</Label>
              <Input
                id="archivo"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarAnexo} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
