'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

import { prefijoRol } from '@/lib/auth-mock'
import type { RolUsuario } from '@/lib/tipos'
import { usarSesion } from '@/components/auth/proveedor-sesion'

export function GuardiaSesion({
  rolPermitido,
  children,
}: {
  rolPermitido: RolUsuario
  children: React.ReactNode
}) {
  const { sesion, cargando } = usarSesion()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (cargando) {
      return
    }

    if (!sesion) {
      router.replace('/login')
      return
    }

    if (sesion.rol !== rolPermitido) {
      router.replace(prefijoRol(sesion.rol))
      return
    }

    const prefijoEsperado = prefijoRol(rolPermitido)
    if (!pathname.startsWith(prefijoEsperado)) {
      router.replace(prefijoEsperado)
    }
  }, [cargando, sesion, router, pathname, rolPermitido])

  if (cargando || !sesion || sesion.rol !== rolPermitido) {
    return (
      <div className="fondo-app flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ShieldCheck className="size-7 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-primary">Cargando sesión SIAC…</p>
      </div>
    )
  }

  return <>{children}</>
}
