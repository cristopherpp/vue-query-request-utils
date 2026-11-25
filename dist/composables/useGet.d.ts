import {
  QueryKey,
  QueryOptions,
  UseQueryReturnType,
} from "@tanstack/vue-query";
import { MaybeRefOrGetter } from "vue";
import { ClientInput, ParamInput } from "../compatibility/legacy";
import { PathParams, QueryParams, ResponseType } from "../core/types";
type Value<T> = MaybeRefOrGetter<T>;
export interface GetConfig<
  TResponse,
  TError,
  TSelected,
  TKey extends QueryKey,
> {
  url: Value<string>;
  path?: Value<PathParams>;
  query?: Value<QueryParams>;
  headers?: Value<HeadersInit>;
  responseType?: ResponseType;
  client?: ClientInput;
  /** @deprecated Use client. */ API?: ClientInput;
  /** @deprecated Use path and query. */ paramRef?: Value<ParamInput>;
  queryKey?: Value<TKey>;
  options?: Omit<
    QueryOptions<TResponse, TError, TSelected, TResponse, TKey>,
    "queryKey" | "queryFn"
  >;
}
export default function useGet<
  TResponse,
  TError = import("../core/errors").ApiError,
  TSelected = TResponse,
  TKey extends QueryKey = QueryKey,
>(
  config: GetConfig<TResponse, TError, TSelected, TKey>,
): UseQueryReturnType<TSelected, TError>;
export {};
