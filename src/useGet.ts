import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/vue-query";
import { computed, ComputedRef, isRef, MaybeRefOrGetter, ref, Ref, toValue, unref } from "vue";
import type { AxiosInstance } from "axios";
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
    const result: any = {}
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

  if (isPrimitive(params)) {
    pathParts = [String(params)];
  } else if (Array.isArray(params)) {
    pathParts = params.map(String);
  } else if (params && typeof params === "object") {
    if ("path" in params || "query" in params) {
      if (Array.isArray(params.path)) {
        pathParts = params.path.map(String);
      }

      if (params.query && typeof params.query === "object" && !Array.isArray(params.query)) {
        queryParams = params.query;
      }
    } else {
      queryParams = params;
    }
  }

  const finalPath = pathParts.length > 0 ? `${pathParts.join("/")}` : "";
  const finalQuery = Object.keys(queryParams).length > 0 ?
    `?${new URLSearchParams(Object.entries(queryParams).flatMap(([k, v]) => Array.isArray(v) ? v.map((val: any) => [k, String(v)]) : [[k, String(v)]])).toString()}`
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
  API?: AxiosInstance;
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
