'use client'

import type { InformePowerBi } from '@/lib/informes-powerbi'

interface TarjetaInformePowerBiProps {
  informe: InformePowerBi
  onSeleccionar: (informe: InformePowerBi) => void
}

export function TarjetaInformePowerBi({ informe, onSeleccionar }: TarjetaInformePowerBiProps) {
  return (
    <button
      type="button"
      onClick={() => onSeleccionar(informe)}
      className="tarjeta-visual group w-full cursor-pointer text-left"
    >
      <div
        className="relative aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(135deg, ${informe.gradienteDesde} 0%, ${informe.gradienteHasta} 100%)`,
        }}
      >
        <div className="absolute inset-0 flex items-end p-5 opacity-90">
          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            Informe SIAC
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <h3 className="text-base font-bold text-primary">{informe.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{informe.descripcion}</p>
      </div>
    </button>
  )
}
