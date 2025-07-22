import { useQuery as m, useMutation as w } from "@tanstack/vue-query";
import { inject as g, isRef as A, ref as j, computed as P, unref as l } from "vue";
const d = Symbol("api");
function h() {
  const r = g(d);
  if (!r)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return r;
}
function k(r) {
  return {
    install(n) {
      n.provide(d, r);
    }
  };
}
const f = (r) => typeof r == "string" || typeof r == "number" || typeof r == "boolean", p = (r) => {
  throw new Error(`[useGet] Invalida paramRef: ${r}`);
}, u = (r) => {
  if (A(r)) return u(r.value);
  if (Array.isArray(r))
    return r.map((n) => u(n));
  if (typeof r == "object" && r !== null) {
    const n = {};
    for (const o in r)
      n[o] = u(r[o]);
    return n;
  }
  return r;
}, q = (r) => {
  if (r != null && !f(r)) {
    if (Array.isArray(r)) {
      r.every(f) || p("Array values must be string | number | boolean");
      return;
    }
    if (typeof r == "object") {
      if ("path" in r || "query" in r) {
        if (r.path && (!Array.isArray(r.path) || !r.path.every(f)) && p("params.path must be an array of string | number | boolean"), r.query) {
          (typeof r.query != "object" || Array.isArray(r.query)) && p("params.query must be a plain object");
          for (const [o, t] of Object.entries(r.query))
            !f(t) && !(Array.isArray(t) && t.every(f)) && p(`params.query.${o} must be string | number | boolean or array of those`);
        }
        return;
      }
      for (const [o, t] of Object.entries(r))
        !f(t) && !(Array.isArray(t) && t.every(f)) && p(`paramRef.${o} must be string | number | boolean or array of those`);
      return;
    }
    p("Unsopported paramRef type");
  }
}, v = (r, n) => {
  let o = [], t = {};
  const e = u(l(n));
  if (typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    o = [e.toString()];
  else if (Array.isArray(e))
    o = e.map(String);
  else if (e && typeof e == "object")
    if ("path" in e || "query" in e) {
      const i = u(e.path);
      Array.isArray(i) && (o = i.map(String));
      const s = u(e.query);
      typeof s == "object" && s !== null && !Array.isArray(s) && (t = s);
    } else
      t = e;
  const y = o.length > 0 ? `${o.join("/")}` : "", b = Object.keys(t).length > 0 ? `?${new URLSearchParams(Object.entries(t).map(([i, s]) => [i, String(s)])).toString()}` : "";
  return `${r}${y}${b}`;
};
function O({
  url: r,
  queryKey: n,
  API: o,
  options: t,
  paramRef: e
}) {
  if (!r || typeof r != "string")
    throw new Error("Invalid or missing URL");
  const y = A(e) ? e : j(e), b = P(() => {
    const a = l(n), c = u(l(y));
    return [a, JSON.stringify(c)];
  }), i = h(), s = o ?? i;
  return m({
    queryKey: b.value,
    queryFn: async () => {
      const a = u(l(y));
      q(a);
      const c = a ? v(r, a) : r;
      return (await s.get(c)).data;
    },
    ...t
  });
}
function U({
  method: r,
  url: n,
  API: o,
  requestConfig: t,
  options: e,
  mutationKey: y
}) {
  const b = h(), i = o ?? b;
  return w({
    mutationKey: y ? Array.isArray(y) ? y : [y] : void 0,
    mutationFn: async (s) => {
      let a;
      const c = s ?? {};
      switch (r) {
        case "post":
          a = await i.post(n, c, t);
          break;
        case "put":
          a = await i.put(n, c, t);
          break;
        case "patch":
          a = await i.patch(n, c, t);
          break;
        case "delete":
          a = await i.delete(n, {
            ...t,
            data: c
          });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${r}`);
      }
      return a.data;
    },
    ...e
  });
}
export {
  k as provideApi,
  h as useApi,
  O as useGet,
  U as useSend
};
