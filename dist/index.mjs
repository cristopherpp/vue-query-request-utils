<<<<<<< HEAD
import { useQuery as w, useMutation as m } from "@tanstack/vue-query";
import { inject as $, isRef as l, ref as g, computed as j, unref as h } from "vue";
const A = Symbol("api");
function b() {
  const t = $(A);
  if (!t)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return t;
}
function q(t) {
  return {
    install(n) {
      n.provide(A, t);
    }
  };
}
function O(t = "") {
  return {
    async get(n) {
      const e = await fetch(`${t}${n}`);
      if (!e.ok)
        throw new Error(`HTTP error! Status: ${e.status}`);
      return { data: await e.json() };
    },
    async post(n, e) {
      const r = await fetch(`${t}${n}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: e ? JSON.stringify(e) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async put(n, e) {
      const r = await fetch(`${t}${n}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: e ? JSON.stringify(e) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async patch(n, e) {
      const r = await fetch(`${t}${n}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: e ? JSON.stringify(e) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    },
    async delete(n, e) {
      const r = await fetch(`${t}${n}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: e ? JSON.stringify(e) : void 0
      });
      if (!r.ok)
        throw new Error(`HTTP error! Status: ${r.status}`);
      return { data: await r.json() };
    }
  };
}
const u = (t) => typeof t == "string" || typeof t == "number" || typeof t == "boolean", p = (t) => {
  throw new Error(`[useGet] Invalida paramRef: ${t}`);
}, y = (t) => {
  if (l(t)) return y(t.value);
  if (Array.isArray(t))
    return t.map((n) => y(n));
  if (typeof t == "object" && t !== null) {
    const n = {};
    for (const e in t)
      n[e] = y(t[e]);
    return n;
  }
  return t;
}, P = (t) => {
  if (t != null && !u(t)) {
    if (Array.isArray(t)) {
      t.every(u) || p("Array values must be string | number | boolean");
      return;
    }
    if (typeof t == "object") {
      if ("path" in t || "query" in t) {
        if (t.path && (!Array.isArray(t.path) || !t.path.every(u)) && p("params.path must be an array of string | number | boolean"), t.query) {
          (typeof t.query != "object" || Array.isArray(t.query)) && p("params.query must be a plain object");
          for (const [e, r] of Object.entries(t.query))
            !u(r) && !(Array.isArray(r) && r.every(u)) && p(`params.query.${e} must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [e, r] of Object.entries(t))
        !u(r) && !(Array.isArray(r) && r.every(u)) && p(`paramRef.${e} must be string | number | boolean or array of those`);
=======
import { useQuery as $, useMutation as g } from "@tanstack/vue-query";
import { inject as q, isRef as j, ref as S, computed as h, toValue as b } from "vue";
const w = Symbol("api");
function v() {
  const e = q(w);
  if (e)
    return e;
}
function I(e) {
  return {
    install(r) {
      r.provide(w, e);
    }
  };
}
const y = (e) => typeof e == "string" || typeof e == "number" || typeof e == "boolean";
class c extends Error {
  constructor(r) {
    super(`[useGet] ${r}`), this.name = "UseGetError";
  }
}
const d = (e) => {
  const r = b(e);
  if (Array.isArray(r))
    return r.map(d);
  if (r && typeof r == "object" && !Array.isArray(r)) {
    const o = {};
    for (const t in r)
      o[t] = d(r[t]);
    return o;
  }
  return r;
}, m = (e, r = "paramRef") => {
  if (e != null && !y(e)) {
    if (Array.isArray(e)) {
      e.forEach((o, t) => {
        if (!y(o))
          throw new c(`[${r}[${t}]] must be string | number | boolean, got ${typeof o}`);
      });
      return;
    }
    if (typeof e == "object") {
      if ("path" in e || "query" in e) {
        if (e.path && (!Array.isArray(e.path) || !e.path.every(y)))
          throw new c(`[${r}.path] must be an array of string | number | boolean`);
        if (e.query && (typeof e.query != "object" || Array.isArray(e.query)))
          throw new c(`[${r}.query] must be a plain object`);
        if (e.query) {
          for (const [o, t] of Object.entries(e.query))
            if (!y(t) && !(Array.isArray(t) && t.every(y)))
              throw new c(`[${r}.query.${o}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [o, t] of Object.entries(e))
        if (!y(t) && !(Array.isArray(t) && t.every(y)))
          throw new c(`[${r}.${o}] must be string | number | boolean or array of those`);
>>>>>>> a02323d2dc5e275cbf4c07056c10d0b005e6882b
      return;
    }
    throw new c(`[${r}] Unsupported type: ${typeof e}`);
  }
<<<<<<< HEAD
}, S = (t, n) => {
  let e = [], r = {};
  const o = y(h(n));
  if (typeof o == "string" || typeof o == "number" || typeof o == "boolean")
    e = [o.toString()];
  else if (Array.isArray(o))
    e = o.map(String);
  else if (o && typeof o == "object")
    if ("path" in o || "query" in o) {
      const s = y(o.path);
      Array.isArray(s) && (e = s.map(String));
      const a = y(o.query);
      typeof a == "object" && a !== null && !Array.isArray(a) && (r = a);
    } else
      r = o;
  const i = e.length > 0 ? `${e.join("/")}` : "", f = Object.keys(r).length > 0 ? `?${new URLSearchParams(Object.entries(r).map(([s, a]) => [s, String(a)])).toString()}` : "";
  return `${t}${i}${f}`;
};
function E({
  url: t,
  queryKey: n,
  API: e,
  options: r,
  paramRef: o
}) {
  if (!t || typeof t != "string")
    throw new Error("Invalid or missing URL");
  const i = l(o) ? o : g(o), f = j(() => {
    const c = h(n), d = y(h(i));
    return [c, JSON.stringify(d)];
  }), s = b(), a = e ?? s;
  if (!a)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function");
  return w({
    queryKey: f.value,
    queryFn: async () => {
      const c = y(h(i));
      P(c);
      const d = c ? S(t, c) : t;
      return (await a.get(d)).data;
=======
}, E = (e, r) => {
  let o = [], t = {};
  const n = b(r);
  if (n == null)
    return e;
  y(n) ? o = [String(n)] : Array.isArray(n) ? o = n.map(String) : typeof n == "object" && ("path" in n || "query" in n ? (Array.isArray(n.path) && (o = n.path.map(String)), n.query && typeof n.query == "object" && !Array.isArray(n.query) && (t = n.query)) : t = n);
  const a = o.length > 0 ? `/${o.join("/")}` : "", f = Object.keys(t).length > 0 ? `?${new URLSearchParams(
    Object.entries(t).flatMap(
      ([i, u]) => Array.isArray(u) ? u.map((s) => [i, String(s)]) : [[i, String(u)]]
    )
  ).toString()}` : "";
  return `${e}${a}${f}`;
};
function U({
  url: e,
  queryKey: r,
  API: o,
  options: t,
  paramRef: n
}) {
  if (!e || typeof e != "string")
    throw new Error("Invalid or missing URL");
  const a = j(n) || typeof n == "function" ? n : S(n), f = h(() => b(r).map(d)), i = v(), u = o ?? i;
  if (!u)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  return $({
    queryKey: f.value,
    queryFn: async () => {
      const s = d(a);
      m(s);
      const A = s != null ? E(e, s) : e;
      return (await u.get(A)).data;
>>>>>>> a02323d2dc5e275cbf4c07056c10d0b005e6882b
    },
    ...r
  });
}
<<<<<<< HEAD
function k({
  method: t,
  url: n,
  API: e,
  requestConfig: r,
  options: o,
  mutationKey: i
}) {
  const f = b(), s = e ?? f;
  return m({
    mutationKey: i ? Array.isArray(i) ? i : [i] : void 0,
    mutationFn: async (a) => {
      const c = a ?? {};
      return (await (s instanceof Object && "defaults" in s ? s[t](n, c, r) : s[t](n, c))).data;
    },
    ...o
  });
}
export {
  O as createFetchClient,
  q as provideApi,
  b as useApi,
  E as useGet,
  k as useSend
=======
function G({
  method: e,
  url: r,
  API: o,
  requestConfig: t,
  options: n,
  mutationKey: a
}) {
  const f = v(), i = o ?? f, u = h(() => a ? Array.isArray(a) ? a : [a] : void 0);
  if (!i)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  const s = e.toLowerCase();
  return g({
    mutationKey: u.value,
    mutationFn: async (A) => {
      let p;
      const l = A ?? {};
      switch (s) {
        case "post":
          p = await i.post(r, l, t);
          break;
        case "put":
          p = await i.put(r, l, t);
          break;
        case "patch":
          p = await i.patch(r, l, t);
          break;
        case "delete":
          p = await i.delete(r, {
            ...t,
            data: l
          });
          break;
        default:
          throw new Error(`HTTP method not supported: ${e}`);
      }
      return p.data;
    },
    ...n
  });
}
export {
  I as provideApi,
  v as useApi,
  U as useGet,
  G as useSend
>>>>>>> a02323d2dc5e275cbf4c07056c10d0b005e6882b
};
