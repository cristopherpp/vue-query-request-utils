import { buildUrl, redactUrl } from './url'
import { createFetchAdapter } from './transport/fetch'
import type { HttpClient, HttpClientOptions, RequestSpec } from './types'

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const transport = createFetchAdapter(options)
  return {
    baseURL: options.baseURL,
    cacheScope: options.cacheScope ?? (options.baseURL ? redactUrl(options.baseURL) : 'default'),
    request<TResponse, TBody = unknown>(spec: RequestSpec<TBody>): Promise<TResponse> {
      return transport<TResponse, TBody>(spec, buildUrl(spec.url, { baseURL: options.baseURL, path: spec.path, query: spec.query }))
    },
  }
}
