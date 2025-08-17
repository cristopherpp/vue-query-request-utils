import { inject, App } from "vue";
import type { AxiosInstance } from "axios";

const ApiKey = Symbol("api");

interface HttpClient {
  get<T>(url: string): Promise<{ data: T }>;
  post<T>(url: string, data?: any): Promise<{ data: T }>;
  put<T>(url: string, data?: any): Promise<{ data: T }>;
  patch<T>(url: string, data?: any): Promise<{ data: T }>;
  delete<T>(url: string, data?: any): Promise<{ data: T }>;
}

export function useApi() {
  const api = inject<HttpClient>(ApiKey);
  if (!api) {
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup.",
    );
  }
  return api;
}

export function provideApi(api: HttpClient | AxiosInstance) {
  return {
    install(app: App) {
      app.provide(ApiKey, api);
    },
  };
}

export function createFetchClient(baseUrl: string = ""): HttpClient {
  return {
    async get<T>(url: string): Promise<{ data: T }> {
      const response = await fetch(`${baseUrl}${url}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return { data }
    },

    async post<T>(url: string, data?: any): Promise<{ data: T }> {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      return { data: responseData };
    },

    async put<T>(url: string, data?: any): Promise<{ data: T }> {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      return { data: responseData };
    },

    async patch<T>(url: string, data?: any): Promise<{ data: T }> {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      return { data: responseData };
    },

    async delete<T>(url: string, data?: any): Promise<{ data: T }> {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      return { data: responseData };
    },
  }
}
