import {
  a as e,
  i as t,
  n,
  o as r,
  r as i,
  s as a,
  t as o,
} from "./axios-DAMHxGif.js";
import {
  useMutation as s,
  useQuery as c,
  useQueryClient as l,
} from "@tanstack/vue-query";
import { hasInjectionContext as u, inject as d, toValue as f } from "vue";
// src/core/transport/fetch.ts
async function p(e, t) {
  if (e.status === 204 || e.status === 205) return null;
  if (t === "blob") return e.blob();
  let n = await e.text();
  if (!n) return null;
  if (t === "text") return n;
  if (t === "json" || e.headers.get("content-type")?.includes("json"))
    try {
      return JSON.parse(n);
    } catch (e) {
      if (t === "json") throw e;
    }
  return n;
}
function m(e, t) {
  if (e !== void 0)
    return e === null
      ? (t.set("Content-Type", "application/json"), "null")
      : typeof e == "string" ||
          e instanceof Blob ||
          e instanceof FormData ||
          e instanceof URLSearchParams ||
          e instanceof ArrayBuffer ||
          ArrayBuffer.isView(e)
        ? e
        : (t.set("Content-Type", t.get("Content-Type") ?? "application/json"),
          JSON.stringify(e));
}
function h(e = {}) {
  return async function (t, r) {
    try {
      let i = new Headers(
        typeof e.headers == "function" ? await e.headers() : e.headers,
      );
      new Headers(t.headers).forEach((e, t) => i.set(t, e));
      let a = await (e.fetch ?? fetch)(r, {
          method: t.method,
          headers: i,
          body: m(t.body, i),
          signal: t.signal,
        }),
        o = await p(a, t.responseType);
      if (!a.ok)
        throw new n({
          message:
            typeof o == "object" &&
            o &&
            "message" in o &&
            typeof o.message == "string"
              ? o.message
              : `HTTP ${a.status}`,
          status: a.status,
          data: o,
          method: t.method,
          url: r,
        });
      return o;
    } catch (e) {
      throw i(e, t.method, r);
    }
  };
}
// src/core/client.ts
function g(e = {}) {
  let n = h(e);
  return {
    baseURL: e.baseURL,
    cacheScope: e.cacheScope ?? (e.baseURL ? a(e.baseURL) : "default"),
    request(r) {
      return n(
        r,
        t(r.url, {
          baseURL: e.baseURL,
          path: r.path,
          query: r.query,
        }),
      );
    },
  };
}
// src/compatibility/legacy.ts
function _(e) {
  if (e == null) return {};
  let t = (e) => e.map((e) => encodeURIComponent(String(e))).join("/");
  if (typeof e != "object") return { suffix: t([e]) };
  if (Array.isArray(e)) return { suffix: t(e) };
  if ("path" in e || "query" in e) {
    let n = e;
    return {
      suffix: n.path?.length ? t(n.path) : void 0,
      query: n.query,
    };
  }
  return { query: e };
}
function v(e, t) {
  if (!t) return e;
  let n = e.search(/[?#]/);
  return n < 0
    ? `${e.replace(/\/$/, "")}/${t}`
    : `${e.slice(0, n).replace(/\/$/, "")}/${t}${e.slice(n)}`;
}
function y(e) {
  if (typeof e == "string") return g({ baseURL: e });
  if ("interceptors" in e && "defaults" in e) return o(e);
  if ("request" in e && typeof e.request == "function") return e;
  let t = e;
  return {
    cacheScope: "legacy",
    async request(e) {
      let n = e.method.toLowerCase(),
        { buildUrl: r } = await import("./axios-DAMHxGif.js").then((e) => e.c),
        i = r(e.url, {
          path: e.path,
          query: e.query,
        });
      return (n === "get" ? await t.get(i) : await t[n](i, e.body)).data;
    },
  };
}
function b(e) {
  let t = f(e);
  return Array.isArray(t)
    ? t.map((e) => b(e))
    : t &&
        typeof t == "object" &&
        (Object.getPrototypeOf(t) === Object.prototype ||
          Object.getPrototypeOf(t) === null)
      ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, b(t)]))
      : t;
}
function x(e) {
  if (!e) return {};
  let t = e;
  return {
    headers:
      t.headers &&
      "toJSON" in t.headers &&
      typeof t.headers.toJSON == "function"
        ? t.headers.toJSON()
        : t.headers,
    signal: t.signal ?? void 0,
    query: t.params,
  };
}
// src/vue/provider.ts
var S = Symbol("vue-query-request-utils.api"),
  C = g();
