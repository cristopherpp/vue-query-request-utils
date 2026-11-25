export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>
export type PathParams = Record<string, string | number | boolean>
export type ResponseType = 'auto' | 'json' | 'text' | 'blob'
export type HeaderSource = HeadersInit | (() => HeadersInit | Promise<HeadersInit>)

export interface RequestSpec<TBody = unknown> {
  method: HttpMethod
  url: string
  path?: PathParams
  query?: QueryParams
  body?: TBody
  headers?: HeadersInit
  signal?: AbortSignal
  responseType?: ResponseType
}
export interface HttpClient {
  readonly cacheScope?: string
  readonly baseURL?: string
  request<TResponse, TBody = unknown>(spec: RequestSpec<TBody>): Promise<TResponse>
}
export interface HttpClientOptions {
  baseURL?: string
  cacheScope?: string
  headers?: HeaderSource
  fetch?: typeof fetch
}
