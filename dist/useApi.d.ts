import { App } from 'vue';
import { AxiosInstance } from 'axios';
interface HttpClient {
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
export declare function useApi(): HttpClient;
export declare function provideApi(api: HttpClient | AxiosInstance): {
    install(app: App): void;
};
export declare function createFetchClient(baseUrl?: string): HttpClient;
export {};
