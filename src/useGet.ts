import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/vue-query";
import { computed, ComputedRef, isRef, MaybeRefOrGetter, ref, Ref, unref, UnwrapNestedRefs } from "vue";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useApi } from "./useApi";

/* TYPES */

type ParamInput =
  string
  | number
  | boolean
  | Ref<any>
  | ComputedRef<any>
  | Record<string, any>
  | Array<any>

type NonFunctionGuard<T> = T extends (...args: any[]) => any ? never : T;

type UseGetQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = MaybeRefOrGetter<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

/* UTILS */

const isPrimitive = (v: any) => typeof v === "string" || typeof v === "number" || typeof v === "boolean"; 

const fail = (msg: string) => { throw new Error(`[useGet] Invalida paramRef: ${msg}`) };

const deepUnref = <T>(value: T): any => {
  if (isRef(value)) return deepUnref(value.value);

  if (Array.isArray(value)) {
    return value.map((item) => deepUnref(item));
  }

  if (typeof value === "object" && value !== null) {
    const result: any = {};
    for (const key in value) {
      result[key] = deepUnref((value as any)[key]);
    }
    return result;
  }

  return value;
};

const validateParams = (params: any) => {

  if (params === null || params === undefined) return;


  if  (isPrimitive(params)) return;

  if (Array.isArray(params)) {
    if (!params.every(isPrimitive)) {
      fail("Array values must be string | number | boolean");
    }

    return;
  }

  if (typeof params === "object") {
    const hastPathOrQuery = "path" in params || "query" in params;

    if (hastPathOrQuery) {
      if (params.path) {
        if (!Array.isArray(params.path) || !params.path.every(isPrimitive)) {
          fail("params.path must be an array of string | number | boolean");
        }
      }

      if (params.query) {
        if (typeof params.query !== "object" || Array.isArray(params.query)) {
          fail("params.query must be a plain object");
        }

        for (const [k, v] of Object.entries(params.query)) {
          if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
            fail(`params.query.${k} must be string | number | boolean or array of those`);
          }
        }
      }

      return;
    }

    for (const [k, v] of Object.entries(params)) {
      if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
        fail(`paramRef.${k} must be string | number | boolean or array of those`);
      }
    }

    return;
  }

  fail("Unsopported paramRef type");
};

const buildUrl = (baseUrl: string, params: ParamInput): string => {
  let pathParts: string[] = [];
  let queryParams: Record<string, any> = {};
  const resolvedParams = deepUnref(unref(params));

  if (
    typeof resolvedParams === "string" ||
    typeof resolvedParams === "number" ||
    typeof resolvedParams === "boolean"
  ) {
    pathParts =[resolvedParams.toString()];
  } else if (Array.isArray(resolvedParams)) {
    pathParts = resolvedParams.map(String);
  } else if (resolvedParams && typeof resolvedParams === "object") {
    if ("path" in resolvedParams || "query" in resolvedParams) {
      const path = deepUnref(resolvedParams.path);
      if (Array.isArray(path)) {
        pathParts = path.map(String);
      }

      const query = deepUnref(resolvedParams.query);
      if (typeof query === "object" && query !== null && !Array.isArray(query)) {
        queryParams = query;
      }

    } else {
      queryParams = resolvedParams;
    }
  }

  const finalPath = pathParts.length > 0 ? `${pathParts.join("/")}` : "";
  const finalQuery = Object.keys(queryParams).length > 0 ?
    `?${new URLSearchParams(Object.entries(queryParams).map(([k, v]) => [k, String(v)])).toString()}`
    : "";
    
  return `${baseUrl}${finalPath}${finalQuery}`;
};

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
  API?: AxiosInstance | { get: <T>(url: string, config?: AxiosRequestConfig) => Promise<{ data: T }> };
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
    const baseKey = unref(queryKey);
    const paramVal = deepUnref(unref(params));
    return [baseKey, JSON.stringify(paramVal)];
  });

  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function"); 
  }

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey: queryKeyComputed.value as any,
    queryFn: async () => {
      const finalParams = deepUnref(unref(params));
      validateParams(finalParams);
      const finalUrl = finalParams ? buildUrl(url, finalParams) : url;

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
