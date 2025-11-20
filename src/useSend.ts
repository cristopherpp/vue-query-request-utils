import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import { type AxiosInstance, type AxiosRequestConfig, isAxiosError } from "axios";
import { useApi } from "./useApi";
import { computed, isRef, type MaybeRefOrGetter, ref, unref } from "vue";
import { type HttpMethod } from "./types/index.dto";
import { deepUnref, validateParams } from "./utils/utils";

// Helper Type checks
function isAxiosInstance(api: any): api is AxiosInstance {
  return api && typeof api.request === 'function';
}

/**
 * Composable for making POST, PUT, PATCH, or DELETE requests to an API using
 * `@tanstack/vue-query`.
 *
 * @template TData - Data type returned by the API call.
 * @template TRequest - Data type sent in the request body.
 * @template TError - Error type returned by the API call.
 *
 * @param {Object} options - Configuration for the request.
 * @param {HttpMethod} options.method - HTTP method (post, put, patch, delete).
 * @param {string} options.url - API URL or endpoint. Example: `"/api/example"`.
 * @param {AxiosInstance} [options.API] - Axios instance used for the request.
 * @param {AxiosRequestConfig} [options.requestConfig] - Additional Axios request config.
 * @param {UseMutationOptions<TData, TError, TRequest, unknown>} [options.options] - Additional `useMutation` options.
 * @param {string | string[]} [options.mutationKey] - Unique cache key. Example: `["example"]` or a `Ref<QueryKey>`.
 *
 * @returns A `UseMutationResult` object from `@tanstack/vue-query` with properties like:
 * - `mutate`: Function to trigger the mutation.
 * - `isLoading`: Mutation in progress.
 * - `isSuccess`: Mutation success state.
 * - `data`: Response data.
 * - `error`: Error details, if any.
 * - `refetch`: Function to refetch data.
 *
 * @throws {Error} If the API URL is invalid.
 */
export default function useSend<TData, TRequest = any, TError = Error>({
  API,
  method,
  url,
  paramsRef,
  requestConfig,
  options,
  mutationKey,
}: {
  method: HttpMethod;
  url: string;
  API?: AxiosInstance | string;
  paramsRef?: MaybeRefOrGetter<TRequest>; // Made optional
  requestConfig?: AxiosRequestConfig; // Used for Axios
  fetchOptions?: RequestInit; // Added specifically for Fetch customization
  options?: UseMutationOptions<TData, TError, TRequest, unknown>;
  mutationKey?: string | string[];
}) {
  const apiInstance = useApi();
  // Fallback: If API prop is missing, try useApi. If useApi is missing/invalid, fallback to empty (logic handled below)
  const currentApi = API ?? apiInstance;

  const mutationKeyComputed = computed(() =>
    mutationKey
      ? Array.isArray(mutationKey)
        ? mutationKey
        : [mutationKey]
      : undefined
  );

  const normalizedMethod = method.toLowerCase();
  const params = paramsRef ? (isRef(paramsRef) ? paramsRef : ref(paramsRef)) : ref(null);

  return useMutation<TData, TError, TRequest, unknown>({
    mutationKey: mutationKeyComputed.value,
    
    // variables here comes from mutate(variables)
    mutationFn: async (variables) => {
      if (!currentApi) {
        throw new Error("No API instance or Base URL provided.");
      }

      // PRIORITIZE: mutate(variables) -> paramsRef -> empty object
      const variablePayload = deepUnref(unref(variables));
      const refPayload = deepUnref(unref(params));
      
      // Use variables if passed, otherwise fallback to the ref
      let finalPayload = (variablePayload && Object.keys(variablePayload).length > 0) 
        ? variablePayload 
        : refPayload;
        
      validateParams(finalPayload);
      finalPayload = finalPayload ?? {};

      // --- HANDLE FETCH ---
      if (typeof currentApi === "string") {
        return handleFetch<TData>(
          currentApi, 
          url, 
          normalizedMethod, 
          finalPayload, 
          requestConfig // We map axios config to fetch options inside the helper
        );
      } 
      
      // --- HANDLE AXIOS ---
      if (isAxiosInstance(currentApi)) {
        return handleAxios<TData>(
          currentApi, 
          url, 
          normalizedMethod, 
          finalPayload, 
          requestConfig
        );
      }

      throw new Error("Invalid API instance provided.");
    },
    ...options,
  });
}

/**
 * Internal helper to handle Fetch requests
 */
async function handleFetch<T>(
  baseUrl: string, 
  endpoint: string, 
  method: string, 
  payload: any,
  config?: any
): Promise<T> {
  const fetchUrl = `${baseUrl}${endpoint}`;
  
  // Basic Headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(config?.headers || {})
  };

  const options: RequestInit = {
    method: method.toUpperCase(),
    headers,
    body: method !== 'get' ? JSON.stringify(payload) : undefined,
    ...config // Spread extra config if compatible
  };

  const response = await fetch(fetchUrl, options);

  // Fetch does not throw on 4xx/5xx, so we must check manually
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Internal helper to handle Axios requests
 */
async function handleAxios<T>(
  api: AxiosInstance, 
  url: string, 
  method: string, 
  payload: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    let response;
    switch (method) {
      case "post":
        response = await api.post<T>(url, payload, config);
        break;
      case "put":
        response = await api.put<T>(url, payload, config);
        break;
      case "patch":
        response = await api.patch<T>(url, payload, config);
        break;
      case "delete":
        // Axios delete signature is different (config contains data)
        response = await api.delete<T>(url, {
          ...config,
          data: payload,
        });
        break;
      default:
        throw new Error(`HTTP method not supported: ${method}`);
    }
    return response.data;
  } catch (error) {
    // Optional: Normalize error if needed, or just rethrow
    throw error;
  }
}