import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/vue-query";
import { computed, isRef, MaybeRefOrGetter, ref, toValue, unref } from "vue";
import type { AxiosInstance } from "axios";
import { useApi } from "./useApi";
import { NonFunctionGuard, UseGetQueryOptions } from "./types/index.dto";
import { deepUnref, validateParams, buildUrl } from "./utils/utils";

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
  API?: AxiosInstance | string;
  options?: Omit<
    UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >;
  paramRef?: MaybeRefOrGetter<any>;
}) {

  if (!url || typeof url !== "string") {
    throw new Error("Invalid or missing URL");
  }

  const params = isRef(paramRef) ? paramRef : ref(paramRef);

  const queryKeyComputed = computed(() => {
    const baseKey = toValue(queryKey);
    const resolvedParams = deepUnref(params);
    const keyArray = Array.isArray(baseKey) ? baseKey.map(deepUnref) : [deepUnref(baseKey)];
    if (resolvedParams) {
      if (typeof resolvedParams === "object" && !Array.isArray(resolvedParams) && ("path" in resolvedParams || "query" in resolvedParams)) {
        keyArray.push(resolvedParams.path ?? [], resolvedParams.query ?? {});
      } else {
        keyArray.push(resolvedParams);
      }
    }
    return keyArray;
  });

  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  }

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey: queryKeyComputed.value as any,
    queryFn: async () => {
      const finalParams = deepUnref(unref(params));
      validateParams(finalParams);
      const finalUrl = finalParams ? buildUrl(url, finalParams) : url;

      if (typeof currentApi === "string") {
        return (await fetch(currentApi + finalUrl)).json();
      }

      return (await currentApi.get<TQueryFnData>(finalUrl)).data;
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
