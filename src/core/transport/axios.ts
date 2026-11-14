import { ApiError, failure } from '../errors'
import { buildUrl } from '../url'
import type { HttpClient, HttpMethod, RequestSpec } from '../types'

/** Structural shape accepted by an Axios instance; no Axios package is needed to load root types. */
export interface AxiosCompatible {
  defaults: { baseURL?: string }
  request<T>(config: { url: string; method: HttpMethod; data?: unknown; headers?: Record<string, string>; signal?: AbortSignal; responseType?: 'blob' | 'text' }): Promise<{ data: T; status: number }>
}

export function createAxiosAdapter(instance: AxiosCompatible, cacheScope = instance.defaults.baseURL ?? 'default'): HttpClient {
  return {
    baseURL: instance.defaults.baseURL,
    cacheScope,
    async request<TResponse, TBody = unknown>(spec: RequestSpec<TBody>): Promise<TResponse> {
      const url = buildUrl(spec.url, { path: spec.path, query: spec.query })
      try {
        const response = await instance.request<TResponse>({ url, method: spec.method, data: spec.body, headers: spec.headers ? Object.fromEntries(new Headers(spec.headers).entries()) : undefined, signal: spec.signal, responseType: spec.responseType === 'blob' ? 'blob' : spec.responseType === 'text' ? 'text' : undefined })
        if (response.status < 200 || response.status >= 300) throw new ApiError({ message: messageFrom(response.data, response.status), status: response.status, data: response.data, method: spec.method, url })
        return (response.status === 204 || response.status === 205 || response.data === '' ? null : response.data) as TResponse
      } catch (error) {
        const response = typeof error === 'object' && error !== null && 'response' in error ? error.response : undefined
        if (isResponse(response)) throw new ApiError({ message: messageFrom(response.data, response.status), status: response.status, data: response.data, method: spec.method, url, cause: error })
        throw failure(error, spec.method, url)
      }
    },
  }
}
function isResponse(value: unknown): value is { status: number; data: unknown } {
  return typeof value === 'object' && value !== null && 'status' in value && typeof value.status === 'number' && 'data' in value
}
function messageFrom(data: unknown, status: number): string {
  return typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string' ? data.message : `HTTP ${status}`
}
