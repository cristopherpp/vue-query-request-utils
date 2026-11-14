import { App } from "vue";
import { ClientInput, LegacyClient } from "../compatibility/legacy";
import { HttpClient } from "../core/types";
/** @deprecated Prefer an explicit client or useHttpClient(). */
export declare function useApi(): HttpClient;
export declare function useHttpClient(override?: ClientInput): HttpClient;
export declare function provideApi(client: ClientInput): {
  install(app: App): void;
};
/** @deprecated Use createHttpClient(). Legacy methods return { data }. */
export declare function createFetchClient(
  baseURL?: string,
): LegacyClient & HttpClient;
