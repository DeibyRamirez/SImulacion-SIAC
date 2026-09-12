'use client'

import { useState } from 'react'

import { GuardiaSesion } from '@/components/auth/guardia-sesion'
import { BarraLateral } from '@/components/layout/barra-lateral'
import { BarraSuperior } from '@/components/layout/barra-superior'
import { PieInstitucional } from '@/components/layout/pie-institucional'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { RolUsuario } from '@/lib/tipos'

export function ShellAplicacion({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  return (
    <div className="fondo-app flex min-h-screen">
      <BarraLateral className="hidden md:flex" />
      <Sheet open={menuMovilAbierto} onOpenChange={setMenuMovilAbierto}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-xs">
          <BarraLateral
            className="flex h-full w-full border-0"
            alNavegar={() => setMenuMovilAbierto(false)}
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior titulo={titulo} onAbrirMenu={() => setMenuMovilAbierto(true)} />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        <PieInstitucional />
      </div>
    </div>
  )
}

export function PlantillaPaginaApp({
  titulo,
  rol,
  children,
}: {
  titulo: string
  rol: RolUsuario
  children: React.ReactNode
}) {
  return (
    <GuardiaSesion rolPermitido={rol}>
      <ShellAplicacion titulo={titulo}>{children}</ShellAplicacion>
    </GuardiaSesion>
  )
}
