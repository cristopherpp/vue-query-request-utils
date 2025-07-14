this is right, i think this is everything i need for now:
# vue-query-request-utils

[![npm version](https://badge.fury.io/js/vue-query-request-utils.svg)](https://www.npmjs.com/package/vue-query-request-utils)
[![Build Status](https://github.com/cristophdev/vue-query-request-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/cristophdev/vue-query-request-utils/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A set of **Vue 3 composables** for simplified HTTP requests (GET, POST, PUT, PATCH, DELETE) using [@tanstack/vue-query](https://tanstack.com/query/latest/docs/framework/vue/overview) and Axios.  
Effortlessly fetch and mutate data with built-in caching, loading states, error handling, and TypeScript support. Perfect for Vue 3 and Nuxt 3 projects.

---

## 📦 Features

- 🔁 **Automatic caching and refetching** via `@tanstack/vue-query`
- 📡 **Configurable Axios instance** for flexible API requests
- ⚙️ **Query parameter support** for GET requests
- 🔒 **TypeScript-friendly** with fully typed composables
- 📱 **Compatible** with Vue 3 and Nuxt 3 projects
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

Ensure the following dependencies are installed in your project:

```bash
npm install @tanstack/vue-query axios vue
```
## 🚀 Usage

# Setting Up Axios

Create an Axios instance to use with the composables:

```ts
// api.ts
import axios from 'axios';

export const API = axios.create({
  baseURL: 'https://api.example.com',
});
```

# useGetQuery (GET Requests)

Fetch data with caching and loading states:

```vue
<script setup>
import { useGetQuery } from 'vue-query-request-utils';
import { API } from './api';

const { data, isLoading, error, refetch } = useGetQuery({
  API,
  apiUrl: '/users',
  queryKey: ['users'],
  paramRef: { page: 1, limit: 10 },
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

# useSend (POST, PUT, PATCH, DELETE Requests)

Perform mutations to create, update, or delete data:

```vue
<script setup>
import { useSend } from 'vue-query-request-utils';
import { API } from './api';

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

## Using with Nuxt 3

The composables work seamlessly with Nuxt 3. Use them in your setup scripts or provide the Axios instance via a Nuxt plugin:

```ts
// plugins/api.ts
import { defineNuxtPlugin } from '#app';
import axios from 'axios';

export default defineNuxtPlugin(() => {
  const API = axios.create({ baseURL: 'https://api.example.com' });
  return { provide: { API } };
});
```

```vue
<script setup>
import { useGetQuery } from 'vue-query-request-utils';
const { API } = useNuxtApp();

const { data, isLoading } = useGetQuery({
  API,
  apiUrl: '/users',
  queryKey: ['users'],
});
</script>
```

## 📖 API Reference

# useGetQuery
A composable for GET requests with @tanstack/vue-query.

# Parameters:

- ``API``: Axios instance for making requests.
- ``apiUrl``: API endpoint (e.g., /users).
- ``queryKey``: Unique key for caching (e.g., ['users'] or a Vue Ref).
- ``paramRef?``: Optional query parameters (e.g., { page: 1 }).
- ``options?``: Additional useQuery options (e.g., { enabled: false }).
- ``Returns``: UseQueryResult with properties like:

- ``data``: Fetched data.
- ``isLoading``: Loading state.
- ``error``: Error details, if any.
- ``refetch``: Function to refetch data.


# useSend
A composable for POST, PUT, PATCH, or DELETE requests.

# Parameters:

- ``API``: Axios instance for making requests.
- ``method``: HTTP method (post, put, patch, delete).
- ``url``: API endpoint (e.g., /users).
- ``requestConfig?``: Optional Axios request config (e.g., { headers: {} }).
- ``mutationKey?``: Unique key for the mutation (e.g., ['createUser']).
- ``options?``: Additional useMutation options (e.g., { onSuccess }).
- ``Returns``: UseMutationResult with properties like:

- ``mutate``: Function to trigger the mutation.
- ``isLoading``: Mutation in progress.
- ``isSuccess``: Mutation success state.
- ``data``: Response data.
- ``error``: Error details, if any.