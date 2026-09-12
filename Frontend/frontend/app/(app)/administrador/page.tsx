'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
} from 'lucide-react'

import { usarAlmacen } from '@/components/auth/proveedor-almacen'
import { usarSesion } from '@/components/auth/proveedor-sesion'
import { PlantillaPaginaApp } from '@/components/layout/shell-aplicacion'
import { EstructuraNormativaPanel } from '@/components/siac/estructura-normativa-panel'
import { GraficoDistribucion } from '@/components/siac/grafico-distribucion'
import { GraficoTendencia } from '@/components/siac/grafico-tendencia'
import { PanelAvanceEtapasSIAC } from '@/components/siac/panel-avance-etapas-siac'
import { TarjetaHeroAcreditacion } from '@/components/siac/tarjeta-hero-acreditacion'
import { TarjetaKpi } from '@/components/siac/tarjeta-kpi'
import { EncabezadoPagina } from '@/components/siac/tarjeta-acceso'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  distribucionEstadosSemilla,
  periodosSemilla,
  resumenInstitucionalSemilla,
  tendenciaMensualSemilla,
} from '@/lib/datos-semilla'
import { calcularAvanceEtapasSIAC } from '@/lib/utilidades/avance-etapas-siac'
import { contarEvidenciasPendientes, manejarCambioSelect, obtenerSaludo } from '@/lib/utilidades-siac'

export default function ResumenAdministradorPage() {
  return (
    <PlantillaPaginaApp titulo="Resumen general" rol="Administrador">
      <ContenidoResumen />
    </PlantillaPaginaApp>
  )
}

function ContenidoResumen() {
  const { sesion } = usarSesion()
  const { datos } = usarAlmacen()
  const [periodo, setPeriodo] = useState(periodosSemilla[0] ?? '2024-1')

  const validadas = useMemo(
    () => datos.evidencias.filter((e) => e.estado === 'Validado').length,
    [datos.evidencias],
  )
  const enProceso = useMemo(
    () => datos.evidencias.filter((e) => e.estado === 'Borrador' || e.estado === 'EnRevision').length,
    [datos.evidencias],
  )
  const porVencer = datos.anexosVigencia.filter((a) => a.estado === 'Proximo').length
  const pendientes = contarEvidenciasPendientes(datos.evidencias)

  const avanceEtapas = useMemo(
    () =>
      calcularAvanceEtapasSIAC({
        etapas: datos.etapas,
        carpetas: datos.carpetas,
        documentosRequeridos: datos.documentosRequeridos,
        evidencias: datos.evidencias,
      }),
    [datos.etapas, datos.carpetas, datos.documentosRequeridos, datos.evidencias],
  )

  const distribucion = useMemo(
    () => [
      { estado: 'Validadas', valor: validadas, clave: 'validadas' },
      {
        estado: 'En revisión',
        valor: datos.evidencias.filter((e) => e.estado === 'EnRevision').length,
        clave: 'revision',
      },
      {
        estado: 'Borrador',
        valor: datos.evidencias.filter((e) => e.estado === 'Borrador').length,
        clave: 'borrador',
      },
    ],
    [datos.evidencias, validadas],
  )

  const primerNombre = sesion?.nombre.split(' ')[0] ?? 'Administrador'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <EncabezadoPagina
          etiqueta="Panel institucional"
          titulo={`${obtenerSaludo()}, ${primerNombre}`}
          descripcion="Este es el estado general del aseguramiento de la calidad."
        />
        <Select value={periodo} onValueChange={manejarCambioSelect(setPeriodo)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            {periodosSemilla.map((p) => (
              <SelectItem key={p} value={p}>
                Periodo {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TarjetaHeroAcreditacion
        avance={avanceEtapas.avanceGlobal}
        evidenciasValidadas={validadas}
        evidenciasEnProceso={enProceso}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi
          titulo="Programas activos"
          valor={resumenInstitucionalSemilla.programasActivos}
          descripcion={`${resumenInstitucionalSemilla.pregrado} pregrado · ${resumenInstitucionalSemilla.posgrado} posgrado`}
          icono={GraduationCap}
          acento="cyan"
        />
        <TarjetaKpi
          titulo="Evidencias validadas"
          valor={validadas}
          tendencia={{ valor: '↑ 12% frente al ciclo anterior', positiva: true }}
          icono={CheckCircle2}
          acento="esmeralda"
        />
        <TarjetaKpi
          titulo="Documentos por vencer"
          valor={porVencer}
          descripcion="Requiere atención este mes"
          icono={AlertTriangle}
          acento="coral"
        />
        <TarjetaKpi
          titulo="Tareas pendientes"
          valor={String(pendientes).padStart(2, '0')}
          descripcion="En bandeja de revisión"
          icono={ClipboardList}
          acento="purpura"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GraficoTendencia datos={tendenciaMensualSemilla} />
        <GraficoDistribucion
          datos={distribucion.length > 0 ? distribucion : distribucionEstadosSemilla}
          totalEtiqueta="Total evidencias"
        />
      </div>

      <PanelAvanceEtapasSIAC resumen={avanceEtapas} />

      <EstructuraNormativaPanel />
    </div>
  )
}
