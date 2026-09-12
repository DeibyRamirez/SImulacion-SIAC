'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  Files,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { usarSesion } from '@/components/auth/proveedor-sesion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prefijoRol } from '@/lib/auth-mock'
import type { RolUsuario } from '@/lib/tipos'
import { contarEvidenciasPendientes } from '@/lib/utilidades-siac'
import { cn } from '@/lib/utils'

interface ItemNavegacion {
  href: string
  etiqueta: string
  icono: LucideIcon
  mostrarBadge?: boolean
}

function itemsPorRol(rol: RolUsuario): ItemNavegacion[] {
  switch (rol) {
    case 'Cargador':
      return [
        { href: '/cargador', etiqueta: 'Resumen general', icono: LayoutDashboard },
        { href: '/cargador/evidencias/nueva', etiqueta: 'Cargar evidencia', icono: Files },
        { href: '/cargador/evidencias', etiqueta: 'Mis evidencias', icono: ClipboardCheck },
        { href: '/cargador/plantillas', etiqueta: 'Biblioteca de plantillas', icono: FileCheck2 },
      ]
    case 'Revisor':
      return [
        { href: '/revisor', etiqueta: 'Resumen general', icono: LayoutDashboard },
        { href: '/revisor/bandeja', etiqueta: 'Bandeja de revisión', icono: FileCheck2, mostrarBadge: true },
      ]
    case 'Administrador':
      return [
        { href: '/administrador', etiqueta: 'Resumen general', icono: LayoutDashboard },
        { href: '/administrador/dashboard', etiqueta: 'Dashboard de métricas', icono: ShieldCheck },
        { href: '/administrador/programas', etiqueta: 'Programas académicos', icono: BookOpen },
        { href: '/administrador/evidencias', etiqueta: 'Evidencias y documentos', icono: Files },
        { href: '/administrador/vigencias', etiqueta: 'Vigencias y alertas', icono: Bell },
        { href: '/administrador/plantillas', etiqueta: 'Biblioteca de plantillas', icono: FileCheck2 },
        {
          href: '/administrador/bandeja-revision',
          etiqueta: 'Bandeja de revisión',
          icono: ClipboardCheck,
          mostrarBadge: true,
        },
      ]
  }
}

export function BarraLateral({
  className,
  alNavegar,
}: {
  className?: string
  alNavegar?: () => void
}) {
  const pathname = usePathname()
  const { sesion, cerrarSesion, etiquetaRolActual } = usarSesion()
  const { datos } = usarAlmacen()

  if (!sesion) {
    return null
  }

  const items = itemsPorRol(sesion.rol)
  const pendientes = contarEvidenciasPendientes(datos.evidencias)
  const iniciales = sesion.nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={cn(
        'panel-sidebar flex w-64 shrink-0 flex-col border-r border-primary/20 shadow-lg',
        className,
      )}
    >
      <div className="px-4 pt-5 pb-4 text-primary-foreground">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-[0.12em] text-white uppercase">SIAC</p>
            <p className="text-[10px] text-white/75">Calidad académica CUAC</p>
          </div>
        </div>
      </div>

      <div className="mx-3 -mt-1 mb-3 rounded-xl border border-primary/10 bg-white px-3 py-2.5 shadow-sm">
        <p className="etiqueta-seccion text-[10px]">Institución</p>
        <p className="mt-1 text-xs leading-snug font-semibold text-primary">
          Corporación Universitaria Autónoma del Cauca
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto bg-white px-3 py-3">
        <p className="etiqueta-seccion px-3 pb-2 text-[10px]">Gestión de calidad</p>
        {items.map(({ href, etiqueta, icono: Icono, mostrarBadge }) => {
          const activo =
            pathname === href ||
            (href !== prefijoRol(sesion.rol) && pathname.startsWith(`${href}/`))
          return (
            <Link
              key={href}
              href={href}
              onClick={alNavegar}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                activo
                  ? 'border-l-[3px] border-esmeralda bg-accent font-bold text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary',
              )}
            >
              <Icono className={cn('size-4 shrink-0', activo && 'text-esmeralda')} />
              <span className="flex-1 truncate">{etiqueta}</span>
              {mostrarBadge && pendientes > 0 && (
                <Badge variant="coral" className="size-5 justify-center rounded-full p-0 text-[10px]">
                  {pendientes}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-primary/10 bg-white px-3 py-4">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <HelpCircle className="size-4" />
          Centro de ayuda
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Settings className="size-4" />
          Configuración
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-accent/60 px-2 py-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {iniciales}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">{sesion.nombre}</p>
            <p className="truncate text-xs text-esmeralda">{etiquetaRolActual}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full border-primary/20 text-primary" onClick={cerrarSesion}>
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">SIAC v1.0 · CUAC</p>
      </div>
    </aside>
  )
}
