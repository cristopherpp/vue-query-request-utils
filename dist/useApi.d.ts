import { App } from 'vue';
import { AxiosInstance } from 'axios';
<<<<<<< HEAD
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
=======
export declare function useApi(): AxiosInstance | undefined;
export declare function provideApi(api: AxiosInstance): {
>>>>>>> a02323d2dc5e275cbf4c07056c10d0b005e6882b
    install(app: App): void;
};
export declare function createFetchClient(baseUrl?: string): HttpClient;
export {};
