import { useQuery as a } from "@tanstack/vue-query";
import { computed as i, unref as p } from "vue";
function d({
  API: t,
  apiUrl: u,
  queryKey: n,
  options: o,
  paramRef: e
}) {
  const s = i(() => p(n));
  return a(
    {
      queryKey: s.value,
      queryFn: async ({ queryKey: y }) => {
        const r = u;
        if (!r)
          throw new Error(`API inválida para el queryKey: ${y.join(", ")}`);
        return (await t.get(r, {
          params: e || {}
        })).data;
      },
      ...o
    }
  );
}
export {
  d as useGetQuery
};
