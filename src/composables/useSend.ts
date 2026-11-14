import { useMutation, useQueryClient, type MutationKey, type QueryKey, type MutationOptions, type UseMutationReturnType } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useHttpClient } from '../vue/provider'
import { deepLegacy, legacyConfig, legacyParams, legacyUrl, type ClientInput, type ParamInput } from '../compatibility/legacy'
import type { HttpMethod, PathParams, QueryParams, ResponseType } from '../core/types'

export interface SendConfig<TResponse, TVariables, TError, TContext = unknown> {
  method: Exclude<HttpMethod, 'GET'> | Lowercase<Exclude<HttpMethod, 'GET'>>
  url: string | ((variables: TVariables) => string)
  path?: (variables: TVariables) => PathParams
  query?: (variables: TVariables) => QueryParams
  body?: (variables: TVariables) => unknown
  headers?: HeadersInit | ((variables: TVariables) => HeadersInit)
  signal?: AbortSignal | ((variables: TVariables) => AbortSignal)
  responseType?: ResponseType
  client?: ClientInput
  /** @deprecated Use client. */ API?: ClientInput
  /** @deprecated Use path and query. */ paramRef?: MaybeRefOrGetter<ParamInput>
  /** @deprecated Use body. */ bodyRef?: MaybeRefOrGetter<TVariables>
  /** @deprecated Use headers, signal, and query. */ config?: object
  mutationKey?: MutationKey
  invalidate?: readonly QueryKey[] | ((data: TResponse, variables: TVariables) => readonly QueryKey[])
  options?: Omit<MutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>
}
type LegacyBodyResult<TResponse, TVariables, TError, TContext> = UseMutationReturnType<TResponse, TError, TVariables, TContext> & {
  mutate(variables?: TVariables, options?: Parameters<UseMutationReturnType<TResponse, TError, TVariables, TContext>['mutate']>[1]): void
  mutateAsync(variables?: TVariables, options?: Parameters<UseMutationReturnType<TResponse, TError, TVariables, TContext>['mutateAsync']>[1]): Promise<TResponse>
}
/** @deprecated bodyRef overload. Pass mutation variables or a body mapper instead. */
export default function useSend<TResponse, TVariables = void, TError = import('../core/errors').ApiError, TContext = unknown>(config: SendConfig<TResponse, TVariables, TError, TContext> & { bodyRef: MaybeRefOrGetter<TVariables> }): LegacyBodyResult<TResponse, TVariables, TError, TContext>
export default function useSend<TResponse, TVariables = void, TError = import('../core/errors').ApiError, TContext = unknown>(config: SendConfig<TResponse, TVariables, TError, TContext>): UseMutationReturnType<TResponse, TError, TVariables, TContext>
export default function useSend<TResponse, TVariables = void, TError = import('../core/errors').ApiError, TContext = unknown>(config: SendConfig<TResponse, TVariables, TError, TContext>): UseMutationReturnType<TResponse, TError, TVariables, TContext> {
  const client = useHttpClient(config.client ?? config.API)
  const queryClient = useQueryClient()
  const { mutationFn: _mutationFn, mutationKey: _mutationKey, onSuccess, ...options } = (config.options ?? {}) as MutationOptions<TResponse, TError, TVariables, TContext>
  return useMutation<TResponse, TError, TVariables, TContext>({
    ...options,
    mutationKey: config.mutationKey,
    mutationFn: variables => {
      const oldConfig = legacyConfig(config.config)
      const legacy = legacyParams(config.paramRef === undefined ? undefined : deepLegacy(config.paramRef))
      const url = legacyUrl(typeof config.url === 'function' ? config.url(variables) : config.url, legacy.suffix)
      const body = config.body ? config.body(variables) : variables === undefined ? (config.bodyRef === undefined ? undefined : deepLegacy(config.bodyRef)) : variables
      return client.request<TResponse>({
        method: config.method.toUpperCase() as Exclude<HttpMethod, 'GET'>,
        url, path: config.path?.(variables), query: { ...oldConfig.query, ...legacy.query, ...config.query?.(variables) },
        body, headers: typeof config.headers === 'function' ? config.headers(variables) : config.headers ?? oldConfig.headers,
        signal: typeof config.signal === 'function' ? config.signal(variables) : config.signal ?? oldConfig.signal,
        responseType: config.responseType,
      })
    },
    onSuccess: async (data, variables, context, mutationContext) => {
      const targets = typeof config.invalidate === 'function' ? config.invalidate(data, variables) : config.invalidate
      if (targets) await Promise.all(targets.map(queryKey => queryClient.invalidateQueries({ queryKey })))
      await onSuccess?.(data, variables, context, mutationContext)
    },
  })
}
