import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/vue-query";
import { computed, inject, MaybeRefOrGetter, unref } from "vue";
import type { Axios, AxiosInstance } from "axios";
import { useApi } from "./useApi";

type NonFunctionGuard<T> = T extends (...args: any[]) => any ? never : T;

type UseGetQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = MaybeRefOrGetter<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

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

export default function useGet<
  TQueryFnData,
  TError = Error,
  TData = NonFunctionGuard<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
>({
  url,
  queryKey,
  API,
  options,
  paramRef,
}: {
  url: string;
  queryKey: MaybeRefOrGetter<TQueryKey>;
  API?: AxiosInstance;
  options?: Omit<
    UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >;
  paramRef?: {
    [key: string]: string | number | boolean | (string | number | boolean)[];
  };
}) {
  const queryKeyComputed = computed(() => unref(queryKey));

  // Vue inject
  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error(
      "No Axios instance provided. Either pass API param or install your API plugin.",
    );
  }

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey: queryKeyComputed.value as any,
    queryFn: async ({ queryKey: actualQueryKey }) => {
      const currentApiUrl = url;

      if (!currentApiUrl) {
        throw new Error(
          `API inválida para el queryKey: ${actualQueryKey.join(", ")}`,
        );
      }

      const response = await currentApi.get<TQueryFnData>(currentApiUrl, {
        params: paramRef ? paramRef : {},
      });

      return response.data;
    },
    ...(options as UseQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryFnData,
      TQueryKey
    >),
  });
}
