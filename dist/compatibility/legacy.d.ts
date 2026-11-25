import { MaybeRefOrGetter } from "vue";
import { AxiosCompatible } from "../core/transport/axios";
import { HttpClient, PathParams, QueryParams } from "../core/types";
export type ParamInput =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | QueryParams
  | {
      path?: readonly (string | number | boolean)[];
      query?: QueryParams;
    };
export interface LegacyClient {
  get<T>(url: string): Promise<{
    data: T;
  }>;
  post<T>(
    url: string,
    data?: unknown,
  ): Promise<{
    data: T;
  }>;
  put<T>(
    url: string,
    data?: unknown,
  ): Promise<{
    data: T;
  }>;
  patch<T>(
    url: string,
    data?: unknown,
  ): Promise<{
    data: T;
  }>;
  delete<T>(
    url: string,
    data?: unknown,
  ): Promise<{
    data: T;
  }>;
}
export type ClientInput = HttpClient | LegacyClient | AxiosCompatible | string;
export declare function legacyParams(input?: ParamInput): {
  path?: PathParams;
  query?: QueryParams;
  suffix?: string;
};
export declare function legacyUrl(url: string, suffix?: string): string;
export declare function normalizeClient(input: ClientInput): HttpClient;
export declare function deepLegacy<T>(input: MaybeRefOrGetter<T>): T;
export declare function legacyConfig(input?: object): {
  headers?: HeadersInit;
  signal?: AbortSignal;
  query?: QueryParams;
};
