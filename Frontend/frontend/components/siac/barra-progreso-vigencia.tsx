'use client'

import type { EstadoVigencia } from '@/lib/tipos'
import { cn } from '@/lib/utils'

interface BarraProgresoVigenciaProps {
  porcentaje: number
  estado: EstadoVigencia
  className?: string
}

const coloresEstado: Record<EstadoVigencia, string> = {
  Vigente: 'bg-emerald-500',
  Proximo: 'bg-amber-500',
  Vencido: 'bg-red-500',
}

export function BarraProgresoVigencia({ porcentaje, estado, className }: BarraProgresoVigenciaProps) {
  const valor = Math.min(100, Math.max(0, porcentaje))

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', coloresEstado[estado])}
          style={{ width: `${valor}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{valor}% del periodo de vigencia transcurrido</p>
    </div>
  )
}
