'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
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
import { programasSemilla } from '@/lib/datos-semilla'
import type { EstadoVigencia } from '@/lib/tipos'
import { formatearFecha, manejarCambioSelect, obtenerNombrePrograma } from '@/lib/utilidades-siac'

export default function VigenciasPage() {
  return (
    <PlantillaPaginaApp titulo="Vigencias y alertas" rol="Administrador">
      <ContenidoVigencias />
    </PlantillaPaginaApp>
  )
}

function ContenidoVigencias() {
  const { datos, crearAnexoVigencia, eliminarAnexoVigencia, marcarAlertaLeida } = usarAlmacen()
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [formulario, setFormulario] = useState({
    titulo: '',
    programaId: programasSemilla[0]?.id ?? '',
    tipo: 'Anexo legal',
    fechaVencimiento: '',
    estado: 'Vigente' as EstadoVigencia,
    responsable: '',
  })

  const guardarAnexo = () => {
    if (!formulario.titulo || !formulario.fechaVencimiento) {
      toast.error('Complete título y fecha de vencimiento.')
      return
    }
    crearAnexoVigencia(formulario)
    toast.success('Anexo registrado en el prototipo.')
    setDialogoAbierto(false)
    setFormulario({
      titulo: '',
      programaId: programasSemilla[0]?.id ?? '',
      tipo: 'Anexo legal',
      fechaVencimiento: '',
      estado: 'Vigente',
      responsable: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <EncabezadoPagina
          etiqueta="Control de vigencias"
          titulo="Vigencias y alertas"
          descripcion="Consulta anexos críticos y alertas in-app generadas por vencimientos próximos o vencidos."
        />
        <Button onClick={() => setDialogoAbierto(true)}>
          <Plus className="size-4" />
          Nuevo anexo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(['Vigente', 'Proximo', 'Vencido'] as const).map((estado) => {
          const total = datos.anexosVigencia.filter((anexo) => anexo.estado === estado).length
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
                  <TableHead>Programa</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.anexosVigencia.map((anexo) => (
                  <TableRow key={anexo.id}>
                    <TableCell>
                      <p className="font-medium text-primary">{anexo.titulo}</p>
                      <p className="text-xs text-muted-foreground">{anexo.tipo}</p>
                    </TableCell>
                    <TableCell>{obtenerNombrePrograma(anexo.programaId)}</TableCell>
                    <TableCell>{formatearFecha(anexo.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <InsigniaEstado estado={anexo.estado} tipo="vigencia" />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          eliminarAnexoVigencia(anexo.id)
                          toast.success('Anexo eliminado.')
                        }}
                      >
                        Eliminar
                      </Button>
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
            <DialogTitle>Registrar anexo de vigencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del documento</Label>
              <Input
                id="titulo"
                value={formulario.titulo}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Programa</Label>
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
                  {programasSemilla.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimiento">Fecha de vencimiento</Label>
              <Input
                id="vencimiento"
                type="date"
                value={formulario.fechaVencimiento}
                onChange={(e) =>
                  setFormulario({ ...formulario, fechaVencimiento: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formulario.estado}
                onValueChange={(v) =>
                  setFormulario({ ...formulario, estado: v as EstadoVigencia })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vigente">Vigente</SelectItem>
                  <SelectItem value="Proximo">Próximo a vencer</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarAnexo}>Guardar anexo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
