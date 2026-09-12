import Link from 'next/link'
import { ArrowRight, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import type { Programa } from '@/lib/tipos'
import { obtenerInicialesPrograma } from '@/lib/utilidades-siac'

interface RejillaProgramasProps {
  programas: Programa[]
  enlaceEvidencias?: string
}

export function RejillaProgramas({ programas, enlaceEvidencias }: RejillaProgramasProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {programas.map((programa) => (
        <Card key={programa.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  {obtenerInicialesPrograma(programa.nombre)}
                </div>
                <div>
                  <p className="font-semibold text-primary">{programa.nombre}</p>
                  <p className="text-xs text-muted-foreground">Programa: {programa.codigo}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon" variant="ghost" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                  <DropdownMenuItem>Editar metadatos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avance acreditación</span>
                <span className="font-semibold text-esmeralda">{programa.porcentajeAvance}%</span>
              </div>
              <Progress value={programa.porcentajeAvance} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-esmeralda" />
                {programa.estadoProceso}
              </div>
              <Link
                href={enlaceEvidencias ?? `/administrador/evidencias?programa=${programa.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-esmeralda hover:underline"
              >
                Ver evidencias
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
