import { UseMutationOptions } from '@tanstack/vue-query';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
type HttpMethod = "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "delete" | "DELETE";
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
export default function useSend<TData, TRequest = void, TError = Error>({ method, url, API, requestConfig, options, mutationKey, }: {
    method: HttpMethod;
    url: string;
    API?: AxiosInstance;
    requestConfig?: AxiosRequestConfig;
    options?: UseMutationOptions<TData, TError, TRequest, unknown>;
    mutationKey?: string | string[];
}): import('@tanstack/vue-query').UseMutationReturnType<TData, TError, TRequest, unknown, Omit<import('@tanstack/vue-query').MutationObserverIdleResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverLoadingResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverErrorResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverSuccessResult<TData, TError, TRequest, unknown>, "mutate" | "reset">>;
export {};
