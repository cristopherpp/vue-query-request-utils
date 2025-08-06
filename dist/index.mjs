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
      return;
    }
    throw new c(`[${r}] Unsupported type: ${typeof e}`);
  }
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
    },
    ...t
  });
}
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
};
