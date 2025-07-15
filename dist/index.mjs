import { useQuery as l, useMutation as A } from "@tanstack/vue-query";
import { inject as w, computed as h, unref as v } from "vue";
const d = Symbol("api");
function y() {
  const r = w(d);
  if (!r)
    throw new Error(
      "No API instance provided. You must call provideApi() in your app setup."
    );
  return r;
}
function I(r) {
  return {
    install(e) {
      e.provide(d, r);
    }
  };
}
function E({
  url: r,
  queryKey: e,
  API: p,
  options: a,
  paramRef: s
}) {
  const n = h(() => v(e)), c = y(), t = p ?? c;
  if (!t)
    throw new Error(
      "No Axios instance provided. Either pass API param or install your API plugin."
    );
  return l({
    queryKey: n.value,
    queryFn: async ({ queryKey: u }) => {
      const o = r;
      if (!o)
        throw new Error(
          `API inválida para el queryKey: ${u.join(", ")}`
        );
      return (await t.get(o, {
        params: s || {}
      })).data;
    },
    ...a
  });
}
function P({
  method: r,
  url: e,
  API: p,
  requestConfig: a,
  options: s,
  mutationKey: n
}) {
  const c = y(), t = p ?? c;
  if (!t)
    throw new Error(
      "No Axios instance provided. Either pass API param or install your API plugin."
    );
  return A({
    mutationKey: n ? Array.isArray(n) ? n : [n] : void 0,
    mutationFn: async (u) => {
      let o;
      const i = u ?? {};
      switch (r) {
        case "post":
          o = await t.post(e, i, a);
          break;
        case "put":
          o = await t.put(e, i, a);
          break;
        case "patch":
          o = await t.patch(e, i, a);
          break;
        case "delete":
          o = await t.delete(e, {
            ...a,
            data: i
          });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${r}`);
      }
      return o.data;
    },
    ...s
  });
}
export {
  I as provideApi,
  y as useApi,
  E as useGet,
  P as useSend
};
