import { useQuery as k, useMutation as I } from "@tanstack/vue-query";
import { inject as D, toValue as b, isRef as v, ref as j } from "vue";
const S = Symbol("api");
function P() {
  const e = D(S);
  if (!e)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return e;
}
function L(e) {
  return {
    install(t) {
      t.provide(S, e);
    }
  };
}
function M(e = "") {
  return {
    async get(t) {
      const n = await fetch(`${e}${t}`);
      if (!n.ok)
        throw new Error(`HTTP error! Status: ${n.status}`);
      return { data: await n.json() };
    },
    async post(t, n) {
      const r = await fetch(`${e}${t}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async put(t, n) {
      const r = await fetch(`${e}${t}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async patch(t, n) {
      const r = await fetch(`${e}${t}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async delete(t, n) {
      const r = await fetch(`${e}${t}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    }
  };
}
const u = (e) => typeof e == "string" || typeof e == "number" || typeof e == "boolean";
class f extends Error {
  constructor(t) {
    super(`[Function] ${t}`), this.name = "Vue Query Request Utils Error";
  }
}
const p = (e) => {
  const t = b(e);
  if (Array.isArray(t))
    return t.map(p);
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = {};
    for (const r in t)
      n[r] = p(t[r]);
    return n;
  }
  return t;
}, E = (e, t = "paramRef") => {
  if (e != null && !u(e)) {
    if (Array.isArray(e)) {
      e.forEach((n, r) => {
        if (!u(n))
          throw new f(`[${t}[${r}]] must be string | number | boolean, got ${typeof n}`);
      });
      return;
    }
    if (typeof e == "object") {
      if ("path" in e || "query" in e) {
        if (e.path && (!Array.isArray(e.path) || !e.path.every(u)))
          throw new f(`[${t}.path] must be an array of string | number | boolean`);
        if (e.query && (typeof e.query != "object" || Array.isArray(e.query)))
          throw new f(`[${t}.query] must be a plain object`);
        if (e.query) {
          for (const [n, r] of Object.entries(e.query))
            if (!u(r) && !(Array.isArray(r) && r.every(u)))
              throw new f(`[${t}.query.${n}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [n, r] of Object.entries(e))
        if (!u(r) && !(Array.isArray(r) && r.every(u)))
          throw new f(`[${t}.${n}] must be string | number | boolean or array of those`);
      return;
    }
    throw new f(`[${t}] Unsupported type: ${typeof e}`);
  }
}, q = (e, t) => {
  let n = [], r = {};
  u(t) ? n = [String(t)] : Array.isArray(t) ? n = t.map(String) : t && typeof t == "object" && ("path" in t || "query" in t ? (Array.isArray(t.path) && (n = t.path.map(String)), t.query && typeof t.query == "object" && !Array.isArray(t.query) && (r = t.query)) : r = t);
  const o = n.length > 0 ? `/${n.join("/")}` : "", s = Object.keys(r).length > 0 ? `?${new URLSearchParams(Object.entries(r).flatMap(([a, i]) => Array.isArray(i) ? i.map((y) => [a, String(i)]) : [[a, String(i)]])).toString()}` : "";
  return `${e}${o}${s}`;
};
function Q({
  url: e,
  queryKey: t,
  API: n,
  options: r,
  paramRef: o
}) {
  if (!e || typeof e != "string")
    throw new Error("Invalid or missing URL");
  const s = v(o) || typeof o == "function" ? o : j(o), a = P(), i = n ?? a;
  if (!i)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function");
  return k({
    queryKey: t,
    queryFn: async () => {
      const y = p(s);
      E(y);
      const c = y ? q(e, y) : e;
      if (typeof i == "string") {
        const h = await fetch(i + c);
        if (!h.ok)
          throw new Error(`HTTP error! Status: ${h.status}`);
        return h.json();
      }
      return (await i.get(c)).data;
    },
    ...r
  });
}
function O(e) {
  return e && typeof e.request == "function";
}
function V({
  method: e,
  url: t,
  API: n,
  paramRef: r,
  bodyRef: o,
  config: s,
  options: a,
  mutationKey: i
}) {
  if (!t || typeof t != "string")
    throw new Error("Invalid or missing URL");
  const y = P(), c = n ?? y;
  if (!c)
    throw new Error("No API instance provided. Provide via API prop or provideApi().");
  const l = r ? v(r) || typeof r == "function" ? r : j(r) : void 0, A = o ? v(o) || typeof o == "function" ? o : j(o) : void 0, h = i ? Array.isArray(i) ? i : [i] : void 0, $ = e.toLowerCase();
  return I({
    mutationKey: h,
    mutationFn: async (g) => {
      let d = t;
      if (l) {
        const T = p(b(l));
        E(T), d = q(t, T);
      }
      let w;
      return g !== void 0 ? w = p(g) : A && (w = p(b(A))), typeof c == "string" ? H(c + d, $, w, s) : O(c) ? N(c, d, $, w, s) : (await c[$](d, w)).data;
    },
    ...a ?? {}
  });
}
async function H(e, t, n, r) {
  const o = {
    "Content-Type": "application/json",
    ...r?.headers ?? {}
  }, s = {
    method: t.toUpperCase(),
    headers: o,
    body: n !== void 0 ? JSON.stringify(n) : void 0,
    ...r ?? {}
  }, a = await fetch(e, s);
  if (!a.ok) {
    let i = {};
    try {
      i = await a.json();
    } catch {
    }
    throw new Error(i?.message || `HTTP error! Status: ${a.status}`);
  }
  return a.json();
}
async function N(e, t, n, r, o) {
  let s;
  switch (n) {
    case "post":
      s = await e.post(t, r, o);
      break;
    case "put":
      s = await e.put(t, r, o);
      break;
    case "patch":
      s = await e.patch(t, r, o);
      break;
    case "delete":
      s = await e.delete(t, {
        ...o,
        data: r
      });
      break;
  }
  return s.data;
}
export {
  M as createFetchClient,
  L as provideApi,
  P as useApi,
  Q as useGet,
  V as useSend
};
