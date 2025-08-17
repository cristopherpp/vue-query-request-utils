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
  | string
  | number
  | boolean
  | Ref<any>
  | ComputedRef<any>
  | Record<string, any>
  | Array<any>;

type NonFunctionGuard<T> = T extends (...args: any[]) => any ? never : T;

type UseGetQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = MaybeRefOrGetter<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

/* UTILS */

const isPrimitive = (v: any) => typeof v === "string" || typeof v === "number" || typeof v === "boolean";

class UseGetError extends Error {
  constructor(message: string) {
    super(`[useGet] ${message}`);
    this.name = "UseGetError";
  }
}

const deepUnref = <T>(value: T): any => {
  const unwrapped = toValue(value);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(deepUnref);
  }
  if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
    const result: any = {};
    for (const key in unwrapped) {
      result[key] = deepUnref(unwrapped[key]);
    }
    return result;
  }
  return unwrapped;
};

const validateParams = (params: any, paramPath: string = "paramRef") => {
  if (params === null || params === undefined) return; // Allow null/undefined for optional params
  if (isPrimitive(params)) return;
  if (Array.isArray(params)) {
    params.forEach((item, i) => {
      if (!isPrimitive(item)) {
        throw new UseGetError(`[${paramPath}[${i}]] must be string | number | boolean, got ${typeof item}`);
      }
    });
    return;
  }
  if (typeof params === "object") {
    if ("path" in params || "query" in params) {
      if (params.path && (!Array.isArray(params.path) || !params.path.every(isPrimitive))) {
        throw new UseGetError(`[${paramPath}.path] must be an array of string | number | boolean`);
      }
      if (params.query && (typeof params.query !== "object" || Array.isArray(params.query))) {
        throw new UseGetError(`[${paramPath}.query] must be a plain object`);
      }
      if (params.query) {
        for (const [k, v] of Object.entries(params.query)) {
          if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
            throw new UseGetError(`[${paramPath}.query.${k}] must be string | number | boolean or array of those`);
          }
        }
      }
      return;
    }
    // Handle plain object as query parameters
    for (const [k, v] of Object.entries(params)) {
      if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
        throw new UseGetError(`[${paramPath}.${k}] must be string | number | boolean or array of those`);
      }
    }
    return;
  }
  throw new UseGetError(`[${paramPath}] Unsupported type: ${typeof params}`);
};

const buildUrl = (baseUrl: string, params: ParamInput): string => {
  let pathParts: string[] = [];
  let queryParams: Record<string, any> = {};

  const unwrappedParams = toValue(params); // Handle ref/computed reactivity

  if (unwrappedParams === null || unwrappedParams === undefined) {
    return baseUrl;
  } else if (isPrimitive(unwrappedParams)) {
    pathParts = [String(unwrappedParams)];
  } else if (Array.isArray(unwrappedParams)) {
    pathParts = unwrappedParams.map(String);
  } else if (typeof unwrappedParams === "object") {
    if ("path" in unwrappedParams || "query" in unwrappedParams) {
      if (Array.isArray(unwrappedParams.path)) {
        pathParts = unwrappedParams.path.map(String);
      }
      if (unwrappedParams.query && typeof unwrappedParams.query === "object" && !Array.isArray(unwrappedParams.query)) {
        queryParams = unwrappedParams.query;
      }
    } else {
      queryParams = unwrappedParams; // Treat plain object as query params
    }
  }

  const finalPath = pathParts.length > 0 ? `/${pathParts.join("/")}` : "";
  const finalQuery =
    Object.keys(queryParams).length > 0
      ? `?${new URLSearchParams(
          Object.entries(queryParams).flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((val: any) => [k, String(val)]) : [[k, String(v)]]
          )
        ).toString()}`
      : "";

  return `${baseUrl}${finalPath}${finalQuery}`;
};

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
  queryKey: MaybeRefOrGetter<TQueryKey>;
  API?: AxiosInstance | { get: <T>(url: string, config?: AxiosRequestConfig) => Promise<{ data: T }> };
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

  // Compute queryKey reactively
  const queryKeyComputed = computed<unknown[]>(() => {
    const baseKey = toValue(queryKey); // Unwrap ref or getter
    return baseKey.map(deepUnref); // Unwrap each element (string, ref, computed)
  });

  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function"); 
  }

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey: queryKeyComputed.value as any,
    queryFn: async () => {
      const finalParams = deepUnref(params);
      validateParams(finalParams);
      const finalUrl = finalParams !== null && finalParams !== undefined ? buildUrl(url, finalParams) : url;

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