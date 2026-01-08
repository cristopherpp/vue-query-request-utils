# vue-query-request-utils

[![npm version](https://badge.fury.io/js/vue-query-request-utils.svg)](https://www.npmjs.com/package/vue-query-request-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A set of **Vue 3 composables** for simplified HTTP requests (GET, POST, PUT, PATCH, DELETE) using [@tanstack/vue-query](https://tanstack.com/query/latest/docs/framework/vue/overview) with support for Axios or native Fetch.
Effortlessly fetch and mutate data with built-in caching, loading states, error handling, and TypeScript support. Perfect for Vue 3 and Nuxt 3 and 4 projects.

---

## 📦 Features

- 🔁 **Automatic caching and refetching** via `@tanstack/vue-query`
- 📡 **Configurable HTTP client** supporting Axios instances or a custom Fetch-based client for flexible API requests
- ⚙️ **Query parameter support** for GET and mutation requests (dynamic URLs)
- 🔒 **TypeScript-friendly** with fully typed composables
- 📱 **Compatible** with Vue 3 and Nuxt 3 and 4 projects
- 🚀 **Simple API** for both queries (`useGetQuery`) and mutations (`useSend`)
- 🛠️ **Error handling** and loading states out of the box

---

## 📦 Installation

Install the package via npm, Yarn, or pnpm:

```bash
npm install vue-query-request-utils
# or
yarn add vue-query-request-utils
# or
pnpm add vue-query-request-utils
```

## Peer Dependencies

This package requires the following peer dependencies:

**@tanstack/vue-query** (required): Provides the core query and mutation functionality. Install the latest version (e.g., ^5.92.0 as of January 2026) for optimal compatibility.
**vue** (required): The Vue.js framework (version ^3.0.0 or higher).
**axios** (optional): Required only if using Axios as your HTTP client (version ^1.13.2 or higher as of January 2026). If you prefer native Fetch, you can use the built-in createFetchClient utility instead—no Axios needed.

```bash
npm install @tanstack/vue-query vue
```

If using Axios:

```bash
npm install axios
```

## 🚀 Usage

# Setting Up the HTTP Client

You can use either Axios or a Fetch-based client. Provide the client globally (e.g., via provideApi in your app setup or Nuxt plugin) or override per-composable via the API prop.

#### Using Axios

```ts
// api.ts
import axios from 'axios';

export const API = axios.create({
  baseURL: 'https://api.example.com',
});
```

#### Using Fetch (No Axios Required)

```ts
// api.ts
import { createFetchClient } from 'vue-query-request-utils';

export const API = createFetchClient('https://api.example.com');
```

# useGet (GET Requests)

Fetch data with caching and loading states:

```vue
<script setup>
import { useGet } from 'vue-query-request-utils';
import { API } from './api';

const { data, isLoading, error, refetch } = useGet({
  API,
  url: '/users',
  queryKey: ['users'],
  paramRef: { query: { page: 1, limit: 10 } }, // Builds: /users?page=1&limit=10
  options: { enabled: true },
});
</script>

<template>
  <div>
    <button @click="refetch">Refresh</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <ul v-else>
      <li v-for="user in data" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```
## Parameter Examples

## Plain  Query Params:
```ts
paramRef: { page: 1, active: true }
// → /users?page=1&active=true
```

## Dynamic Route Segments:
```ts
paramRef: [123]
// → /users/123
```

## Full Path and Query:
```ts
paramRef: {
  path: [123],
  query: { active: true, page: 1 }
}
// → /users/123?active=true&page=1
```

**paramRef** supports plain values, refs, or computed refs for reactivity.

All of the above support ref or computed values.

# useSend (POST, PUT, PATCH, DELETE Requests)

Perform mutations to create, update, or delete data:

```vue
<script setup>
import { useSend } from 'vue-query-request-utils';
import { API } from './api'; // Axios or Fetch client

const { mutate, isLoading: isMutating, isSuccess, error } = useSend({
  API,
  method: 'post',
  url: '/users',
  mutationKey: ['createUser'],
  options: {
    onSuccess: () => console.log('User created!'),
    onError: (err) => console.error('Error:', err),
  },
});

const createUser = () => {
  mutate({ name: 'John Doe', email: 'john@example.com' });
};
</script>

<template>
  <div>
    <button :disabled="isMutating" @click="createUser">
      {{ isMutating ? 'Creating...' : 'Create User' }}
    </button>
    <div v-if="isSuccess">User created successfully!</div>
    <div v-if="error">{{ error.message }}</div>
  </div>
</template>
```

## With URL Parameters

Similar to useGet, use paramRef for dynamic URLs:

```ts
useSend({
  method: 'patch',
  url: '/users',
  paramRef: { path: [123], query: { version: 2 } }, // Builds: /users/123?version=2
  bodyRef: { name: 'Updated Name' }, // Fallback body if mutate() has no variables
  // ...
});
```

#### With Fallback Body

If `mutate()` is called without variables, `bodyRef` is used (supports reactivity).

## Using with Nuxt 3

The composables work seamlessly with Nuxt 3 and 4. Use them in your setup scripts or provide the Axios instance via a Nuxt plugin:

### Axios

```ts
// plugins/api.ts
import { defineNuxtPlugin } from '#app';
import axios from 'axios';
import { provideApi } from 'vue-query-request-utils'

export default defineNuxtPlugin(() => {
  const API = axios.create({ baseURL: 'https://api.example.com' });
  nuxtApp.vueApp.use(provideApi(API));
});
```

# 🧪 Advanced Usage

## Custom Axios
```ts
useGet({
  API: customAxios,
  url: "/example",
  ...
})
```

### Fetch

```ts
// plugins/api.ts
import { defineNuxtPlugin } from '#app';
import { provideApi, createFetchClient } from 'vue-query-request-utils';

export default defineNuxtPlugin(() => {
  const API = createFetchClient('https://api.example.com');
  nuxtApp.vueApp.use(provideApi(API));
});
```

In components (no `API` prop needed if provided globally):

```vue
<script setup>
import { useGet } from 'vue-query-request-utils';

const { data, isLoading } = useGet({
  apiUrl: '/users',
  queryKey: ['users'],
});
</script>
```

## 📖 API Reference

# useGet
A composable for GET requests with @tanstack/vue-query.

# Parameters:

- url: API endpoint (e.g., /users).
- queryKey: Unique key for caching (e.g., ['users'] or a Vue Ref).
- API?: Override HTTP client (AxiosInstance, HttpClient, or base URL string).
- paramRef?: Optional query parameters (e.g., { page: 1 }).
- options?: Additional useQuery options (e.g., { enabled: false }).

# Returns: `UseQueryResult` with:

- data: Fetched data.
- isLoading: Loading state.
- error: Error details, if any.
- refetch: Function to refetch data.


# useSend
A composable for POST, PUT, PATCH, or DELETE requests.

# Parameters:

- method: HTTP method (post, put, patch, delete).
- url: API endpoint (e.g., /users).
- API?: Override HTTP client (AxiosInstance, HttpClient, or base URL string).
- paramRef?: Optional URL parameters (supports path/query; reactive).
- bodyRef?: Fallback request body (reactive; used if mutate() has no variables).
- config?: Extra request config (AxiosRequestConfig or RequestInit).
- mutationKey?: Unique key for the mutation (e.g., ['createUser']).
- options?: Additional useMutation options (e.g., { onSuccess }).

# Returns: `UseMutationResult` with properties like:

- mutate: Function to trigger the mutation.
- isLoading: Mutation in progress.
- isSuccess: Mutation success state.
- data: Response data.
- error: Error details, if any.
