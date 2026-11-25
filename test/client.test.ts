import { describe, expect, it, vi } from 'vitest'
import { ApiError, buildUrl, createHttpClient, getKey, getKeyPrefix } from '../src/index'
import { createAxiosAdapter } from '../src/axios'
import axios from 'axios'

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })

describe('URL and keys', () => {
  it('encodes paths, merges existing query, repeats arrays and keeps fragments', () => {
    expect(buildUrl('/users/:id?old=yes#top', { baseURL: 'https://api.test/v1/', path: { id: 'a/b' }, query: { tag: ['a b', 'c'], nil: null, missing: undefined, active: false, page: 0 } }))
      .toBe('https://api.test/v1/users/a%2Fb?old=yes&tag=a+b&tag=c&active=false&page=0#top')
  })
  it('keeps credentials out of keys and errors', async () => {
    const key = getKey({ url: '/users?access_token=private&x=1', path: { id: 1 } })
    expect(JSON.stringify(key)).not.toContain('private')
    const client = createHttpClient({ fetch: async () => json({ message: 'Denied' }, 403) })
    await expect(client.request({ method: 'GET', url: '/users?api_key=private' })).rejects.toMatchObject({ url: '/users' })
  })
  it('canonicalizes equivalent parameters and supports list prefix invalidation', () => {
    const a = getKey({ url: '/users?page=1&sort=name', query: { tag: ['b', 'a'] } })
    const b = getKey({ url: '/users?sort=name&page=1', query: { tag: ['b', 'a'] } })
    expect(a).toEqual(b)
    expect(a.slice(0, 4)).toEqual(getKeyPrefix({ url: '/users' }))
    expect(getKey({ url: '/users', responseType: 'blob' })).not.toEqual(getKey({ url: '/users', responseType: 'text' }))
    expect(getKey({ url: '/users', query: { tag: ['a', 'b'] } })).not.toEqual(getKey({ url: '/users', query: { tag: ['b', 'a'] } }))
  })
})

describe('Fetch client', () => {
  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)('%s sends a request and returns data', async method => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => json({ ok: true }))
    const client = createHttpClient({ baseURL: 'https://api.test', fetch: fetcher })
    await expect(client.request({ method, url: '/users', body: method === 'GET' ? undefined : { a: 1 } })).resolves.toEqual({ ok: true })
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.test/users')
    expect(fetcher.mock.calls[0]?.[1]?.method).toBe(method)
  })
  it('merges async default headers with per-request headers and forwards cancellation', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => json({ ok: true }))
    const signal = new AbortController().signal
    const client = createHttpClient({ headers: async () => ({ authorization: 'Bearer private', 'x-mode': 'old' }), fetch: fetcher })
    await client.request({ method: 'GET', url: '/users', headers: { 'x-mode': 'new' }, signal })
    const init = fetcher.mock.calls[0]?.[1]
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer private')
    expect(new Headers(init?.headers).get('x-mode')).toBe('new')
    expect(init?.signal).toBe(signal)
  })
  it.each([false, 0, '', null])('preserves falsy JSON-capable body %s', async body => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => json({ ok: true }))
    await createHttpClient({ fetch: fetcher }).request({ method: 'POST', url: '/x', body })
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe(body === '' ? '' : JSON.stringify(body))
  })
  it('keeps FormData native and handles text, Blob and empty responses', async () => {
    const form = new FormData(); form.set('name', 'Ada')
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response('hello', { headers: { 'content-type': 'text/plain' } }))
      .mockResolvedValueOnce(new Response('blob'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(json({ ok: true }))
    const client = createHttpClient({ fetch: fetcher })
    await expect(client.request({ method: 'GET', url: '/text' })).resolves.toBe('hello')
    await expect(client.request<Blob>({ method: 'GET', url: '/blob', responseType: 'blob' })).resolves.toBeInstanceOf(Blob)
    await expect(client.request({ method: 'GET', url: '/empty' })).resolves.toBeNull()
    await client.request({ method: 'POST', url: '/form', body: form })
    expect(fetcher.mock.calls[3]?.[1]?.body).toBe(form)
    expect(new Headers(fetcher.mock.calls[3]?.[1]?.headers).has('content-type')).toBe(false)
  })
  it('normalizes HTTP, network and abort failures', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json({ message: 'Denied' }, 403)).mockRejectedValueOnce(new Error('offline')).mockRejectedValueOnce(new DOMException('stopped', 'AbortError'))
    const client = createHttpClient({ fetch: fetcher })
    await expect(client.request({ method: 'GET', url: '/x' })).rejects.toMatchObject({ name: 'ApiError', status: 403, data: { message: 'Denied' }, message: 'Denied' })
    await expect(client.request({ method: 'GET', url: '/x' })).rejects.toMatchObject({ status: null, message: 'offline' })
    await expect(client.request({ method: 'GET', url: '/x' })).rejects.toMatchObject({ name: 'AbortError', status: null })
  })
})

describe('Axios adapter', () => {
  it('respects instance interceptors and returns response data', async () => {
    const adapter = vi.fn(async config => ({ data: { ok: true, header: config.headers.get('x-token') }, status: 200, statusText: 'OK', headers: {}, config }))
    const instance = axios.create({ baseURL: 'https://api.test', adapter })
    instance.interceptors.request.use(config => { config.headers.set('x-token', 'yes'); return config })
    const result = await createAxiosAdapter(instance).request<{ ok: boolean; header: string }>({ method: 'POST', url: '/users/:id', path: { id: 'a/b' }, query: { page: 1 }, body: { name: 'Ada' } })
    expect(result).toEqual({ ok: true, header: 'yes' })
    expect(adapter.mock.calls[0]?.[0]?.url).toBe('/users/a%2Fb?page=1')
  })

  it('normalizes Axios network cancellation', async () => {
    const instance = axios.create({ adapter: async () => { throw new axios.CanceledError('cancelled') } })
    await expect(createAxiosAdapter(instance).request({ method: 'GET', url: '/x' })).rejects.toMatchObject({ name: 'AbortError', status: null })
  })
  it('normalizes HTTP errors', async () => {
    const instance = axios.create({ adapter: async config => ({ data: { message: 'No' }, status: 400, statusText: 'Bad', headers: {}, config }) })
    await expect(createAxiosAdapter(instance).request({ method: 'GET', url: '/x' })).rejects.toMatchObject({ status: 400, data: { message: 'No' }, method: 'GET' })
  })
})
