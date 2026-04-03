'use client';

export interface TrackedRequest {
  method: string;
  url: string;
  statusCode?: number;
  timestamp: string;
  durationMs?: number;
  body?: unknown;
  response?: unknown;
}

const MAX_ENTRIES = 20;
const trackedRequests: TrackedRequest[] = [];
const FETCH_TRACKER_FLAG = '__meryFetchTrackerInstalled__';

type GlobalWithTrackerFlag = typeof globalThis & {
  [FETCH_TRACKER_FLAG]?: boolean;
};

function truncate(data: unknown): unknown {
  if (data === undefined || data === null) return undefined;

  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    if (str.length > 500) return `${str.slice(0, 500)}...`;
    return data;
  } catch {
    return String(data);
  }
}

function pushEntry(entry: TrackedRequest): void {
  if (typeof window === 'undefined') return;
  trackedRequests.push(entry);
  if (trackedRequests.length > MAX_ENTRIES) {
    trackedRequests.shift();
  }
}

export function getRecentRequests(): TrackedRequest[] {
  if (typeof window === 'undefined') return [];
  return [...trackedRequests];
}

function normalizeTrackedUrl(rawUrl: string): string {
  if (typeof window === 'undefined') return rawUrl;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return rawUrl;
  }
}

function shouldTrackUrl(rawUrl: string): boolean {
  if (typeof window === 'undefined') return false;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
  const normalized = normalizeTrackedUrl(rawUrl);

  if (normalized.startsWith('/api')) return true;

  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    return rawUrl.startsWith(apiBase);
  }

  return normalized.startsWith(apiBase);
}

export function trackRequestSuccess(params: {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
}): void {
  pushEntry({
    method: params.method.toUpperCase(),
    url: params.url,
    statusCode: params.statusCode,
    timestamp: new Date().toISOString(),
    durationMs: params.durationMs,
  });
}

export function trackRequestError(params: {
  method: string;
  url: string;
  statusCode?: number;
  durationMs: number;
  body?: unknown;
  response?: unknown;
}): void {
  pushEntry({
    method: params.method.toUpperCase(),
    url: params.url,
    statusCode: params.statusCode,
    timestamp: new Date().toISOString(),
    durationMs: params.durationMs,
    body: truncate(params.body),
    response: truncate(params.response),
  });
}

export function installFetchTracker(): void {
  if (typeof window === 'undefined') return;

  const trackerWindow = window as GlobalWithTrackerFlag;
  if (trackerWindow[FETCH_TRACKER_FLAG]) return;
  trackerWindow[FETCH_TRACKER_FLAG] = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const startedAt = Date.now();
    const rawUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = (
      init?.method ||
      (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();
    const normalizedUrl = normalizeTrackedUrl(rawUrl);
    const shouldTrack = shouldTrackUrl(rawUrl);

    try {
      const response = await originalFetch(input, init);
      if (shouldTrack) {
        if (response.ok) {
          trackRequestSuccess({
            method,
            url: normalizedUrl,
            statusCode: response.status,
            durationMs: Date.now() - startedAt,
          });
        } else {
          let parsedResponse: unknown = undefined;
          try {
            const cloned = response.clone();
            const contentType = cloned.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              parsedResponse = await cloned.json();
            } else {
              parsedResponse = await cloned.text();
            }
          } catch {
            parsedResponse = response.statusText;
          }

          trackRequestError({
            method,
            url: normalizedUrl,
            statusCode: response.status,
            durationMs: Date.now() - startedAt,
            body: init?.body,
            response: parsedResponse,
          });
        }
      }
      return response;
    } catch (error) {
      if (shouldTrack) {
        trackRequestError({
          method,
          url: normalizedUrl,
          durationMs: Date.now() - startedAt,
          body: init?.body,
          response: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  };
}
