import { App } from 'vue';
import { AxiosInstance } from 'axios';
import { HttpClient } from './types/index.dto';
export declare function useApi(): HttpClient;
export declare function provideApi(api: HttpClient | AxiosInstance): {
    install(app: App): void;
};
export declare function createFetchClient(baseUrl?: string): HttpClient;
