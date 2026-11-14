import { ApiError, failure } from '../errors'
import type { HttpClientOptions, RequestSpec } from '../types'

async function parse(response: Response, type: RequestSpec['responseType']): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return null
  if (type === 'blob') return response.blob()
  const raw = await response.text()
  if (!raw) return null
  if (type === 'text') return raw
  if (type === 'json' || response.headers.get('content-type')?.includes('json')) {
    try { return JSON.parse(raw) as unknown } catch (error) {
      if (type === 'json') throw error
    }
  }
  return raw
}

function bodyValue(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined
  if (body === null) { headers.set('Content-Type', 'application/json'); return 'null' }
  if (typeof body === 'string' || body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body as BodyInit
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  return JSON.stringify(body)
}

export function createFetchAdapter(options: HttpClientOptions = {}) {
  return async function request<TResponse, TBody>(spec: RequestSpec<TBody>, url: string): Promise<TResponse> {
    try {
      const headers = new Headers(typeof options.headers === 'function' ? await options.headers() : options.headers)
      new Headers(spec.headers).forEach((value, key) => headers.set(key, value))
      const response = await (options.fetch ?? fetch)(url, { method: spec.method, headers, body: bodyValue(spec.body, headers), signal: spec.signal })
      const data = await parse(response, spec.responseType)
      if (!response.ok) throw new ApiError({ message: typeof data === 'object' && data && 'message' in data && typeof data.message === 'string' ? data.message : `HTTP ${response.status}`, status: response.status, data, method: spec.method, url })
      return data as TResponse
    } catch (error) { throw failure(error, spec.method, url) }
  }
}
