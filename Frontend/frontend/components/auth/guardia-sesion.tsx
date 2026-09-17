'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PantallaCargandoSiac } from '@/components/auth/pantalla-cargando-siac'
import { prefijoRol, rutaPermitidaSuperAdmin } from '@/lib/auth-mock'
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

    const esSuperAdmin = sesion.rol === 'SuperAdmin'

    if (esSuperAdmin) {
      if (!rutaPermitidaSuperAdmin(pathname)) {
        router.replace('/superadmin')
      }
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

  const accesoPermitido =
    sesion &&
    (sesion.rol === rolPermitido ||
      (sesion.rol === 'SuperAdmin' && rutaPermitidaSuperAdmin(pathname)))

  if (cargando || !accesoPermitido) {
    return <PantallaCargandoSiac />
  }

  return <>{children}</>
}
