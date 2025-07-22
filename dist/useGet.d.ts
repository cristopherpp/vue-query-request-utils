import { QueryKey, UseQueryOptions } from '@tanstack/vue-query';
import { MaybeRefOrGetter } from 'vue';
import { AxiosInstance } from 'axios';
type NonFunctionGuard<T> = T extends (...args: any[]) => any ? never : T;
type UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = MaybeRefOrGetter<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;
/**
 * Composable for making GET requests to an API using `@tanstack/vue-query`.
 *
 * @template T - Data type returned by the API call.
 *
 * @param params - Configuration for the request.
 * @param params.API - Axios instance used for the request.
 * @param params.apiUrl - API URL or endpoint. Example: `"/api/example"`.
 * @param params.queryKey - Unique cache key. Example: `["example"]` or a `Ref<QueryKey>`.
 * @param [params.options] - Additional `useQuery` options. Example: `{ initialData, enabled }`.
 * @param [params.paramRef] - Query parameters. Example: `{ id: 123, active: true }`.
 *
 * @returns A `UseQueryResult` object from `@tanstack/vue-query` with properties like:
 * - `data`: Retrieved data of type `T`.
 * - `isLoading`: Indicates if the request is in progress.
 * - `isError`: Indicates if an error occurred.
 * - `error`: Details about the error, if any.
 * - `isFetching`: Indicates if the cache is being refreshed.
 * - `refetch`: Function to re-run the request.
 *
 * @throws {Error} If the API URL is invalid.
 */
export default function useGet<TQueryFnData, TError = Error, TData = NonFunctionGuard<TQueryFnData>, TQueryKey extends QueryKey = QueryKey>({ url, queryKey, API, options, paramRef, }: {
    url: string;
    queryKey: MaybeRefOrGetter<TQueryKey>;
    API?: AxiosInstance;
    options?: Omit<UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">;
    paramRef?: MaybeRefOrGetter<any>;
}): import('@tanstack/vue-query').UseQueryReturnType<TData, TError>;
export {};
