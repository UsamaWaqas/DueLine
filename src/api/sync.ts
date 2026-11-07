import { apiRequest } from './client';

export type SyncPayload = Record<string, unknown>;

export function pullSync() {
  return apiRequest<{ payload: SyncPayload | null; updatedAt: string | null }>('/api/sync', { auth: true });
}

export function pushSync(payload: SyncPayload) {
  return apiRequest<{ payload: SyncPayload; updatedAt: string }>('/api/sync', {
    method: 'PUT',
    auth: true,
    body: { payload },
  });
}
