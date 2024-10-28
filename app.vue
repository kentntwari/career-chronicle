<script setup lang="ts">
  useHead({
    title: "Career Journey",
    htmlAttrs: {
      lang: "en",
      class: "bg-site",
    },
    bodyAttrs: {
      class: "font-body text-base text-body",
    },
  });
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col">
    <app-navigation></app-navigation>
    <div class="flex-1 container">
      <NuxtPage />
    </div>
  </div>
</template>
