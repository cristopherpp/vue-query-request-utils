import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import { AxiosInstance, type AxiosRequestConfig } from "axios";
import { useApi } from "./useApi";
import { computed } from "vue";

type HttpMethod = "post" | "put" | "patch" | "delete";

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
export default function useSend<TData, TRequest = void, TError = Error>({
  method,
  url,
  API,
  requestConfig,
  options,
  mutationKey,
}: {
  method: HttpMethod;
  url: string;
  API?: AxiosInstance | {
    [key in HttpMethod]: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<{ data: T }>;
  };
  requestConfig?: AxiosRequestConfig;
  options?: UseMutationOptions<TData, TError, TRequest, unknown>;
  mutationKey?: string | string[];
}) {
  const apiInstance = useApi();
  const currentApi = API ?? apiInstance;

  const mutationKeyComputed = computed(() => mutationKey
    ? Array.isArray(mutationKey)
      ? mutationKey
      : [mutationKey]
    : undefined);

  if (!currentApi) {
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  }

  const normalizedMethod = method.toLowerCase();

  return useMutation<TData, TError, TRequest, unknown>({
    mutationKey: mutationKeyComputed.value,
    mutationFn: async (data: TRequest) => {
      const payload = data ?? {};

      return (await (currentApi instanceof Object && 'defaults' in currentApi
        ? currentApi[method]<TData>(url, payload, requestConfig)
        : currentApi[method]<TData>(url, payload))).data;
    },
    ...options,
  });
}
