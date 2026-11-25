import { HttpClientOptions, RequestSpec } from "../types";
export declare function createFetchAdapter(
  options?: HttpClientOptions,
): <TResponse, TBody>(
  spec: RequestSpec<TBody>,
  url: string,
) => Promise<TResponse>;
