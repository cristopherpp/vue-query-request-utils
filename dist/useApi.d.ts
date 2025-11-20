import { App } from 'vue';
import { AxiosInstance } from 'axios';
export declare function useApi(): AxiosInstance | undefined;
export declare function provideApi(api: AxiosInstance | string): {
    install(app: App): void;
};
