import { QueryKey } from '@tanstack/vue-query';
import { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';
import { AxiosInstance } from 'axios';
import { HttpClient, NonFunctionGuard, ParamInput, UseGetQueryOptions } from './types/index.dto';
type ReactiveQueryKey<TQueryKey extends QueryKey> = TQueryKey | Ref<TQueryKey> | ComputedRef<TQueryKey> | (() => TQueryKey);
/**
 * Composable for making GET requests to an API using `@tanstack/vue-query`.
 *
 * @template T - Data type returned by the API call.
 * @template TQueryFnData - Data type returned by the API call.
 * @template TError - Error type.
 * @template TData - Transformed data type.
 * @template TQueryKey - Query key type.
 *
 * @param params - Configuration for the request.
 * @template T - Data type returned by the API call.
 * @param params.url - API URL or endpoint. Example: `"/api/example"`.
 * @param params.queryKey - Unique cache key. Example: `["example"]` or a `Ref<QueryKey>`.
 * @param [params.API] - Axios instance used for the request.
 * @param [params.options] - Additional `useQuery` options. Example: `{ initialData, enabled }`.
 * @param [params.paramRef] - Query parameters. Supports:
 *   - Single value: `paramRef: 123` → `/api/example/123`
 *   - Array: `paramRef: [123, "abc"]` → `/api/example/123/abc`
 *   - Object with path/query: `paramRef: { path: [123], query: { active: true } }` → `/api/example/123?active=true`
 *   - Plain object: `paramRef: { page: 1, active: true }` → `/api/example?page=1&active=true`
 *
 * @returns A `UseQueryResult` object from `@tanstack/vue-query`.
 *
 * @throws {Error} If the API URL is invalid or no API instance is provided.
 */
export default function useGet<TQueryFnData, TError = Error, TData = NonFunctionGuard<TQueryFnData>, TQueryKey extends QueryKey = QueryKey>({ url, queryKey, API, options, paramRef, }: {
    url: string;
    queryKey: ReactiveQueryKey<TQueryKey>;
    API?: HttpClient | AxiosInstance | string;
    options?: Omit<UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">;
    paramRef?: MaybeRefOrGetter<ParamInput>;
}): import('@tanstack/vue-query').UseQueryReturnType<TData, TError>;
export {};
