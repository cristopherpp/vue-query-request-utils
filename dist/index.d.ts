export { default as useGet } from "./composables/useGet";
export { default as useSend } from "./composables/useSend";
export { createHttpClient } from "./core/client";
export { ApiError } from "./core/errors";
export { buildUrl } from "./core/url";
export { getKey, getKeyPrefix } from "./query/keys";
export {
  provideApi,
  useApi,
  useHttpClient,
  createFetchClient,
} from "./vue/provider";
export type {
  HttpMethod,
  HttpClient,
  HttpClientOptions,
  RequestSpec,
  PathParams,
  QueryParams,
  QueryValue,
  ResponseType,
} from "./core/types";
export type { GetConfig } from "./composables/useGet";
export type { SendConfig } from "./composables/useSend";
export type { LegacyClient, ParamInput } from "./compatibility/legacy";
