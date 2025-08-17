import { useQuery as $, useMutation as b } from "@tanstack/vue-query";
import { inject as v, isRef as g, ref as j, computed as h, toValue as w } from "vue";
const l = Symbol("api");
function A() {
  const e = v(l);
  if (!e)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return e;
}
function P(e) {
  return {
    install(r) {
      r.provide(l, e);
    }
  };
}
function m(e = "") {
  return {
    async get(r) {
      const n = await fetch(`${e}${r}`);
      if (!n.ok)
        throw new Error(`HTTP error! Status: ${n.status}`);
      return { data: await n.json() };
    },
    async post(r, n) {
      const t = await fetch(`${e}${r}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!t.ok)
        throw new Error(`HTTP error! Status: ${t.status}`);
      return { data: await t.json() };
    },
    async put(r, n) {
      const t = await fetch(`${e}${r}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!t.ok)
        throw new Error(`HTTP error! Status: ${t.status}`);
      return { data: await t.json() };
    },
    async patch(r, n) {
      const t = await fetch(`${e}${r}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!t.ok)
        throw new Error(`HTTP error! Status: ${t.status}`);
      return { data: await t.json() };
    },
    async delete(r, n) {
      const t = await fetch(`${e}${r}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: n ? JSON.stringify(n) : void 0
      });
      if (!t.ok)
        throw new Error(`HTTP error! Status: ${t.status}`);
      return { data: await t.json() };
    }
  };
}
const c = (e) => typeof e == "string" || typeof e == "number" || typeof e == "boolean";
class y extends Error {
  constructor(r) {
    super(`[useGet] ${r}`), this.name = "UseGetError";
  }
}
const d = (e) => {
  const r = w(e);
  if (Array.isArray(r))
    return r.map(d);
  if (r && typeof r == "object" && !Array.isArray(r)) {
    const n = {};
    for (const t in r)
      n[t] = d(r[t]);
    return n;
  }
  return r;
}, S = (e, r = "paramRef") => {
  if (e != null && !c(e)) {
    if (Array.isArray(e)) {
      e.forEach((n, t) => {
        if (!c(n))
          throw new y(`[${r}[${t}]] must be string | number | boolean, got ${typeof n}`);
      });
      return;
    }
    if (typeof e == "object") {
      if ("path" in e || "query" in e) {
        if (e.path && (!Array.isArray(e.path) || !e.path.every(c)))
          throw new y(`[${r}.path] must be an array of string | number | boolean`);
        if (e.query && (typeof e.query != "object" || Array.isArray(e.query)))
          throw new y(`[${r}.query] must be a plain object`);
        if (e.query) {
          for (const [n, t] of Object.entries(e.query))
            if (!c(t) && !(Array.isArray(t) && t.every(c)))
              throw new y(`[${r}.query.${n}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [n, t] of Object.entries(e))
        if (!c(t) && !(Array.isArray(t) && t.every(c)))
          throw new y(`[${r}.${n}] must be string | number | boolean or array of those`);
      return;
    }
    throw new y(`[${r}] Unsupported type: ${typeof e}`);
  }
}, T = (e, r) => {
  let n = [], t = {};
  const o = w(r);
  if (o == null)
    return e;
  c(o) ? n = [String(o)] : Array.isArray(o) ? n = o.map(String) : typeof o == "object" && ("path" in o || "query" in o ? (Array.isArray(o.path) && (n = o.path.map(String)), o.query && typeof o.query == "object" && !Array.isArray(o.query) && (t = o.query)) : t = o);
  const a = n.length > 0 ? `/${n.join("/")}` : "", p = Object.keys(t).length > 0 ? `?${new URLSearchParams(
    Object.entries(t).flatMap(
      ([i, u]) => Array.isArray(u) ? u.map((s) => [i, String(s)]) : [[i, String(u)]]
    )
  ).toString()}` : "";
  return `${e}${a}${p}`;
};
function O({
  url: e,
  queryKey: r,
  API: n,
  options: t,
  paramRef: o
}) {
  if (!e || typeof e != "string")
    throw new Error("Invalid or missing URL");
  const a = g(o) || typeof o == "function" ? o : j(o), p = h(() => w(r).map(d)), i = A(), u = n ?? i;
  if (!u)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function");
  return $({
    queryKey: p.value,
    queryFn: async () => {
      const s = d(a);
      S(s);
      const f = s != null ? T(e, s) : e;
      return (await u.get(f)).data;
    },
    ...t
  });
}
function C({
  method: e,
  url: r,
  API: n,
  requestConfig: t,
  options: o,
  mutationKey: a
}) {
  const p = A(), i = n ?? p, u = h(() => a ? Array.isArray(a) ? a : [a] : void 0);
  if (!i)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  return e.toLowerCase(), b({
    mutationKey: u.value,
    mutationFn: async (s) => {
      const f = s ?? {};
      return (await (i instanceof Object && "defaults" in i ? i[e](r, f, t) : i[e](r, f))).data;
    },
    ...o
  });
}
export {
  m as createFetchClient,
  P as provideApi,
  A as useApi,
  O as useGet,
  C as useSend
};
