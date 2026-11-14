import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createFetchClient, createHttpClient, getKey, getKeyPrefix, provideApi, useGet, useSend } from '../src/index'
import type { HttpClient } from '../src/index'

function setup<T>(factory: () => T, api?: HttpClient) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  let value!: T
  const component = defineComponent({ setup() { value = factory(); return () => h('div') } })
  const wrapper = mount(component, { global: { plugins: [[VueQueryPlugin, { queryClient }], ...(api ? [provideApi(api)] : [])] } })
  return { value, queryClient, wrapper }
}
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } })
const settle = async () => { await flushPromises(); await nextTick() }
afterEach(() => { vi.unstubAllGlobals() })

describe('useGet', () => {
  it('uses Fetch fallback, generates a key and supports select', async () => {
    const fetcher = vi.fn(async () => json({ count: 2 }))
    vi.stubGlobal('fetch', fetcher)
    const { value, queryClient, wrapper } = setup(() => useGet<{ count: number }, Error, number>({ url: '/count', options: { select: data => data.count } }))
    await settle()
    expect(value.data.value).toBe(2)
    expect(queryClient.getQueryData(getKey({ url: '/count' }))).toEqual({ count: 2 })
    expect(fetcher).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
  it('reacts to query and route changes with distinct cache entries', async () => {
    const page = ref(1); const id = ref('a')
    const fetcher = vi.fn(async (input: RequestInfo | URL) => json({ url: String(input) }))
    const client = createHttpClient({ baseURL: 'https://api.test', fetch: fetcher })
    const { value, queryClient, wrapper } = setup(() => useGet<{ url: string }>({ url: '/users/:id', path: () => ({ id: id.value }), query: () => ({ page: page.value }) }), client)
    await settle()
    expect(value.data.value?.url).toBe('https://api.test/users/a?page=1')
    page.value = 2; await settle()
    expect(value.data.value?.url).toBe('https://api.test/users/a?page=2')
    id.value = 'b/c'; await settle()
    expect(value.data.value?.url).toBe('https://api.test/users/b%2Fc?page=2')
    expect(queryClient.getQueryData(getKey({ url: '/users/:id', path: { id: 'a' }, query: { page: 1 }, client }))).toBeTruthy()
    wrapper.unmount()
  })
  it('respects explicit keys, disabled queries and explicit client priority', async () => {
    const injected = createHttpClient({ fetch: vi.fn(async () => json({ source: 'injected' })) })
    const override = createHttpClient({ fetch: vi.fn(async () => json({ source: 'override' })) })
    const { value, queryClient, wrapper } = setup(() => useGet<{ source: string }>({ url: '/x', queryKey: ['custom'], client: override, options: { enabled: false } }), injected)
    await settle(); expect(value.data.value).toBeUndefined()
    await value.refetch(); expect(value.data.value?.source).toBe('override')
    expect(queryClient.getQueryData(['custom'])).toEqual({ source: 'override' })
    expect(queryClient.getQueryData(getKey({ url: '/x', client: override }))).toBeUndefined()
    wrapper.unmount()
  })

  it('accepts legacy get parameters and a direct Axios instance override', async () => {
    const axios = (await import('axios')).default
    const adapter = vi.fn(async config => ({ data: { url: config.url }, status: 200, statusText: 'OK', headers: {}, config }))
    const API = axios.create({ baseURL: 'https://api.test', adapter })
    const { value, wrapper } = setup(() => useGet<{ url: string }>({ API, url: '/users', queryKey: ['legacy-users'], paramRef: { path: [4], query: { page: 2 } } }))
    await settle()
    expect(value.data.value).toEqual({ url: '/users/4?page=2' })
    wrapper.unmount()
  })
  it('deduplicates simultaneous observers and forwards cancellation', async () => {
    let signal: AbortSignal | undefined
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal ?? undefined
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
    })
    const client = createHttpClient({ fetch: fetcher })
    const { queryClient, wrapper } = setup(() => {
      useGet({ url: '/slow', client }); useGet({ url: '/slow', client })
    })
    await settle(); expect(fetcher).toHaveBeenCalledTimes(1)
    await queryClient.cancelQueries({ queryKey: getKeyPrefix({ url: '/slow', client }) })
    expect(signal?.aborted).toBe(true)
    wrapper.unmount()
  })
})

