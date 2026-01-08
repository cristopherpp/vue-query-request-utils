import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/vue-query";
import { ComputedRef, isRef, MaybeRefOrGetter, Ref, ref } from "vue";
import type { AxiosInstance } from "axios";
import { useApi } from "./useApi";
import { HttpClient, NonFunctionGuard, ParamInput, UseGetQueryOptions } from "./types/index.dto";
import { deepUnref, validateParams, buildUrl } from "./utils/utils";

type ReactiveQueryKey<TQueryKey extends QueryKey> =
  TQueryKey |
  Ref<TQueryKey> |
  ComputedRef<TQueryKey> |
  (() => TQueryKey);

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
  queryKey: ReactiveQueryKey<TQueryKey>;
  API?: HttpClient | AxiosInstance | string;
  options?: Omit<
    UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >;
  paramRef?: MaybeRefOrGetter<ParamInput>;
}) {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid or missing URL");
  }

  // Wrap paramRef in a ref if it’s not already reactive
  const params = isRef(paramRef) || typeof paramRef === "function" ? paramRef : ref(paramRef);

  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function"); 
  }

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey: queryKey as any,
    queryFn: async () => {
      const finalParams = deepUnref(params);
      validateParams(finalParams);
      const finalUrl = finalParams ? buildUrl(url, finalParams) : url;

      if (typeof currentApi === "string") {
        const response = await fetch(currentApi + finalUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      }

      const client = currentApi as HttpClient;
      const response = await client.get<TQueryFnData>(finalUrl);
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