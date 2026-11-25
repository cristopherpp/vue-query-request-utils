import { toValue, type MaybeRefOrGetter } from "vue";
import {
  createAxiosAdapter,
  type AxiosCompatible,
} from "../core/transport/axios";
import { createHttpClient } from "../core/client";
import type {
  HttpClient,
  PathParams,
  QueryParams,
  RequestSpec,
} from "../core/types";

export type ParamInput =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | QueryParams
  | { path?: readonly (string | number | boolean)[]; query?: QueryParams };
export interface LegacyClient {
  get<T>(url: string): Promise<{ data: T }>;
  post<T>(url: string, data?: unknown): Promise<{ data: T }>;
  put<T>(url: string, data?: unknown): Promise<{ data: T }>;
  patch<T>(url: string, data?: unknown): Promise<{ data: T }>;
  delete<T>(url: string, data?: unknown): Promise<{ data: T }>;
}
export type ClientInput = HttpClient | LegacyClient | AxiosCompatible | string;

export function legacyParams(input?: ParamInput): {
  path?: PathParams;
  query?: QueryParams;
  suffix?: string;
} {
  if (input == null) return {};
  const suffix = (values: readonly (string | number | boolean)[]) =>
    values.map((v) => encodeURIComponent(String(v))).join("/");
  if (typeof input !== "object") return { suffix: suffix([input]) };
  if (Array.isArray(input)) return { suffix: suffix(input) };
  if ("path" in input || "query" in input) {
    const value = input as {
      path?: readonly (string | number | boolean)[];
      query?: QueryParams;
    };
    return {
      suffix: value.path?.length ? suffix(value.path) : undefined,
      query: value.query,
    };
  }
  return { query: input as QueryParams };
}
export function legacyUrl(url: string, suffix?: string): string {
  if (!suffix) return url;
  const i = url.search(/[?#]/);
  return i < 0
    ? `${url.replace(/\/$/, "")}/${suffix}`
    : `${url.slice(0, i).replace(/\/$/, "")}/${suffix}${url.slice(i)}`;
}

export function normalizeClient(input: ClientInput): HttpClient {
  if (typeof input === "string") return createHttpClient({ baseURL: input });
  if ("interceptors" in input && "defaults" in input)
    return createAxiosAdapter(input as AxiosCompatible);
  if ("request" in input && typeof input.request === "function")
    return input as HttpClient;
  const legacy = input as LegacyClient;
  return {
    cacheScope: "legacy",
    async request<TResponse, TBody = unknown>(
      spec: RequestSpec<TBody>,
    ): Promise<TResponse> {
      const method = spec.method.toLowerCase() as
        "get" | "post" | "put" | "patch" | "delete";
      const { buildUrl } = await import("../core/url");
      const url = buildUrl(spec.url, { path: spec.path, query: spec.query });
      const result =
        method === "get"
          ? await legacy.get<TResponse>(url)
          : await legacy[method]<TResponse>(url, spec.body);
      return result.data;
    },
  };
}

export function deepLegacy<T>(input: MaybeRefOrGetter<T>): T {
  const value = toValue(input);
  if (Array.isArray(value)) return value.map((item) => deepLegacy(item)) as T;
  if (
    value &&
    typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepLegacy(item)]),
    ) as T;
  }
  return value;
}

export function legacyConfig(input?: object): {
  headers?: HeadersInit;
  signal?: AbortSignal;
  query?: QueryParams;
} {
  if (!input) return {};
  const value = input as {
    headers?: HeadersInit | { toJSON(): Record<string, string> };
    signal?: AbortSignal | null;
    params?: QueryParams;
  };
  const headers =
    value.headers &&
    "toJSON" in value.headers &&
    typeof value.headers.toJSON === "function"
      ? value.headers.toJSON()
      : value.headers;
  return {
    headers: headers as HeadersInit | undefined,
    signal: value.signal ?? undefined,
    query: value.params,
  };
}
