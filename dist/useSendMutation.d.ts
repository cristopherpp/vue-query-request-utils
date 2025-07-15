import { UseMutationOptions } from '@tanstack/vue-query';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
type HttpMethod = "post" | "put" | "patch" | "delete";
export default function useSend<TData, TRequest = void, TError = Error>({ method, url, API, requestConfig, options, mutationKey, }: {
    method: HttpMethod;
    url: string;
    API?: AxiosInstance;
    requestConfig?: AxiosRequestConfig;
    options?: UseMutationOptions<TData, TError, TRequest, unknown>;
    mutationKey?: string | string[];
}): import('@tanstack/vue-query').UseMutationReturnType<TData, TError, TRequest, unknown, Omit<import('@tanstack/vue-query').MutationObserverIdleResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverLoadingResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverErrorResult<TData, TError, TRequest, unknown>, "mutate" | "reset"> | Omit<import('@tanstack/vue-query').MutationObserverSuccessResult<TData, TError, TRequest, unknown>, "mutate" | "reset">>;
export {};
