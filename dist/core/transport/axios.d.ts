import { HttpClient, HttpMethod } from "../types";
/** Structural shape accepted by an Axios instance; no Axios package is needed to load root types. */
export interface AxiosCompatible {
  defaults: {
    baseURL?: string;
  };
  request<T>(config: {
    url: string;
    method: HttpMethod;
    data?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    responseType?: "blob" | "text";
  }): Promise<{
    data: T;
    status: number;
  }>;
}
export declare function createAxiosAdapter(
  instance: AxiosCompatible,
  cacheScope?: string,
): HttpClient;
