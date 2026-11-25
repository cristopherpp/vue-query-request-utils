import type { PathParams, QueryParams } from './types'

/** null and undefined query values are omitted; arrays repeat their key. */
export function buildUrl(url: string, options: { baseURL?: string; path?: PathParams; query?: QueryParams } = {}): string {
  if (!url) throw new Error('Request URL is required')
  const hashAt = url.indexOf('#')
  const fragment = hashAt < 0 ? '' : url.slice(hashAt)
  const withoutHash = hashAt < 0 ? url : url.slice(0, hashAt)
  const queryAt = withoutHash.indexOf('?')
  let path = queryAt < 0 ? withoutHash : withoutHash.slice(0, queryAt)
  const existing = queryAt < 0 ? '' : withoutHash.slice(queryAt + 1)
  const base = options.baseURL?.replace(/\/$/, '')
  if (base && !/^[a-z][a-z\d+.-]*:\/\//i.test(path)) {
    path = `${base}/${path.replace(/^\//, '')}`
  }
  path = path.replace(/:([A-Za-z_][\w]*)/g, (_match, name: string) => {
    const value = options.path?.[name]
    if (value === undefined || value === null) throw new Error(`Missing path parameter: ${name}`)
    return encodeURIComponent(String(value))
  })
  const params = new URLSearchParams(existing)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    params.delete(key)
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== null && item !== undefined) params.append(key, String(item))
    }
  }
  const search = params.toString()
  return `${path}${search ? `?${search}` : ''}${fragment}`
}

export function canonicalUrl(url: string): string {
  const at = url.indexOf('#')
  const withoutHash = at < 0 ? url : url.slice(0, at)
  const i = withoutHash.indexOf('?')
  if (i < 0) return withoutHash
  const entries = [...new URLSearchParams(withoutHash.slice(i + 1)).entries()]
    .sort(([ak], [bk]) => ak.localeCompare(bk))
  const search = new URLSearchParams(entries).toString()
  return `${withoutHash.slice(0, i)}${search ? `?${search}` : ''}`
}

/** Removes common credential query parameters before a URL enters keys or errors. */
export function redactUrl(url: string): string {
  url = url.replace(/^([a-z][a-z\d+.-]*:\/\/)[^/@]+@/i, '$1')
  const hashAt = url.indexOf('#')
  const fragment = hashAt < 0 ? '' : url.slice(hashAt)
  const source = hashAt < 0 ? url : url.slice(0, hashAt)
  const queryAt = source.indexOf('?')
  if (queryAt < 0) return url
  const params = new URLSearchParams(source.slice(queryAt + 1))
  for (const key of [...params.keys()]) {
    if (isCredentialKey(key)) params.delete(key)
  }
  const search = params.toString()
  return `${source.slice(0, queryAt)}${search ? `?${search}` : ''}${fragment}`
}
export function isCredentialKey(key: string): boolean {
  return /^(?:authorization|auth[_-]?token|access[_-]?token|refresh[_-]?token|id[_-]?token|api[_-]?key|password|secret|credential|token)$/i.test(key)
}
