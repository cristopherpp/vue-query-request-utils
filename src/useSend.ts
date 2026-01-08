import { useMutation, type UseMutationOptions, type MutationKey } from "@tanstack/vue-query";
import { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { isRef, type MaybeRefOrGetter, ref, toValue } from "vue";
import { useApi } from "./useApi";
import { HttpClient } from "./types/index.dto";
import { ParamInput } from "./types/index.dto";
import { deepUnref, validateParams, buildUrl } from "./utils/utils";

// Improved type guard for Axios (checks for .request method, which your HttpClient lacks)
function isAxiosInstance(api: any): api is AxiosInstance {
  return api && typeof api.request === "function";
}

type HttpMethod = "post" | "put" | "patch" | "delete";

/**
 * Composable for making POST, PUT, PATCH, or DELETE requests using `@tanstack/vue-query`.
 * Supports injected/provided API (fetch client, Axios, or base URL string) with override via `API` prop.
 * Includes URL building (path + query params) similar to useGet.
 *
 * @template TData - Response data type.
 * @template TRequest - Request body type (defaults to any; use void if no body).
 * @template TError - Error type.
 *
 * @param options
 * @param options.method - HTTP method.
 * @param options.url - Base endpoint (e.g., "/users/:id").
 * @param [options.API] - Override API client (HttpClient, AxiosInstance, or base URL string).
 * @param [options.paramRef] - Reactive URL params (path/array/object/query) – same as useGet.
 * @param [options.bodyRef] - Fallback reactive body (used if mutate() called without variables).
 * @param [options.config] - Extra request config (AxiosRequestConfig for Axios, RequestInit for fetch/base URL).
 * @param [options.mutationKey] - Optional static mutation key for defaults/grouping.
 * @param [options.options] - Additional useMutation options.
 *
 * @returns UseMutationResult with mutate/mutateAsync for triggering.
 */
export default function useSend<
  TData,
  TRequest = any,
  TError = Error,
>({
  method,
  url,
  API,
  paramRef,
  bodyRef,
  config,
  options,
  mutationKey,
}: {
  method: HttpMethod;
  url: string;
  API?: HttpClient | AxiosInstance | string;
  paramRef?: MaybeRefOrGetter<ParamInput>;
  bodyRef?: MaybeRefOrGetter<TRequest>;
  config?: AxiosRequestConfig | RequestInit;
  options?: UseMutationOptions<TData, TError, TRequest>;
  mutationKey?: MutationKey;
}) {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid or missing URL");
  }

  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  if (!currentApi) {
    throw new Error("No API instance provided. Provide via API prop or provideApi().");
  }

  // Wrap reactive paramRef/bodyRef
  const urlParams = paramRef
    ? isRef(paramRef) || typeof paramRef === "function" ? paramRef : ref(paramRef)
    : undefined;

  const fallbackBody = bodyRef
    ? isRef(bodyRef) || typeof bodyRef === "function" ? bodyRef : ref(bodyRef)
    : undefined;

  const finalMutationKey = mutationKey ? (Array.isArray(mutationKey) ? mutationKey : [mutationKey]) : undefined;

  const normalizedMethod = method.toLowerCase() as "post" | "put" | "patch" | "delete";

  return useMutation<TData, TError, TRequest>({
    mutationKey: finalMutationKey,
    mutationFn: async (variables) => {
      // Build URL with params (path + query)
      let finalUrl = url;
      if (urlParams) {
        const paramsValue = deepUnref(toValue(urlParams));
        validateParams(paramsValue);
        finalUrl = buildUrl(url, paramsValue);
      }

      let finalPayload: any = undefined;
      if (variables !== undefined) {
        finalPayload = deepUnref(variables);
      } else if (fallbackBody) {
        finalPayload = deepUnref(toValue(fallbackBody));
      }

      // Branch by API type
      if (typeof currentApi === "string") {
        return handleFetch<TData>(currentApi + finalUrl, normalizedMethod, finalPayload, config as RequestInit);
      }

      if (isAxiosInstance(currentApi)) {
        return handleAxios<TData>(currentApi, finalUrl, normalizedMethod, finalPayload, config as AxiosRequestConfig);
      }

      const client = currentApi as HttpClient;
      const response = await client[normalizedMethod]<TData>(finalUrl, finalPayload);
      return response.data;
    },
    ...(options ?? {}),
  });
}

// Unified fetch handler (best practices: error check, JSON body, headers)
async function handleFetch<T>(
  fullUrl: string,
  method: string,
  payload: any,
  fetchOptions?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions?.headers ?? {}),
  };

  const options: RequestInit = {
    method: method.toUpperCase(),
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
    ...(fetchOptions ?? {}),
  };

  const response = await fetch(fullUrl, options);
  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch {}
    throw new Error((errorBody as any)?.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

// Unified Axios handler (handles delete config difference)
async function handleAxios<T>(
  api: AxiosInstance,
  url: string,
  method: string,
  payload: any,
  axiosConfig?: AxiosRequestConfig
): Promise<T> {
  let response;
  switch (method) {
    case "post":
      response = await api.post<T>(url, payload, axiosConfig);
      break;
    case "put":
      response = await api.put<T>(url, payload, axiosConfig);
      break;
    case "patch":
      response = await api.patch<T>(url, payload, axiosConfig);
      break;
    case "delete":
      response = await api.delete<T>(url, {
        ...axiosConfig,
        data: payload,
      });
      break;
  }
  return response!.data;
}