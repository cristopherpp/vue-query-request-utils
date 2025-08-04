import { inject, App } from "vue";
import type { AxiosInstance } from "axios";

const ApiKey = Symbol("api");

export function useApi() {
  const api = inject<AxiosInstance>(ApiKey);
  if (!api) return;
  return api;
}

export function provideApi(api: AxiosInstance) {
  return {
    install(app: App) {
      app.provide(ApiKey, api);
    },
  };
}
