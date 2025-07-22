import { inject, App } from "vue";
import type { AxiosInstance } from "axios";

const ApiKey = Symbol("api");

export function useApi() {
  const api = inject<AxiosInstance>(ApiKey);
  if (!api) {
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup.",
    );
  }
  return api;
}

export function provideApi(api: AxiosInstance) {
  return {
    install(app: App) {
      app.provide(ApiKey, api);
    },
  };
}