describe('useSend', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)('%s sends variables', async method => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => json({ method: init?.method, body: init?.body }))
    const client = createHttpClient({ fetch: fetcher })
    const { value, wrapper } = setup(() => useSend<{ method: string; body: string }, { name: string }>({ method, url: '/users', client }))
    const result = await value.mutateAsync({ name: 'Ada' })
    expect(result).toEqual({ method, body: '{"name":"Ada"}' })
    wrapper.unmount()
  })
  it('maps path and body, supports bodyless DELETE and lowercase methods', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => json({ url: String(input), body: init?.body ?? null }))
    const client = createHttpClient({ fetch: fetcher })
    const { value, wrapper } = setup(() => useSend<{ url: string; body: unknown }, { id: number; data: { name: string } }>({ method: 'patch', url: '/users/:id', path: v => ({ id: v.id }), body: v => v.data, client }))
    expect(await value.mutateAsync({ id: 7, data: { name: 'Ada' } })).toEqual({ url: '/users/7', body: '{"name":"Ada"}' })
    wrapper.unmount()
    const second = setup(() => useSend<unknown, void>({ method: 'DELETE', url: '/users/7', body: () => undefined, client }))
    await second.value.mutateAsync()
    expect(fetcher.mock.calls[1]?.[1]?.body).toBeUndefined()
    second.wrapper.unmount()
  })
  it('invalidates only on opt-in, awaits it and calls onSuccess once', async () => {
    const fetcher = vi.fn(async () => json({ ok: true }))
    const client = createHttpClient({ fetch: fetcher })
    const order: string[] = []
    const onSuccess = vi.fn(() => { order.push('success') })
    const { value, queryClient, wrapper } = setup(() => useSend<{ ok: boolean }, { id: number }>({ method: 'POST', url: '/x', client, invalidate: (_data, variables) => [getKeyPrefix({ url: `/users/${variables.id}`, client })], options: { onSuccess } }))
    queryClient.setQueryData(getKey({ url: '/users/4', client }), { old: true })
    const spy = vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(async () => { await new Promise(resolve => setTimeout(resolve, 5)); order.push('invalidated') })
    await value.mutateAsync({ id: 4 })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['invalidated', 'success'])
    wrapper.unmount()
    const without = setup(() => useSend({ method: 'POST', url: '/x', client }))
    const noSpy = vi.spyOn(without.queryClient, 'invalidateQueries')
    await without.value.mutateAsync()
    expect(noSpy).not.toHaveBeenCalled()
    without.wrapper.unmount()
  })

  it('passes normalized errors to user callbacks', async () => {
    const client = createHttpClient({ fetch: async () => new Response('{"message":"No"}', { status: 400, headers: { 'content-type': 'application/json' } }) })
    const onError = vi.fn()
    const { value, wrapper } = setup(() => useSend<unknown, { name: string }>({ method: 'POST', url: '/x', client, options: { onError } }))
    await expect(value.mutateAsync({ name: 'Ada' })).rejects.toMatchObject({ status: 400 })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]?.[0]).toMatchObject({ status: 400, message: 'No' })
    wrapper.unmount()
  })
  it('supports legacy API, paramRef, bodyRef and createFetchClient', async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => json({ url: String(input), body: init?.body }))
    vi.stubGlobal('fetch', fetcher)
    const API = createFetchClient('https://api.test')
    const { value, wrapper } = setup(() => useSend<{ url: string; body: string }, { name: string }>({ API, method: 'post', url: '/users', paramRef: { path: [4], query: { active: true } }, bodyRef: { name: 'Ada' }, config: { headers: { 'x-legacy': 'yes' }, params: { mode: 'legacy' } } }))
    expect(await value.mutateAsync()).toEqual({ url: 'https://api.test/users/4?mode=legacy&active=true', body: '{"name":"Ada"}' })
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('x-legacy')).toBe('yes')
    wrapper.unmount()
  })
})
