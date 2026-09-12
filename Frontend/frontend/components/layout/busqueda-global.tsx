'use client'

import { useRouter } from 'next/navigation'
import { FileText, LayoutDashboard, Search } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const rutasBusqueda = [
  { href: '/administrador', etiqueta: 'Resumen general', grupo: 'Administrador' },
  { href: '/administrador/dashboard', etiqueta: 'Dashboard de métricas', grupo: 'Administrador' },
  { href: '/administrador/programas', etiqueta: 'Programas académicos', grupo: 'Administrador' },
  { href: '/administrador/evidencias', etiqueta: 'Evidencias y documentos', grupo: 'Administrador' },
  { href: '/administrador/vigencias', etiqueta: 'Vigencias y alertas', grupo: 'Administrador' },
  { href: '/administrador/plantillas', etiqueta: 'Biblioteca de plantillas', grupo: 'Administrador' },
  { href: '/administrador/bandeja-revision', etiqueta: 'Bandeja de revisión', grupo: 'Administrador' },
  { href: '/cargador', etiqueta: 'Inicio cargador', grupo: 'Cargador' },
  { href: '/cargador/evidencias/nueva', etiqueta: 'Cargar evidencia', grupo: 'Cargador' },
  { href: '/revisor/bandeja', etiqueta: 'Bandeja de revisión', grupo: 'Revisor' },
]

export function BusquedaGlobal({
  abierta,
  onCambiarAbierta,
}: {
  abierta: boolean
  onCambiarAbierta: (valor: boolean) => void
}) {
  const router = useRouter()

  return (
    <CommandDialog open={abierta} onOpenChange={onCambiarAbierta} title="Buscar en SIAC">
      <CommandInput placeholder="Buscar páginas, documentos o módulos…" />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Navegación rápida">
          {rutasBusqueda.map((ruta) => (
            <CommandItem
              key={ruta.href}
              onSelect={() => {
                router.push(ruta.href)
                onCambiarAbierta(false)
              }}
            >
              <LayoutDashboard className="size-4" />
              <span>{ruta.etiqueta}</span>
              <span className="ml-auto text-xs text-muted-foreground">{ruta.grupo}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Acciones">
          <CommandItem disabled>
            <Search className="size-4" />
            Búsqueda full-text disponible en backend
          </CommandItem>
          <CommandItem disabled>
            <FileText className="size-4" />
            Exportar resultados (próximamente)
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