function w() {
  let e = u() ? d(S, void 0) : void 0;
  if (!e) throw Error("No API instance provided");
  return e;
}
function T(e) {
  return e ? y(e) : ((u() ? d(S, void 0) : void 0) ?? C);
}
function E(e) {
  return {
    install(t) {
      t.provide(S, y(e));
    },
  };
}
function D(e = "") {
  let t = g({ baseURL: e });
  return {
    ...t,
    async get(e) {
      return {
        data: await t.request({
          method: "GET",
          url: e,
        }),
      };
    },
    async post(e, n) {
      return {
        data: await t.request({
          method: "POST",
          url: e,
          body: n,
        }),
      };
    },
    async put(e, n) {
      return {
        data: await t.request({
          method: "PUT",
          url: e,
          body: n,
        }),
      };
    },
    async patch(e, n) {
      return {
        data: await t.request({
          method: "PATCH",
          url: e,
          body: n,
        }),
      };
    },
    async delete(e, n) {
      return {
        data: await t.request({
          method: "DELETE",
          url: e,
          body: n,
        }),
      };
    },
  };
}
// src/query/keys.ts
function O(n) {
  let r = t(n.url, {
    baseURL: n.client?.baseURL,
    path: A(n.path),
  });
  return ["vqr", n.client?.cacheScope ?? "default", "GET", e(r).split("?")[0]];
}
function k(n) {
  let r = O(n),
    i = e(
      a(
        t(n.url, {
          baseURL: n.client?.baseURL,
          path: A(n.path),
          query: n.query,
        }),
      ),
    );
  return [...r, i.split("?")[1] ?? "", n.responseType ?? "auto"];
}
function A(e) {
  return (
    e &&
    Object.fromEntries(
      Object.entries(e).map(([e, t]) => [e, r(e) ? "[redacted]" : t]),
    )
  );
}
// src/composables/useGet.ts
function j(e) {
  let t = T(e.client ?? e.API),
    n = () => {
      let t = _(e.paramRef === void 0 ? void 0 : b(e.paramRef));
      return {
        url: v(f(e.url), t.suffix),
        path: e.path === void 0 ? t.path : f(e.path),
        query: e.query === void 0 ? t.query : f(e.query),
      };
    },
    { queryFn: r, queryKey: i, ...a } = e.options ?? {};
  return c(() => ({
    ...a,
    queryKey:
      e.queryKey === void 0
        ? k({
            ...n(),
            responseType: e.responseType,
            client: t,
          })
        : f(e.queryKey),
    queryFn: ({ signal: r }) => {
      let i = n();
      return t.request({
        method: "GET",
        ...i,
        headers: e.headers === void 0 ? void 0 : f(e.headers),
        responseType: e.responseType,
        signal: r,
      });
    },
  }));
}
// src/composables/useSend.ts
function M(e) {
  let t = T(e.client ?? e.API),
    n = l(),
    { mutationFn: r, mutationKey: i, onSuccess: a, ...o } = e.options ?? {};
  return s({
    ...o,
    mutationKey: e.mutationKey,
    mutationFn: (n) => {
      let r = x(e.config),
        i = _(e.paramRef === void 0 ? void 0 : b(e.paramRef)),
        a = v(typeof e.url == "function" ? e.url(n) : e.url, i.suffix),
        o = e.body
          ? e.body(n)
          : n === void 0
            ? e.bodyRef === void 0
              ? void 0
              : b(e.bodyRef)
            : n;
      return t.request({
        method: e.method.toUpperCase(),
        url: a,
        path: e.path?.(n),
        query: {
          ...r.query,
          ...i.query,
          ...e.query?.(n),
        },
        body: o,
        headers:
          typeof e.headers == "function"
            ? e.headers(n)
            : (e.headers ?? r.headers),
        signal:
          typeof e.signal == "function" ? e.signal(n) : (e.signal ?? r.signal),
        responseType: e.responseType,
      });
    },
    onSuccess: async (t, r, i, o) => {
      let s =
        typeof e.invalidate == "function" ? e.invalidate(t, r) : e.invalidate;
      (s &&
        (await Promise.all(s.map((e) => n.invalidateQueries({ queryKey: e })))),
        await a?.(t, r, i, o));
    },
  });
}
export {
  n as ApiError,
  t as buildUrl,
  D as createFetchClient,
  g as createHttpClient,
  k as getKey,
  O as getKeyPrefix,
  E as provideApi,
  w as useApi,
  j as useGet,
  T as useHttpClient,
  M as useSend,
};
