<script lang="ts" setup>
  import type { SingleOrg, OrgPos } from "~/types";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const nuxtApp = useNuxtApp();

  const router = useRouter();
  const route = useRoute();

  const {
    data: positions,
    status,
    execute: triggerFetchPositions,
  } = useLazyFetch<OrgPos>(`${route.params.orgSlug}/positions`, {
    key: "positions",
    baseURL: "/api/organization",
    deep: false,
    immediate: false,
    watch: false,
    onRequestError: () => nuxtApp.$abortFetchPositions(),
    onResponseError: () => nuxtApp.$abortFetchPositions(),
    onResponse: () => {
      nuxtApp.$abortFetchPositions();
    },
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 300 });

  watchEffect(() => {
    console.log(nuxtApp.$isFetchPositions.value);
    if (nuxtApp.$isFetchPositions.value) triggerFetchPositions();
  });
</script>

<template>
  <main>
    <NuxtLayout
      name="parent-organization"
      @selected="(org) => router.push(`/organization/${org}`)"
    >
      <template #default="{ organization }: { organization: SingleOrg | null }">
        <section class="container">
          <div class="w-full" v-show="isLoading === 'pending'">
            <app-skeleton-positions />
          </div>
          <div
            class="w-full mt-4 px-3 container"
            v-show="isLoading !== 'pending'"
          >
            <app-data-positions
              :data="positions"
              :parent-organization="organization?.slug ?? ''"
              :is-first-position="
                organization?.hasCreatedPositionBefore ? false : true
              "
            />
          </div>
        </section>
      </template>
    </NuxtLayout>
  </main>
</template>
