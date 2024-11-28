<script lang="ts" setup>
  import type { UseFetchOptions } from "nuxt/app";
  import type { FetchResponse } from "ofetch";
  import type { SingleOrg } from "~/types";

  const emit = defineEmits<{
    selected: [org: SingleOrg["slug"]];
  }>();

  const route = useRoute();

  const isOrganizationPath = useMatchOrganizationPath();

  const { $isFetchPositions, $fetchPositions, $abortFetchPositions } =
    useNuxtApp();

  const k = useOrganizationKey();
  const OPTIONS: UseFetchOptions<SingleOrg> = {
    key: k.value,
    baseURL: "/api/organization",
    onRequest: () => {
      if ($isFetchPositions.value) $abortFetchPositions();
    },
    onResponse: ({ response }: { response: FetchResponse<SingleOrg> }) => {
      if (response._data?.hasCreatedPositionBefore && isOrganizationPath.value)
        $fetchPositions();

      if (!isOrganizationPath.value && $isFetchPositions.value)
        $abortFetchPositions();
    },
    getCachedData(key, nuxtApp) {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  } as const;

  const {
    data: organization,
    status,
    error: errorFetchingOrganization,
  } = await useLazyFetch<SingleOrg>(`/${route.params.orgSlug}`, {
    ...OPTIONS,
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <app-skeleton-organization />
    </template>

    <app-data-organization-pageHeader
      :organization="organization?.name ?? ''"
      @selected="(o) => emit('selected', o)"
    />

    <div v-show="isLoading === 'pending'">
      <app-skeleton-positions />
    </div>

    <!-- TODO:Handle the case when the data is null but not necessarily an error -->
    <!-- HERE -->

    <!-- TODO: Better UI for errors -->
    <div v-if="errorFetchingOrganization">
      <slot name="error" :error="errorFetchingOrganization">
        <small>{{ errorFetchingOrganization }}</small>
      </slot>
    </div>

    <div :class="[isLoading === 'pending' ? 'invisible' : 'visible flex-1 flex flex-col']" v-else>
      <small v-if="!organization">Could not find organization</small>
      <slot :organization="organization" v-else />
    </div>
  </ClientOnly>
</template>
