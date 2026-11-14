import { PathParams, QueryParams } from "./types";
/** null and undefined query values are omitted; arrays repeat their key. */
export declare function buildUrl(
  url: string,
  options?: {
    baseURL?: string;
    path?: PathParams;
    query?: QueryParams;
  },
): string;
export declare function canonicalUrl(url: string): string;
/** Removes common credential query parameters before a URL enters keys or errors. */
export declare function redactUrl(url: string): string;
export declare function isCredentialKey(key: string): boolean;
