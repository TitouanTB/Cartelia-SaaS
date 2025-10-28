import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  isFormData?: boolean;
};

type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const buildUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }

  const trimmedBase = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;

  return `${trimmedBase}${trimmedPath}`;
};

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return {};

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};

export async function apiRequest<T = unknown>(options: RequestOptions): Promise<T> {
  const { method = 'GET', path, body, headers, signal, isFormData } = options;

  const authHeader = await getAuthHeader();
  const contentTypeHeader: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
  const finalHeaders: HeadersInit = {
    ...contentTypeHeader,
    ...authHeader,
    ...headers,
  };

  const response = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body: body
      ? isFormData
        ? (body as BodyInit)
        : JSON.stringify(body)
      : undefined,
    signal,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = response.statusText || 'Unknown error';
    let details: unknown;

    try {
      const data = await response.json();
      if (data && typeof data === 'object') {
        errorMessage = (data as { message?: string }).message ?? errorMessage;
        details = data;
      }
    } catch (error) {
      // ignore - non-json response
    }

    const error: ApiError = {
      status: response.status,
      message: errorMessage,
      details,
    };

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    return text as T;
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'path'>) =>
    apiRequest<T>({ path, method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'path' | 'body'>) =>
    apiRequest<T>({ path, method: 'POST', body, ...options }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'path' | 'body'>) =>
    apiRequest<T>({ path, method: 'PUT', body, ...options }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'path' | 'body'>) =>
    apiRequest<T>({ path, method: 'PATCH', body, ...options }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'path'>) =>
    apiRequest<T>({ path, method: 'DELETE', ...options }),
};
