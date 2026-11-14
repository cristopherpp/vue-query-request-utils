// \0rolldown/runtime.js
var e = Object.defineProperty,
  t = /* @__PURE__ */ ((t, n) => {
    let r = {};
    for (var i in t)
      e(r, i, {
        get: t[i],
        enumerable: !0,
      });
    return (n || e(r, Symbol.toStringTag, { value: "Module" }), r);
  })({ buildUrl: () => n });
function n(e, t = {}) {
  if (!e) throw Error("Request URL is required");
  let n = e.indexOf("#"),
    r = n < 0 ? "" : e.slice(n),
    i = n < 0 ? e : e.slice(0, n),
    a = i.indexOf("?"),
    o = a < 0 ? i : i.slice(0, a),
    s = a < 0 ? "" : i.slice(a + 1),
    c = t.baseURL?.replace(/\/$/, "");
  (c &&
    !/^[a-z][a-z\d+.-]*:\/\//i.test(o) &&
    (o = `${c}/${o.replace(/^\//, "")}`),
    (o = o.replace(/:([A-Za-z_][\w]*)/g, (e, n) => {
      let r = t.path?.[n];
      if (r == null) throw Error(`Missing path parameter: ${n}`);
      return encodeURIComponent(String(r));
    })));
  let l = new URLSearchParams(s);
  for (let [e, n] of Object.entries(t.query ?? {})) {
    l.delete(e);
    for (let t of Array.isArray(n) ? n : [n])
      t != null && l.append(e, String(t));
  }
  let u = l.toString();
  return `${o}${u ? `?${u}` : ""}${r}`;
}
function r(e) {
  let t = e.indexOf("#"),
    n = t < 0 ? e : e.slice(0, t),
    r = n.indexOf("?");
  if (r < 0) return n;
  let i = [...new URLSearchParams(n.slice(r + 1)).entries()].sort(([e], [t]) =>
      e.localeCompare(t),
    ),
    a = new URLSearchParams(i).toString();
  return `${n.slice(0, r)}${a ? `?${a}` : ""}`;
}
function i(e) {
  e = e.replace(/^([a-z][a-z\d+.-]*:\/\/)[^/@]+@/i, "$1");
  let t = e.indexOf("#"),
    n = t < 0 ? "" : e.slice(t),
    r = t < 0 ? e : e.slice(0, t),
    i = r.indexOf("?");
  if (i < 0) return e;
  let o = new URLSearchParams(r.slice(i + 1));
  for (let e of [...o.keys()]) a(e) && o.delete(e);
  let s = o.toString();
  return `${r.slice(0, i)}${s ? `?${s}` : ""}${n}`;
}
function a(e) {
  return /^(?:authorization|auth[_-]?token|access[_-]?token|refresh[_-]?token|id[_-]?token|api[_-]?key|password|secret|credential|token)$/i.test(
    e,
  );
}
// src/core/errors.ts
var o = class extends Error {
  status;
  data;
  method;
  url;
  cause;
  constructor(e) {
    (super(e.message),
      (this.name = "ApiError"),
      (this.status = e.status),
      (this.data = e.data),
      (this.method = e.method),
      (this.url = i(e.url)),
      (this.cause = e.cause));
  }
};
function s(e, t, n) {
  if (e instanceof o) return e;
  let r =
      typeof e == "object" &&
      !!e &&
      "name" in e &&
      (e.name === "AbortError" || e.name === "CanceledError"),
    i = new o({
      message: r
        ? "Request cancelled"
        : e instanceof Error
          ? e.message
          : "Network request failed",
      status: null,
      method: t,
      url: n,
      cause: e,
    });
  return (r && (i.name = "AbortError"), i);
}
// src/core/transport/axios.ts
function c(e, t = e.defaults.baseURL ?? "default") {
  return {
    baseURL: e.defaults.baseURL,
    cacheScope: t,
    async request(t) {
      let r = n(t.url, {
        path: t.path,
        query: t.query,
      });
      try {
        let n = await e.request({
          url: r,
          method: t.method,
          data: t.body,
          headers: t.headers
            ? Object.fromEntries(new Headers(t.headers).entries())
            : void 0,
          signal: t.signal,
          responseType:
            t.responseType === "blob"
              ? "blob"
              : t.responseType === "text"
                ? "text"
                : void 0,
        });
        if (n.status < 200 || n.status >= 300)
          throw new o({
            message: u(n.data, n.status),
            status: n.status,
            data: n.data,
            method: t.method,
            url: r,
          });
        return n.status === 204 || n.status === 205 || n.data === ""
          ? null
          : n.data;
      } catch (e) {
        let n =
          typeof e == "object" && e && "response" in e ? e.response : void 0;
        throw l(n)
          ? new o({
              message: u(n.data, n.status),
              status: n.status,
              data: n.data,
              method: t.method,
              url: r,
              cause: e,
            })
          : s(e, t.method, r);
      }
    },
  };
}
function l(e) {
  return (
    typeof e == "object" &&
    !!e &&
    "status" in e &&
    typeof e.status == "number" &&
    "data" in e
  );
}
function u(e, t) {
  return typeof e == "object" &&
    e &&
    "message" in e &&
    typeof e.message == "string"
    ? e.message
    : `HTTP ${t}`;
}
export { r as a, t as c, n as i, o as n, a as o, s as r, i as s, c as t };
