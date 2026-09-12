export interface InformePowerBi {
  id: string
  titulo: string
  descripcion: string
  gradienteDesde: string
  gradienteHasta: string
  reportId?: string
}

export const informesPowerBiSemilla: InformePowerBi[] = [
  {
    id: 'condiciones-institucionales',
    titulo: 'Condiciones institucionales',
    descripcion: 'Indicadores de selección, estructura, SIAC y egresados.',
    gradienteDesde: '#0A3B74',
    gradienteHasta: '#1D70B8',
  },
  {
    id: 'condiciones-programa',
    titulo: 'Condiciones de programa',
    descripcion: 'Denominación, currículo, profesores y recursos académicos.',
    gradienteDesde: '#1CBCA6',
    gradienteHasta: '#0A3B74',
  },
  {
    id: 'autoevaluacion',
    titulo: 'Autoevaluación y renovación',
    descripcion: 'Informes, instrumentos y planes de mejoramiento.',
    gradienteDesde: '#904179',
    gradienteHasta: '#D82B5A',
  },
  {
    id: 'cumplimiento-programa',
    titulo: 'Cumplimiento por programa',
    descripcion: 'Avance y semáforo de acreditación por programa académico.',
    gradienteDesde: '#C28B10',
    gradienteHasta: '#F25C30',
  },
  {
    id: 'vision-institucional',
    titulo: 'Visión institucional',
    descripcion: 'Consolidado de cumplimiento y tendencias del ciclo vigente.',
    gradienteDesde: '#1D70B8',
    gradienteHasta: '#1CBCA6',
  },
  {
    id: 'alertas-vigencias',
    titulo: 'Alertas y vigencias',
    descripcion: 'Documentos próximos a vencer y estado de anexos normativos.',
    gradienteDesde: '#D82B5A',
    gradienteHasta: '#904179',
  },
]
