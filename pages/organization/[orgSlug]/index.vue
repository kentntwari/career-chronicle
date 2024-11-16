<script lang="ts" setup>
  import type { FetchResponse } from "ofetch";
  import type { SingleOrg, OrgPos } from "~/types";

  import { useCurrentRouteOrg } from "~/composables/useCurrentRouteOrg";

  definePageMeta({
    middleware: ["protected"],
    layout: false,
  });

  const nuxtApp = useNuxtApp();

  const currentOrg = useCurrentRouteOrg();
  const computedParams = computed(() => `/${currentOrg.value}/positions`);

  const toRefKey = useOrgPositionsKey();
  const nuxtData_positions = useNuxtData<OrgPos>(toRefKey.value);

  const {
    data: positions,
    status,
    execute: triggerFetchPositions,
  } = useLazyFetch<OrgPos>(computedParams, {
    key: toRefKey.value,
    baseURL: "/api/organization",
    deep: false,
    immediate: false,
    watch: false,
    onRequestError: () => nuxtApp.$abortFetchPositions(),
    onResponseError: () => nuxtApp.$abortFetchPositions(),
    onResponse: ({ response }: { response: FetchResponse<OrgPos> }) => {
      nuxtApp.$abortFetchPositions();
      if (!nuxtData_positions.data.value)
        nuxtApp.payload.data[toRefKey.value] = response._data;
    },
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 300 });

  watchEffect(() => {
    if (nuxtApp.$isFetchPositions.value) triggerFetchPositions();
  });
</script>

<template>
  <main>
    <NuxtLayout name="parent-organization">
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
