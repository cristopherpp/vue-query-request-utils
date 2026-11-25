# vue-query-request-utils

Small HTTP helpers for Vue 3 and TanStack Vue Query. `useGet` and `useSend` handle URL parameters, request bodies, Fetch responses, and errors while returning native TanStack results. Fetch works without client setup.

## Install

```bash
npm install vue-query-request-utils @tanstack/vue-query vue
```

Register TanStack Vue Query once:

```ts
// main.ts
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'

createApp(App).use(VueQueryPlugin).mount('#app')
```

## GET

```vue
<script setup lang="ts">
import { useGet } from 'vue-query-request-utils'

type User = { id: number; name: string }
const { data, isPending, error, refetch } = useGet<User[]>({ url: '/api/users' })
</script>
```

GET requests use Fetch by default. A successful empty response, including HTTP 204, resolves to `null`; use a nullable response type when the endpoint can be empty: `useGet<User | null>(...)`.

### Reactive parameters

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useGet } from 'vue-query-request-utils'

type User = { id: number; name: string }
const page = ref(1)
const userId = ref(7)
const list = useGet<User[]>({ url: '/api/users', query: () => ({ page: page.value }), options: { staleTime: 60_000 } })
const detail = useGet<User>({ url: '/api/users/:id', path: () => ({ id: userId.value }) })
</script>
```

Changing `page` or `userId` changes the generated query key and starts the appropriate request. Explicit `queryKey` values are used exactly as supplied; include all reactive request inputs in an explicit key yourself. Query arrays become repeated parameters (`tag=a&tag=b`). `null` and `undefined` query values are omitted.

## Mutations

```vue
<script setup lang="ts">
import { useSend } from 'vue-query-request-utils'

type User = { id: number; name: string }
type CreateUser = { name: string }
type UpdateUser = { id: number; data: { name: string } }

const createUser = useSend<User, CreateUser>({ method: 'POST', url: '/api/users' })
createUser.mutate({ name: 'John' })

const updateUser = useSend<User, UpdateUser>({
  method: 'PATCH', url: '/api/users/:id',
  path: variables => ({ id: variables.id }),
  body: variables => variables.data,
})
updateUser.mutate({ id: 7, data: { name: 'Jane' } })
</script>
```

Mutation variables become the body unless `body` maps them. For a bodyless request, set `body: () => undefined`. `POST`, `PUT`, `PATCH`, and `DELETE` accept uppercase or lowercase methods. `mutateAsync` returns the response data.

### Opt-in invalidation

```ts
import { getKeyPrefix, useSend } from 'vue-query-request-utils'

const createUser = useSend<{ id: number }, { name: string }>({
  method: 'POST', url: '/api/users',
  invalidate: [getKeyPrefix({ url: '/api/users' })],
})
```

`getKeyPrefix` matches every generated key for the route, including pagination variants. Use `getKey({ url, path, query, client })` for an exact generated key. With a configured client, pass that same client to key helpers. Invalidation is awaited before the mutation's `onSuccess` callback completes. Nothing is invalidated when `invalidate` is omitted.

## Configured Fetch client

```ts
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createHttpClient, provideApi } from 'vue-query-request-utils'
import App from './App.vue'

const app = createApp(App).use(VueQueryPlugin)
const api = createHttpClient({
  baseURL: '/api',
  cacheScope: 'my-api',
  headers: async () => ({ 'X-App-Version': '2' }),
})
app.use(provideApi(api))
```

The `headers` provider runs for each request. You can also pass `client: api` to one composable. Client precedence is explicit `client`, Vue-injected client, then default Fetch. Create clients inside each SSR request when headers contain user credentials. Headers and credentials are never included in generated cache keys. Use a distinct, nonsecret `cacheScope` for APIs or user sessions with different responses at the same paths. Clear the Query cache on logout.

`client.request<TResponse, TBody>({ method, url, path, query, body, headers, signal, responseType })` works without Vue. `responseType` can be `auto` (default), `json`, `text`, or `blob`. Strings and native bodies such as `FormData` pass through; objects, booleans, numbers, and `null` are JSON encoded.

## Axios

```bash
npm install axios
```

```ts
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import axios from 'axios'
import App from './App.vue'
import { createAxiosAdapter } from 'vue-query-request-utils/axios'
import { provideApi } from 'vue-query-request-utils'

const app = createApp(App).use(VueQueryPlugin)
const instance = axios.create({ baseURL: '/api' })
app.use(provideApi(createAxiosAdapter(instance)))
```

Existing Axios interceptors and instance defaults remain active. Axios is an optional peer and is not loaded by the package's main entry point.

## Errors

```ts
import { ApiError, useGet } from 'vue-query-request-utils'

const { error } = useGet<{ id: number }>({ url: '/api/users/7' })
if (error.value instanceof ApiError) {
  console.log(error.value.status, error.value.data)
}
```

HTTP failures include the status and parsed response data. Network failures have `status: null`. Cancelled requests have `name: 'AbortError'` and retain their cause.

## Vue and Nuxt setup

Use `provideApi(api)` in `app.use(...)`, alongside `VueQueryPlugin`. In Nuxt, create the client and install the provider in a Nuxt plugin for each SSR request. The default Fetch client is immutable and contains no user credentials. `useHttpClient()` returns the resolved client without requiring a provider.

## Migrating from 1.x

| 1.x | 2.0 |
| --- | --- |
| `API` | `client` (old option still works) |
| `paramRef` | `path` and `query` (old option still works) |
| `bodyRef` | mutation variables or `body` mapper (old option still works) |
| `config` | `headers`, `signal`, and `params` are mapped; other Axios config fields are not |
| required `queryKey` | optional generated key; explicit keys are unchanged |
| `createFetchClient(baseURL).get<T>(url)` returning `{ data }` | `createHttpClient({ baseURL }).request<T>({ method: 'GET', url })` returning `T` |

Direct Axios instances and legacy clients with `get/post/put/patch/delete` methods remain accepted by `API` or `provideApi`. `useApi()` still reads an injected client and throws when absent; prefer `useHttpClient()` for fallback behavior. Mutations no longer invalidate queries automatically. TanStack mutation state uses `isPending` rather than the old README's `isLoading` name.
