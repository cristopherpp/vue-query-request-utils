import { useQuery as k, useMutation as E } from "@tanstack/vue-query";
import { inject as U, toValue as w, isRef as v, ref as $, computed as q, unref as g } from "vue";
const j = Symbol("api");
function P() {
  const r = U(j);
  if (r)
    return r;
}
function K(r) {
  return {
    install(e) {
      e.provide(j, r);
    }
  };
}
const a = (r) => typeof r == "string" || typeof r == "number" || typeof r == "boolean";
class A extends Error {
  constructor(e) {
    super(`[useGet] ${e}`), this.name = "UseGetError";
  }
}
const f = (r) => {
  const e = w(r);
  if (Array.isArray(e))
    return e.map(f);
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const n = {};
    for (const t in e)
      n[t] = f(e[t]);
    return n;
  }
  return e;
}, S = (r, e = "paramRef") => {
  if (r != null && !a(r)) {
    if (Array.isArray(r)) {
      r.forEach((n, t) => {
        if (!a(n))
          throw new A(`[${e}[${t}]] must be string | number | boolean, got ${typeof n}`);
      });
      return;
    }
    if (typeof r == "object") {
      if ("path" in r || "query" in r) {
        if (r.path && (!Array.isArray(r.path) || !r.path.every(a)))
          throw new A(`[${e}.path] must be an array of string | number | boolean`);
        if (r.query && (typeof r.query != "object" || Array.isArray(r.query)))
          throw new A(`[${e}.query] must be a plain object`);
        if (r.query) {
          for (const [n, t] of Object.entries(r.query))
            if (!a(t) && !(Array.isArray(t) && t.every(a)))
              throw new A(`[${e}.query.${n}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [n, t] of Object.entries(r))
        if (!a(t) && !(Array.isArray(t) && t.every(a)))
          throw new A(`[${e}.${n}] must be string | number | boolean or array of those`);
      return;
    }
    throw new A(`[${e}] Unsupported type: ${typeof r}`);
  }
}, I = (r, e) => {
  let n = [], t = {};
  a(e) ? n = [String(e)] : Array.isArray(e) ? n = e.map(String) : e && typeof e == "object" && ("path" in e || "query" in e ? (Array.isArray(e.path) && (n = e.path.map(String)), e.query && typeof e.query == "object" && !Array.isArray(e.query) && (t = e.query)) : t = e);
  const i = n.length > 0 ? `${n.join("/")}` : "", p = Object.keys(t).length > 0 ? `?${new URLSearchParams(Object.entries(t).flatMap(([s, c]) => Array.isArray(c) ? c.map((y) => [s, String(c)]) : [[s, String(c)]])).toString()}` : "";
  return `${r}${i}${p}`;
};
function L({
  url: r,
  queryKey: e,
  API: n,
  options: t,
  paramRef: i
}) {
  if (!r || typeof r != "string")
    throw new Error("Invalid or missing URL");
  const p = v(i) ? i : $(i), s = q(() => {
    const u = w(e), o = f(p), l = Array.isArray(u) ? u.map(f) : [f(u)];
    return o && (typeof o == "object" && !Array.isArray(o) && ("path" in o || "query" in o) ? l.push(o.path ?? [], o.query ?? {}) : l.push(o)), l;
  }), c = P(), y = n ?? c;
  if (!y)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  return k({
    queryKey: s.value,
    queryFn: async () => {
      const u = f(g(p));
      S(u);
      const o = u ? I(r, u) : r;
      return (await y.get(o)).data;
    },
    ...t
  });
}
function M({
  API: r,
  method: e,
  url: n,
  paramsRef: t,
  requestConfig: i,
  options: p,
  mutationKey: s
}) {
  const c = P(), y = r ?? c, u = q(() => s ? Array.isArray(s) ? s : [s] : void 0);
  if (!y)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  const o = e.toLowerCase(), l = v(t) ? t : $(t);
  return E({
    mutationKey: u.value,
    mutationFn: async () => {
      let d;
      const b = f(g(l));
      S(b);
      const h = b ?? {};
      switch (o) {
        case "post":
          d = await y.post(n, h, i);
          break;
        case "put":
          d = await y.put(n, h, i);
          break;
        case "patch":
          d = await y.patch(n, h, i);
          break;
        case "delete":
          d = await y.delete(n, {
            ...i,
            data: h
          });
          break;
        default:
          throw new Error(`HTTP method not supported: ${e}`);
      }
      return d.data;
    },
    ...p
  });
}
export {
  K as provideApi,
  P as useApi,
  L as useGet,
  M as useSend
};
