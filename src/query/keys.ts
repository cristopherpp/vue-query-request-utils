import { buildUrl, canonicalUrl, redactUrl, isCredentialKey } from '../core/url'
import type { HttpClient, PathParams, QueryParams, ResponseType } from '../core/types'

export function getKeyPrefix(spec: { url: string; path?: PathParams; client?: Pick<HttpClient, 'baseURL' | 'cacheScope'> }): readonly [string, string, string, string] {
  const resolved = buildUrl(spec.url, { baseURL: spec.client?.baseURL, path: safePath(spec.path) })
  return ['vqr', spec.client?.cacheScope ?? 'default', 'GET', canonicalUrl(resolved).split('?')[0]]
}
export function getKey(spec: { url: string; path?: PathParams; query?: QueryParams; responseType?: ResponseType; client?: Pick<HttpClient, 'baseURL' | 'cacheScope'> }): readonly [string, string, string, string, string, string] {
  const prefix = getKeyPrefix(spec)
  const resolved = canonicalUrl(redactUrl(buildUrl(spec.url, { baseURL: spec.client?.baseURL, path: safePath(spec.path), query: spec.query })))
  return [...prefix, resolved.split('?')[1] ?? '', spec.responseType ?? 'auto'] as const
}

function safePath(path?: PathParams): PathParams | undefined {
  return path && Object.fromEntries(Object.entries(path).map(([key, value]) => [key, isCredentialKey(key) ? '[redacted]' : value]))
}
