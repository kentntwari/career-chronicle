<script setup lang="ts">
  const err = useError();
</script>

<template>
  <Head>
    <Title>Error</Title>
  </Head>
  <NuxtLayout>
    <main class="container mt-[4.5rem] lgmt-60">
      <div class="nested-container px-3 lg:px-0">
        <template v-if="err && err.statusCode === 500">
          <div class="space-y-12">
            <p class="font-medium text-base lg:text-xl whitespace-pre-line">
              <span class="block">Sorry,</span><br />
              <span class="block">Something went really wrong.</span>
              <br />
              <span class="block">We're working on it.</span>
            </p>
            <NuxtLink to="/" class="block uppercase text-base"
              >Go back to main page</NuxtLink
            >
          </div>
        </template>
        <template v-else-if="err && err.statusCode === 404">
          <div class="space-y-12">
            <p class="font-medium text-base lg:text-xl whitespace-pre-line">
              <span class="block">Looks like you hit the wrong spot</span><br />
              <span class="block">This page does not exist</span>
            </p>
            <NuxtLink to="/" class="block uppercase text-sm lg:text-base"
              >Go back to main page</NuxtLink
            >
          </div>
        </template>
      </div>
    </main>
  </NuxtLayout>
</template>
