import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import { AxiosInstance, type AxiosRequestConfig } from "axios";
import { useApi } from "./useApi";

type HttpMethod = "post" | "put" | "patch" | "delete";

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

  return useMutation<TData, TError, TRequest, unknown>({
    mutationKey: mutationKey
      ? Array.isArray(mutationKey)
        ? mutationKey
        : [mutationKey]
      : undefined,
    mutationFn: async (data: TRequest) => {
      const payload = data ?? {};

      return (await (currentApi instanceof Object && 'defaults' in currentApi
        ? currentApi[method]<TData>(url, payload, requestConfig)
        : currentApi[method]<TData>(url, payload))).data;
    },
    ...options,
  });
}
