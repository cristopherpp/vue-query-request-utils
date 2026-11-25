import { inject, hasInjectionContext, type App, type InjectionKey } from 'vue'
import { createHttpClient } from '../core/client'
import { normalizeClient, type ClientInput, type LegacyClient } from '../compatibility/legacy'
import type { HttpClient } from '../core/types'

const ApiKey: InjectionKey<HttpClient> = Symbol('vue-query-request-utils.api')
const defaultClient = createHttpClient()

/** @deprecated Prefer an explicit client or useHttpClient(). */
export function useApi(): HttpClient {
  const client = hasInjectionContext() ? inject(ApiKey, undefined) : undefined
  if (!client) throw new Error('No API instance provided')
  return client
}
export function useHttpClient(override?: ClientInput): HttpClient {
  if (override) return normalizeClient(override)
  return (hasInjectionContext() ? inject(ApiKey, undefined) : undefined) ?? defaultClient
}
export function provideApi(client: ClientInput) {
  return { install(app: App) { app.provide(ApiKey, normalizeClient(client)) } }
}
/** @deprecated Use createHttpClient(). Legacy methods return { data }. */
export function createFetchClient(baseURL = ''): LegacyClient & HttpClient {
  const client = createHttpClient({ baseURL })
  return {
    ...client,
    async get<T>(url: string) { return { data: await client.request<T>({ method: 'GET', url }) } },
    async post<T>(url: string, body?: unknown) { return { data: await client.request<T>({ method: 'POST', url, body }) } },
    async put<T>(url: string, body?: unknown) { return { data: await client.request<T>({ method: 'PUT', url, body }) } },
    async patch<T>(url: string, body?: unknown) { return { data: await client.request<T>({ method: 'PATCH', url, body }) } },
    async delete<T>(url: string, body?: unknown) { return { data: await client.request<T>({ method: 'DELETE', url, body }) } },
  }
}
