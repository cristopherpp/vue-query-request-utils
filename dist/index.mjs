import { useQuery as $, useMutation as q } from "@tanstack/vue-query";
import { inject as g, isRef as j, ref as S, computed as h, toValue as b, unref as k } from "vue";
const w = Symbol("api");
function v() {
  const r = g(w);
  if (r)
    return r;
}
function G(r) {
  return {
    install(e) {
      e.provide(w, r);
    }
  };
}
const c = (r) => typeof r == "string" || typeof r == "number" || typeof r == "boolean";
class p extends Error {
  constructor(e) {
    super(`[useGet] ${e}`), this.name = "UseGetError";
  }
}
const A = (r) => {
  const e = b(r);
  if (Array.isArray(e))
    return e.map(A);
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const n = {};
    for (const t in e)
      n[t] = A(e[t]);
    return n;
  }
  return e;
}, E = (r, e = "paramRef") => {
  if (r != null && !c(r)) {
    if (Array.isArray(r)) {
      r.forEach((n, t) => {
        if (!c(n))
          throw new p(`[${e}[${t}]] must be string | number | boolean, got ${typeof n}`);
      });
      return;
    }
    if (typeof r == "object") {
      if ("path" in r || "query" in r) {
        if (r.path && (!Array.isArray(r.path) || !r.path.every(c)))
          throw new p(`[${e}.path] must be an array of string | number | boolean`);
        if (r.query && (typeof r.query != "object" || Array.isArray(r.query)))
          throw new p(`[${e}.query] must be a plain object`);
        if (r.query) {
          for (const [n, t] of Object.entries(r.query))
            if (!c(t) && !(Array.isArray(t) && t.every(c)))
              throw new p(`[${e}.query.${n}] must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [n, t] of Object.entries(r))
        if (!c(t) && !(Array.isArray(t) && t.every(c)))
          throw new p(`[${e}.${n}] must be string | number | boolean or array of those`);
      return;
    }
    throw new p(`[${e}] Unsupported type: ${typeof r}`);
  }
}, P = (r, e) => {
  let n = [], t = {};
  c(e) ? n = [String(e)] : Array.isArray(e) ? n = e.map(String) : e && typeof e == "object" && ("path" in e || "query" in e ? (Array.isArray(e.path) && (n = e.path.map(String)), e.query && typeof e.query == "object" && !Array.isArray(e.query) && (t = e.query)) : t = e);
  const a = n.length > 0 ? `${n.join("/")}` : "", s = Object.keys(t).length > 0 ? `?${new URLSearchParams(Object.entries(t).flatMap(([f, o]) => Array.isArray(o) ? o.map((l) => [f, String(o)]) : [[f, String(o)]])).toString()}` : "";
  return `${r}${a}${s}`;
};
function O({
  url: r,
  queryKey: e,
  API: n,
  options: t,
  paramRef: a
}) {
  if (!r || typeof r != "string")
    throw new Error("Invalid or missing URL");
  const s = j(a) ? a : S(a), f = h(() => {
    const y = b(e), i = A(s), u = Array.isArray(y) ? y.map(A) : [A(y)];
    return i && (typeof i == "object" && !Array.isArray(i) && ("path" in i || "query" in i) ? u.push(i.path ?? [], i.query ?? {}) : u.push(i)), u;
  }), o = v(), l = n ?? o;
  if (!l)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  return $({
    queryKey: f.value,
    queryFn: async () => {
      const y = A(k(s));
      E(y);
      const i = y ? P(r, y) : r;
      return (await l.get(i)).data;
    },
    ...t
  });
}
function K({
  API: r,
  method: e,
  url: n,
  requestConfig: t,
  options: a,
  mutationKey: s
}) {
  const f = v(), o = r ?? f, l = h(() => s ? Array.isArray(s) ? s : [s] : void 0);
  if (!o)
    throw new Error("No API instance provided, please provide an api instance via the API prop or use the provideApi function.");
  const y = e.toLowerCase();
  return q({
    mutationKey: l.value,
    mutationFn: async (i) => {
      let u;
      const d = i ?? {};
      switch (y) {
        case "post":
          u = await o.post(n, d, t);
          break;
        case "put":
          u = await o.put(n, d, t);
          break;
        case "patch":
          u = await o.patch(n, d, t);
          break;
        case "delete":
          u = await o.delete(n, {
            ...t,
            data: d
          });
          break;
        default:
          throw new Error(`HTTP method not supported: ${e}`);
      }
      return u.data;
    },
    ...a
  });
}
export {
  G as provideApi,
  v as useApi,
  O as useGet,
  K as useSend
};
