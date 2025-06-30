<template>
  <div>
    <img :src="imageURL" alt="Random Cat" />
    <div>Cat Image</div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import useGet from "./useGetQuery.ts";
import { watch, ref } from "vue";

interface Cat {
  id: string;
  url: string;
  width: number;
  height: number;
}

const api = axios.create({
  baseURL: "https://api.thecatapi.com/v1",
});

const imageURL = ref<string>()

const { data } = useGet<Cat>({
  API: api,
  queryKey: ["Cats"],
  apiUrl: "/images/search",
});

watch(data, (newData) => {
  if (newData) {
    imageURL.value = newData.url
  }
})
</script>