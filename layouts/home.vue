<script lang="ts" setup>
  useHead({ htmlAttrs: { class: "bg-[#85ACF1]" } });
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] flex flex-col">
    <nav class="bg-top-nav h-16 px-3 border border-neutral-grey-600">
      <div class="w-full h-full container flex items-center justify-between">
        <NuxtLink to="/" class="logo" aria-label="CareerChronicle">
          CareerChronicle
        </NuxtLink>
        <ui-button
          @click="
            async () => {
              return await navigateTo('/organizations');
            }
          "
          class="bg-[#654000]"
          >Get started</ui-button
        >
      </div>
    </nav>
    <main class="px-3 pb-5 flex-1">
      <slot />
    </main>
  </div>
</template>
