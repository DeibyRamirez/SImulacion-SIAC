import { peticionApi } from './cliente-api';
import type { Programa } from '@/lib/tipos';

export async function listarProgramasApi(): Promise<Programa[]> {
  return peticionApi<Programa[]>('/programas');
}

export async function buscarEvidenciasApi(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return peticionApi<{ resultados: unknown[]; total: number; pagina: number; limite: number }>(
    `/busqueda?${query}`,
  );
}

export async function listarVigenciasApi(programaId?: string) {
  const query = programaId ? `?programaId=${programaId}` : '';
  return peticionApi<unknown[]>(`/vigencias${query}`);
}

export async function listarNotificacionesApi() {
  return peticionApi<{ id: string; mensaje: string; leida: boolean; createdAt: string }[]>(
    '/notificaciones',
  );
}

export async function marcarNotificacionLeidaApi(id: string) {
  return peticionApi(`/notificaciones/${id}/leida`, { method: 'PATCH' });
}

export async function obtenerEmbedPowerBiApi() {
  return peticionApi<{
    embedUrl: string;
    embedToken: string | null;
    fallback: boolean;
    mensaje?: string;
  }>('/powerbi/embed-token');
}

export async function listarEstructuraApi() {
  return peticionApi<unknown[]>('/estructura/etapas');
}
