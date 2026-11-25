import { useQuery, type QueryKey, type QueryOptions, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useHttpClient } from '../vue/provider'
import { getKey } from '../query/keys'
import { deepLegacy, legacyParams, legacyUrl, type ClientInput, type ParamInput } from '../compatibility/legacy'
import type { PathParams, QueryParams, ResponseType } from '../core/types'

type Value<T> = MaybeRefOrGetter<T>
export interface GetConfig<TResponse, TError, TSelected, TKey extends QueryKey> {
  url: Value<string>
  path?: Value<PathParams>
  query?: Value<QueryParams>
  headers?: Value<HeadersInit>
  responseType?: ResponseType
  client?: ClientInput
  /** @deprecated Use client. */ API?: ClientInput
  /** @deprecated Use path and query. */ paramRef?: Value<ParamInput>
  queryKey?: Value<TKey>
  options?: Omit<QueryOptions<TResponse, TError, TSelected, TResponse, TKey>, 'queryKey' | 'queryFn'>
}
export default function useGet<TResponse, TError = import('../core/errors').ApiError, TSelected = TResponse, TKey extends QueryKey = QueryKey>(config: GetConfig<TResponse, TError, TSelected, TKey>): UseQueryReturnType<TSelected, TError> {
  const client = useHttpClient(config.client ?? config.API)
  const details = () => {
    const legacy = legacyParams(config.paramRef === undefined ? undefined : deepLegacy(config.paramRef))
    return { url: legacyUrl(toValue(config.url), legacy.suffix), path: config.path === undefined ? legacy.path : toValue(config.path), query: config.query === undefined ? legacy.query : toValue(config.query) }
  }
  const { queryFn: _queryFn, queryKey: _queryKey, ...options } = (config.options ?? {}) as QueryOptions<TResponse, TError, TSelected, TResponse, TKey>
  return useQuery<TResponse, TError, TSelected, TKey>(() => ({
    ...options,
    queryKey: (config.queryKey === undefined ? getKey({ ...details(), responseType: config.responseType, client }) : toValue(config.queryKey)) as TKey,
    queryFn: ({ signal }: { signal: AbortSignal }) => {
      const request = details()
      return client.request<TResponse>({ method: 'GET', ...request, headers: config.headers === undefined ? undefined : toValue(config.headers), responseType: config.responseType, signal })
    },
  } as unknown as UseQueryOptions<TResponse, TError, TSelected, TResponse, TKey>))
}
