<script lang="ts" setup>
  import type { UseFetchOptions } from "nuxt/app";
  import type { SingleOrg, SinglePos } from "~/types";

  const props = defineProps<{
    parentOrganization?: SingleOrg["slug"];
    isFirstPosition?: boolean;
    isFirstBenchmark?: boolean;
  }>();

  const emit = defineEmits<{
    selected: [pos: SinglePos["slug"]];
  }>();

  const route = useRoute();

  const k = useCurrentPositionKey();
  const OPTIONS_POSITION: UseFetchOptions<SinglePos> = {
    key: k.value,
    baseURL: "/api/organization",
    getCachedData: (key, nuxtApp) => {
      if (!nuxtApp.payload.data[key]) return;
      return nuxtApp.payload.data[key];
    },
  } as const;

  const {
    data: position,
    status,
    error,
  } = await useLazyFetch<SinglePos>(
    `${props.parentOrganization ?? route.params.orgSlug}/position/${
      route.params.positionSlug
    }`,
    {
      ...OPTIONS_POSITION,
      // TODO: assign default values to mitigate null data
    }
  );

  const { isLoading } = useDebouncedLoading(status, { minLoadingTime: 250 });
</script>

<template>
  <app-data-position-pageHeader
    :position="position?.title ?? ''"
    :started-at="`${position?.monthStartedAt?.toLocaleLowerCase() ?? ''} ${position?.yearStartedAt ?? ''}`"
    :description="position?.description ?? ''"
    class="border border-neutral-grey-600"
    @selected="(pos) => emit('selected', pos)"
  />
  <div class="container" v-show="isLoading === 'pending'">
    <app-skeleton-content class="mt-10 px-3" />
  </div>
  <!-- TODO: Handle the case where data(positions) is null but not necessarily an error -->
  <!-- TODO: Better UI for errors -->
  <div v-if="error">
    <slot name="error" :error="error">
      <small>{{ error }}</small>
    </slot>
  </div>
  <div
    class="flex-1 flex flex-col"
    v-else-if="isLoading !== 'pending' && !!position"
  >
    <slot :position="position" />
  </div>
</template>
