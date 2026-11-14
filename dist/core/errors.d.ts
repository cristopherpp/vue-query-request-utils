import { HttpMethod } from "./types";
export declare class ApiError extends Error {
  readonly status: number | null;
  readonly data: unknown;
  readonly method: HttpMethod;
  readonly url: string;
  readonly cause: unknown;
  constructor(details: {
    message: string;
    status: number | null;
    data?: unknown;
    method: HttpMethod;
    url: string;
    cause?: unknown;
  });
}
export declare function failure(
  error: unknown,
  method: HttpMethod,
  url: string,
): ApiError;
