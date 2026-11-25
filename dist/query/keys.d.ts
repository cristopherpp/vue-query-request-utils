import {
  HttpClient,
  PathParams,
  QueryParams,
  ResponseType,
} from "../core/types";
export declare function getKeyPrefix(spec: {
  url: string;
  path?: PathParams;
  client?: Pick<HttpClient, "baseURL" | "cacheScope">;
}): readonly [string, string, string, string];
export declare function getKey(spec: {
  url: string;
  path?: PathParams;
  query?: QueryParams;
  responseType?: ResponseType;
  client?: Pick<HttpClient, "baseURL" | "cacheScope">;
}): readonly [string, string, string, string, string, string];
