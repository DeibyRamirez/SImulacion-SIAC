import { peticionApi } from './cliente-api';
import type { Evidencia, EstadoEvidencia } from '@/lib/tipos';

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
}

export interface FiltrosEvidenciaApi {
  programaId?: string;
  periodo?: string;
  factor?: string;
  indicador?: string;
  estado?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export async function listarEvidenciasApi(filtros: FiltrosEvidenciaApi = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  return peticionApi<RespuestaPaginada<Evidencia>>(`/evidencias?${params}`);
}

export async function crearEvidenciaApi(
  datos: FormData,
): Promise<Evidencia> {
  return peticionApi<Evidencia>('/evidencias', {
    method: 'POST',
    body: datos,
  });
}

export async function actualizarEvidenciaApi(
  id: string,
  cambios: Partial<Evidencia>,
): Promise<Evidencia> {
  return peticionApi<Evidencia>(`/evidencias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });
}

export async function eliminarEvidenciaApi(id: string): Promise<void> {
  return peticionApi<void>(`/evidencias/${id}`, { method: 'DELETE' });
}

export async function dictaminarEvidenciaApi(
  id: string,
  estado: Extract<EstadoEvidencia, 'Validado' | 'Rechazado'>,
  observaciones?: string,
): Promise<Evidencia> {
  return peticionApi<Evidencia>(`/aprobacion/${id}/dictaminar`, {
    method: 'POST',
    body: JSON.stringify({ estado, observaciones }),
  });
}

export async function listarPendientesApi() {
  return peticionApi<RespuestaPaginada<Evidencia>>('/aprobacion/pendientes');
}
