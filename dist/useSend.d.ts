import { UseMutationOptions, MutationKey } from '@tanstack/vue-query';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { MaybeRefOrGetter } from 'vue';
import { HttpClient, ParamInput } from './types/index.dto';
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
export default function useSend<TData, TRequest = any, TError = Error>({ method, url, API, paramRef, bodyRef, config, options, mutationKey, }: {
    method: HttpMethod;
    url: string;
    API?: HttpClient | AxiosInstance | string;
    paramRef?: MaybeRefOrGetter<ParamInput>;
    bodyRef?: MaybeRefOrGetter<TRequest>;
    config?: AxiosRequestConfig | RequestInit;
    options?: UseMutationOptions<TData, TError, TRequest>;
    mutationKey?: MutationKey;
}): import('@tanstack/vue-query').UseMutationReturnType<TData, TError, TRequest, unknown, Omit<import('@tanstack/vue-query').MutationObserverIdleResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverLoadingResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverErrorResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverSuccessResult<TData, TError, TRequest, unknown>, "mutate" | "reset">>;
export {};
