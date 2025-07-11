import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import { AxiosInstance, type AxiosRequestConfig } from "axios";

type HttpMethod = 'post' | 'put' | 'patch' | 'delete';

export default function useSend<TData, TRequest = void, TError = Error>({
  API,
  method,
  url,
  requestConfig,
  options,
  mutationKey,
}: {
  API: AxiosInstance
  method: HttpMethod;
  url: string;
  requestConfig?: AxiosRequestConfig;
  options?: UseMutationOptions<TData, TError, TRequest, unknown>;
  mutationKey?: string | string[];
}) {
  return useMutation<TData, TError, TRequest, unknown>({
    mutationKey: mutationKey ? (Array.isArray(mutationKey) ? mutationKey : [mutationKey]) : undefined,
    mutationFn: async (data: TRequest) => {
      let response;
      const payload = data ?? {};

      switch (method) {
        case 'post':
          response = await API.post<TData>(url, payload, requestConfig);
          break;
        case 'put':
          response = await API.put<TData>(url, payload, requestConfig);
          break;
        case 'patch':
          response = await API.patch<TData>(url, payload, requestConfig);
          break;
        case 'delete':
          response = await API.delete<TData>(url, payload);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      return response.data;
    },
    ...options,
  })
}