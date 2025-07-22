import { useMutation, type UseMutationOptions } from "@tanstack/vue-query";
import { AxiosInstance, type AxiosRequestConfig } from "axios";
import { useApi } from "./useApi";

type HttpMethod = "post" | "put" | "patch" | "delete";

export default function useSend<TData, TRequest = void, TError = Error>({
  API,
  method,
  url,
  requestConfig,
  options,
  mutationKey,
}: {
  method: HttpMethod;
  url: string;
  API?: AxiosInstance;
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
      let response;
      const payload = data ?? {};

      switch (method) {
        case "post":
          response = await currentApi.post<TData>(url, payload, requestConfig);
          break;
        case "put":
          response = await currentApi.put<TData>(url, payload, requestConfig);
          break;
        case "patch":
          response = await currentApi.patch<TData>(url, payload, requestConfig);
          break;
        case "delete":
          response = await currentApi.delete<TData>(url, {
            ...requestConfig,
            data: payload,
          });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      return response.data;
    },
    ...options,
  });
}
