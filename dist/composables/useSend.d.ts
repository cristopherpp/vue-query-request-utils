import {
  MutationKey,
  QueryKey,
  MutationOptions,
  UseMutationReturnType,
} from "@tanstack/vue-query";
import { MaybeRefOrGetter } from "vue";
import { ClientInput, ParamInput } from "../compatibility/legacy";
import {
  HttpMethod,
  PathParams,
  QueryParams,
  ResponseType,
} from "../core/types";
export interface SendConfig<TResponse, TVariables, TError, TContext = unknown> {
  method: Exclude<HttpMethod, "GET"> | Lowercase<Exclude<HttpMethod, "GET">>;
  url: string | ((variables: TVariables) => string);
  path?: (variables: TVariables) => PathParams;
  query?: (variables: TVariables) => QueryParams;
  body?: (variables: TVariables) => unknown;
  headers?: HeadersInit | ((variables: TVariables) => HeadersInit);
  signal?: AbortSignal | ((variables: TVariables) => AbortSignal);
  responseType?: ResponseType;
  client?: ClientInput;
  /** @deprecated Use client. */ API?: ClientInput;
  /** @deprecated Use path and query. */ paramRef?: MaybeRefOrGetter<ParamInput>;
  /** @deprecated Use body. */ bodyRef?: MaybeRefOrGetter<TVariables>;
  /** @deprecated Use headers, signal, and query. */ config?: object;
  mutationKey?: MutationKey;
  invalidate?:
    | readonly QueryKey[]
    | ((data: TResponse, variables: TVariables) => readonly QueryKey[]);
  options?: Omit<
    MutationOptions<TResponse, TError, TVariables, TContext>,
    "mutationFn" | "mutationKey"
  >;
}
type LegacyBodyResult<TResponse, TVariables, TError, TContext> =
  UseMutationReturnType<TResponse, TError, TVariables, TContext> & {
    mutate(
      variables?: TVariables,
      options?: Parameters<
        UseMutationReturnType<TResponse, TError, TVariables, TContext>["mutate"]
      >[1],
    ): void;
    mutateAsync(
      variables?: TVariables,
      options?: Parameters<
        UseMutationReturnType<
          TResponse,
          TError,
          TVariables,
          TContext
        >["mutateAsync"]
      >[1],
    ): Promise<TResponse>;
  };
/** @deprecated bodyRef overload. Pass mutation variables or a body mapper instead. */
export default function useSend<
  TResponse,
  TVariables = void,
  TError = import("../core/errors").ApiError,
  TContext = unknown,
>(
  config: SendConfig<TResponse, TVariables, TError, TContext> & {
    bodyRef: MaybeRefOrGetter<TVariables>;
  },
): LegacyBodyResult<TResponse, TVariables, TError, TContext>;
export default function useSend<
  TResponse,
  TVariables = void,
  TError = import("../core/errors").ApiError,
  TContext = unknown,
>(
  config: SendConfig<TResponse, TVariables, TError, TContext>,
): UseMutationReturnType<TResponse, TError, TVariables, TContext>;
export {};
