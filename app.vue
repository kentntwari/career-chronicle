<script setup lang="ts">
  useHead({
    title: "Career Journey",
    htmlAttrs: {
      class: "bg-site",
    },
    bodyAttrs: {
      class: "font-body text-base",
    },
  });
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col">
    <nav class="bg-top-nav h-16 px-3">
      <div class="w-full h-full container flex items-center justify-between">
        <div class="font-bold text-md text-logo">CareerChronicle</div>
      </div>
    </nav>
    <main class="flex-1 container">
      <NuxtPage />
    </main>
  </div>
</template>
