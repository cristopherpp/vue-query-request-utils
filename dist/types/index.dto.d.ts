import { QueryKey, UseQueryOptions } from '@tanstack/vue-query';
import { Ref, ComputedRef, MaybeRefOrGetter } from 'vue';
export type ParamInput = string | number | boolean | Ref<any> | ComputedRef<any> | Record<string, any> | Array<any>;
export type NonFunctionGuard<T> = T extends (...args: any[]) => any ? never : T;
export type UseGetQueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = MaybeRefOrGetter<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;
export type HttpMethod = "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "delete" | "DELETE";
export interface HttpClient {
    get<T>(url: string): Promise<{
        data: T;
    }>;
    post<T>(url: string, data?: any): Promise<{
        data: T;
    }>;
    put<T>(url: string, data?: any): Promise<{
        data: T;
    }>;
    patch<T>(url: string, data?: any): Promise<{
        data: T;
    }>;
    delete<T>(url: string, data?: any): Promise<{
        data: T;
    }>;
}
