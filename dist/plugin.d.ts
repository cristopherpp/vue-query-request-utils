import { InjectionKey, App } from 'vue';
import { AxiosInstance } from 'axios';
export declare const apiKey: InjectionKey<AxiosInstance>;
export declare const requestApiPlugin: (API: AxiosInstance) => {
    install(app: App): void;
};
