<template>
  <section>
    <div>
      <button @click="postSubmit">Send Post</button>
      <p v-if="postSuccess">Post Success!</p>
    </div>
    <div>
      <button @click="putSubmit">Send Put</button>
      <p v-if="putSuccess">Put Success!</p>
    </div>
    <div>
      <button @click="patchSubmit">Send Patch</button>
      <p v-if="patchSuccess">Patch Success!</p>
    </div>
    <div>
      <button @click="deleteSubmit">Send Delete</button>
      <p v-if="deleteSuccess">Delete Success!</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from "axios";
import useSend from "./useSendMutation";

interface Response {
  id: number;
  title?: string;
  body?: string;
  userId?: number;
}

interface Request {
  title?: string;
  body?: string;
  userId?: number;
}

const api = axios.create({ baseURL: "https://jsonplaceholder.typicode.com" });

const { mutate: post, isSuccess: postSuccess } = useSend<Response, Request>({
  API: api,
  url: "/posts",
  method: "post",
});

const { mutate: put, isSuccess: putSuccess } = useSend<Response, Request>({
  API: api,
  url: "/posts/101",
  method: "put",
});

const { mutate: patch, isSuccess: patchSuccess } = useSend<Response, Request>({
  API: api,
  url: "/posts/101",
  method: "patch",
});

const { mutate: remove, isSuccess: deleteSuccess } = useSend<Response, void>({
  API: api,
  url: "/posts/101",
  method: "delete",
});

const postSubmit = () => {
  post({ title: "Test", body: "bar", userId: 1 });
};

const putSubmit = () => {
  put({ title: "Updated", body: "bar", userId: 1 });
};

const patchSubmit = () => {
  patch({ title: "Partially Updated" });
};

const deleteSubmit = () => {
  remove();
};
</script>
