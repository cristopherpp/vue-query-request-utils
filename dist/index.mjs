import { useQuery as w, useMutation as l } from "@tanstack/vue-query";
import { inject as A, computed as v, unref as f } from "vue";
const d = Symbol("api");
function y() {
  const e = A(d);
  if (!e)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return e;
}
function h(e) {
  return {
    install(r) {
      r.provide(d, e);
    }
  };
}
function k({
  url: e,
  queryKey: r,
  API: a,
  options: n,
  paramRef: p
}) {
  const o = v(() => f(r)), c = y(), s = a ?? c;
  return w({
    queryKey: o.value,
    queryFn: async ({ queryKey: u }) => {
      const t = e;
      if (!t)
        throw new Error(
          `API inválida para el queryKey: ${u.join(", ")}`
        );
      return (await s.get(t, {
        params: p || {}
      })).data;
    },
    ...n
  });
}
function I({
  API: e,
  method: r,
  url: a,
  requestConfig: n,
  options: p,
  mutationKey: o
}) {
  const c = y(), s = e ?? c;
  return l({
    mutationKey: o ? Array.isArray(o) ? o : [o] : void 0,
    mutationFn: async (u) => {
      let t;
      const i = u ?? {};
      switch (r) {
        case "post":
          t = await s.post(a, i, n);
          break;
        case "put":
          t = await s.put(a, i, n);
          break;
        case "patch":
          t = await s.patch(a, i, n);
          break;
        case "delete":
          t = await s.delete(a, {
            ...n,
            data: i
          });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${r}`);
      }
      return t.data;
    },
    ...p
  });
}
export {
  h as provideApi,
  y as useApi,
  k as useGet,
  I as useSend
};
