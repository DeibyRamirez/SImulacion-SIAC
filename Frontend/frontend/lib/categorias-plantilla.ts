import type { CategoriaPlantilla } from '@/lib/tipos'

export type SlugCategoriaPlantilla = 'institucional' | 'programa' | 'autoevaluacion'

export interface MetaCategoriaPlantilla {
  slug: SlugCategoriaPlantilla
  categoria: CategoriaPlantilla
  titulo: string
  descripcion: string
  gradienteDesde: string
  gradienteHasta: string
}

export const categoriasPlantilla: MetaCategoriaPlantilla[] = [
  {
    slug: 'institucional',
    categoria: 'Institucional',
    titulo: 'Condiciones institucionales',
    descripcion: 'Selección, estructura, SIAC, egresados y condiciones transversales.',
    gradienteDesde: '#0A3B74',
    gradienteHasta: '#1D70B8',
  },
  {
    slug: 'programa',
    categoria: 'Programa',
    titulo: 'Condiciones de programa',
    descripcion: 'Denominación, currículo, profesores, recursos y resultados.',
    gradienteDesde: '#1CBCA6',
    gradienteHasta: '#0A3B74',
  },
  {
    slug: 'autoevaluacion',
    categoria: 'Autoevaluacion',
    titulo: 'Autoevaluación y renovación',
    descripcion: 'Informes, instrumentos, matrices de evidencias y planes de mejoramiento.',
    gradienteDesde: '#904179',
    gradienteHasta: '#D82B5A',
  },
]

export function slugDesdeCategoria(categoria: CategoriaPlantilla): SlugCategoriaPlantilla {
  const mapa: Record<CategoriaPlantilla, SlugCategoriaPlantilla> = {
    Institucional: 'institucional',
    Programa: 'programa',
    Autoevaluacion: 'autoevaluacion',
  }
  return mapa[categoria]
}

export function categoriaDesdeSlug(slug: string): MetaCategoriaPlantilla | undefined {
  return categoriasPlantilla.find((item) => item.slug === slug)
}

export function rutaPlantillasPorRol(rol: 'Administrador' | 'Cargador'): string {
  return rol === 'Administrador' ? '/administrador/plantillas' : '/cargador/plantillas'
}
