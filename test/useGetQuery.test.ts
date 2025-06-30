import { flushPromises, mount } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { describe, test, expect, beforeEach, afterEach, afterAll, beforeAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import QueryComponent from "../src/QueryComponent.vue";
import { waitFor, screen, render } from "@testing-library/vue";

const server = setupServer(
  http.get("https://api.thecatapi.com/v1/images/search", () => {
    return HttpResponse.json({
      id: "abc",
      url: "https://cdn2.thecatapi.com/images/abc.jpg",
      width: 768,
      height: 1024,
    })
  })
);

describe("QueryComponent", () => {
  let queryClient: QueryClient;

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    queryClient.clear();
  });

  test("Shows a cat", async () => {
    render(QueryComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await waitFor(() => {
      const img = screen.getByAltText("Random Cat") as HTMLImageElement;
      expect(img.src).toContain("cdn2.thecatapi.com/images/abc.jpg");
    }, { timeout: 2000 });;
  });
});
