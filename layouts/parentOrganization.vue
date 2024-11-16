<script lang="ts" setup>
  import type { UseFetchOptions } from "#app";
  import type { SingleOrg } from "~/types";

  const nuxtApp = useNuxtApp();

  const currentOrg = useCurrentRouteOrg();
  const computedParams = toRef(() => `/${currentOrg.value}`);

  const trk = useOrganizationKey();
  const OPTIONS_ORGANIZATION: UseFetchOptions<SingleOrg> = {
    key: trk.value,
    baseURL: "/api/organization",
  } as const;

  const { data: cachedOrganization } = useNuxtData<SingleOrg>(trk.value);

  const {
    data: organization,
    status,
    error: errorFetchingOrganization,
  } = await useLazyFetch<SingleOrg>(computedParams, {
    ...OPTIONS_ORGANIZATION,
  });

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });

  watchEffect(() => {
    if (
      isLoading.value !== "pending" &&
      cachedOrganization.value?.hasCreatedPositionBefore
    )
      nuxtApp.$fetchPositions();
  });
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <app-skeleton-organization />
    </template>

    <app-data-organization-pageHeader
      :organization="organization?.name ?? ''"
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

    <div :class="[isLoading === 'pending' ? 'invisible' : 'visible']" v-else>
      <slot :organization="organization" />
    </div>
  </ClientOnly>
</template>
