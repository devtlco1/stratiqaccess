import { HostingerApiError, type HostingerErrorBody } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

function getBaseUrl(): string {
  return process.env.HOSTINGER_MAIL_API_BASE_URL || "https://api.mail.hostinger.com";
}

function getToken(): string {
  const token = process.env.HOSTINGER_MAIL_API_TOKEN;
  if (!token) {
    throw new Error("HOSTINGER_MAIL_API_TOKEN is not configured.");
  }
  return token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exponential backoff with a fixed pseudo-jitter multiplier (no Math.random
// dependency — this file must stay usable from contexts, like tests, where
// non-determinism is undesirable). Attempt 0 -> ~300ms, attempt 1 -> ~600ms+,
// attempt 2 -> ~1200ms+.
function backoffDelayMs(attempt: number): number {
  const base = 300 * 2 ** attempt;
  const jitter = Math.floor(base * 0.2);
  return base + jitter;
}

// Never log the token or full Authorization header — this is the one
// function every Hostinger call funnels through, so it's the single place
// that matters for "no token logging."
function safeLogError(path: string, status: number, code: string) {
  console.error(`[hostinger] ${path} -> ${status} ${code}`);
}

export interface HostingerRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  // Set true for endpoints that return raw bytes (attachment download)
  // rather than the {data: ...} JSON envelope.
  raw?: boolean;
}

function buildUrl(path: string, query?: HostingerRequestOptions["query"]): string {
  const url = new URL(getBaseUrl() + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

interface RawResult {
  status: number;
  ok: boolean;
  json?: unknown;
  arrayBuffer?: ArrayBuffer;
}

async function performRequest(path: string, options: HostingerRequestOptions): Promise<RawResult> {
  const { method = "GET", body, query, timeoutMs = DEFAULT_TIMEOUT_MS, raw = false } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      Accept: raw ? "*/*" : "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (response.status === 204) {
    return { status: 204, ok: true };
  }
  if (raw && response.ok) {
    return { status: response.status, ok: true, arrayBuffer: await response.arrayBuffer() };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = undefined;
  }
  return { status: response.status, ok: response.ok, json };
}

async function requestWithRetry(path: string, options: HostingerRequestOptions): Promise<RawResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await performRequest(path, options);

      if (!result.ok) {
        const errorBody = (result.json as HostingerErrorBody | undefined) ?? {
          error: `HTTP ${result.status}`,
          code: "ERR_UNKNOWN",
        };
        safeLogError(path, result.status, errorBody.code);

        if (RETRYABLE_STATUSES.has(result.status) && attempt < MAX_RETRIES) {
          await sleep(backoffDelayMs(attempt));
          continue;
        }
        throw new HostingerApiError(result.status, errorBody);
      }

      return result;
    } catch (error) {
      if (error instanceof HostingerApiError) throw error;
      lastError = error;
      // Network error / timeout — retryable up to MAX_RETRIES.
      if (attempt < MAX_RETRIES) {
        await sleep(backoffDelayMs(attempt));
        continue;
      }
    }
  }

  safeLogError(path, 0, "ERR_NETWORK");
  throw lastError instanceof Error ? lastError : new Error(`Hostinger API request to ${path} failed after ${MAX_RETRIES + 1} attempts.`);
}

// Unwraps the standard {data: ...} envelope (or raw bytes when raw:true, or
// undefined for a 204). This is what nearly every client method uses.
export async function hostingerRequest<T>(path: string, options: HostingerRequestOptions = {}): Promise<T> {
  const result = await requestWithRetry(path, options);
  if (result.status === 204) return undefined as T;
  if (options.raw) return result.arrayBuffer as T;
  return (result.json as { data: T }).data;
}

// Same as hostingerRequest but also returns the {pagination: ...} envelope
// field, for list endpoints.
export async function hostingerRequestPaginated<T>(
  path: string,
  options: HostingerRequestOptions = {}
): Promise<{ data: T; pagination: { page: number; perPage: number; total: number; totalPages: number } }> {
  const result = await requestWithRetry(path, options);
  const body = result.json as { data: T; pagination: { page: number; perPage: number; total: number; totalPages: number } };
  return body;
}
