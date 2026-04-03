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
