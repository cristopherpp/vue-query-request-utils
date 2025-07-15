import { App } from 'vue';
import { AxiosInstance } from 'axios';
export declare function useApi(): AxiosInstance;
export declare function provideApi(api: AxiosInstance): {
    install(app: App): void;
};
