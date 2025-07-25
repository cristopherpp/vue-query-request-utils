import { useQuery as w, useMutation as $ } from "@tanstack/vue-query";
import { inject as q, isRef as g, ref as j, computed as v, toValue as b, unref as S } from "vue";
const h = Symbol("api");
function d() {
  const r = q(h);
  if (!r)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return r;
}
function G(r) {
  return {
    install(e) {
      e.provide(h, r);
    }
  };
}
const u = (r) => typeof r == "string" || typeof r == "number" || typeof r == "boolean";
class a extends Error {
  constructor(e) {
    super(`[useGet] ${e}`), this.name = "UseGetError";
  }
}
const l = (r) => {
  const e = b(r);
  if (Array.isArray(e))
    return e.map(l);
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const n = {};
    for (const t in e)
      n[t] = l(e[t]);
    return n;
  }
  return e;
}, k = (r, e = "paramRef") => {
  if (r != null && !u(r)) {
    if (Array.isArray(r)) {
      r.forEach((n, t) => {
        if (!u(n))
          throw new a(`[${e}[${t}]] must be string | number | boolean, got ${typeof n}`);
      });
      return;
    }
    if (typeof r == "object") {
      if ("path" in r || "query" in r) {
        if (r.path && (!Array.isArray(r.path) || !r.path.every(u)))
          throw new a(`[${e}.path] must be an array of string | number | boolean`);
        if (r.query && (typeof r.query != "object" || Array.isArray(r.query)))
          throw new a(`[${e}.query] must be a plain object`);
        if (r.query) {
          for (const [n, t] of Object.entries(r.query))
            if (!u(t) && !(Array.isArray(t) && t.every(u)))
              throw new a(`[${e}.query.${n}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [n, t] of Object.entries(r))
        if (!u(t) && !(Array.isArray(t) && t.every(u)))
          throw new a(`[${e}.${n}] must be string | number | boolean or array of those`);
      return;
    }
    throw new a(`[${e}] Unsupported type: ${typeof r}`);
  }
}, U = (r, e) => {
  let n = [], t = {};
  u(e) ? n = [String(e)] : Array.isArray(e) ? n = e.map(String) : e && typeof e == "object" && ("path" in e || "query" in e ? (Array.isArray(e.path) && (n = e.path.map(String)), e.query && typeof e.query == "object" && !Array.isArray(e.query) && (t = e.query)) : t = e);
  const c = n.length > 0 ? `${n.join("/")}` : "", s = Object.keys(t).length > 0 ? `?${new URLSearchParams(Object.entries(t).flatMap(([f, y]) => Array.isArray(y) ? y.map((A) => [f, String(y)]) : [[f, String(y)]])).toString()}` : "";
  return `${r}${c}${s}`;
};
function I({
  url: r,
  queryKey: e,
  API: n,
  options: t,
  paramRef: c
}) {
  if (!r || typeof r != "string")
    throw new Error("Invalid or missing URL");
  const s = g(c) ? c : j(c), f = v(() => {
    const i = b(e), o = l(s), p = Array.isArray(i) ? i.map(l) : [l(i)];
    return o && (typeof o == "object" && !Array.isArray(o) && ("path" in o || "query" in o) ? p.push(o.path ?? [], o.query ?? {}) : p.push(o)), p;
  }), y = d(), A = n ?? y;
  return w({
    queryKey: f.value,
    queryFn: async () => {
      const i = l(S(s));
      k(i);
      const o = i ? U(r, i) : r;
      return (await A.get(o)).data;
    },
    ...t
  });
}
function O({
  method: r,
  url: e,
  API: n,
  requestConfig: t,
  options: c,
  mutationKey: s
}) {
  const f = d(), y = n ?? f;
  return $({
    mutationKey: s ? Array.isArray(s) ? s : [s] : void 0,
    mutationFn: async (A) => {
      let i;
      const o = A ?? {};
      switch (r) {
        case "post":
          i = await y.post(e, o, t);
          break;
        case "put":
          i = await y.put(e, o, t);
          break;
        case "patch":
          i = await y.patch(e, o, t);
          break;
        case "delete":
          i = await y.delete(e, {
            ...t,
            data: o
          });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${r}`);
      }
      return i.data;
    },
    ...c
  });
}
export {
  G as provideApi,
  d as useApi,
  I as useGet,
  O as useSend
};
