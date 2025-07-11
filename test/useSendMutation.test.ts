import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { render, fireEvent, screen, waitFor } from "@testing-library/vue";
import { h, defineComponent } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import useSend from "../src/useSendMutation";
import axios from "axios";

const server = setupServer(
  http.post("https://jsonplaceholder.typicode.com/posts", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 101, body });
  }),
  http.put("https://jsonplaceholder.typicode.com/posts/101", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 101, body, updated: true });
  }),
  http.patch("https://jsonplaceholder.typicode.com/posts/101", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 101, body, patched: true });
  }),
  http.delete("https://jsonplaceholder.typicode.com/posts/101", () => {
    return HttpResponse.json({ success: true });
  })
);

describe("useSend Mutation Composable (POST, PUT, PATCH, DELETE)", () => {
  let queryClient: QueryClient;

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  const createComponent = (method: 'post' | 'put' | 'patch' | 'delete', label: string, url: string, payload?: any) => {
    return defineComponent({
      setup() {
        const { mutate, isSuccess } = useSend<any, any>({
          API: axios.create({ baseURL: "https://jsonplaceholder.typicode.com" }),
          url,
          method,
        });

        const submit = () => mutate(payload);

        return () => h("div", [
          h("button", { onClick: submit }, label),
          isSuccess.value && h("p", {}, "Success!")
        ]);
      }
    });
  };

  test("POST request shows success", async () => {
    const Component = createComponent("post", "Send Post", "/posts", {
      title: "Post Title", body: "Post body", userId: 1
    });

    render(Component, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await fireEvent.click(screen.getByText("Send Post"));
    await waitFor(() => expect(screen.getByText("Success!")).toBeTruthy());
  });

  test("PUT request shows success", async () => {
    const Component = createComponent("put", "Send Put", "/posts/101", {
      title: "Put Title", body: "Put body", userId: 1
    });

    render(Component, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await fireEvent.click(screen.getByText("Send Put"));
    await waitFor(() => expect(screen.getByText("Success!")).toBeTruthy());
  });

  test("PATCH request shows success", async () => {
    const Component = createComponent("patch", "Send Patch", "/posts/101", {
      title: "Patch Title"
    });

    render(Component, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await fireEvent.click(screen.getByText("Send Patch"));
    await waitFor(() => expect(screen.getByText("Success!")).toBeTruthy());
  });

  test("DELETE request shows success", async () => {
    const Component = createComponent("delete", "Send Delete", "/posts/101");

    render(Component, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await fireEvent.click(screen.getByText("Send Delete"));
    await waitFor(() => expect(screen.getByText("Success!")).toBeTruthy());
  });
});
