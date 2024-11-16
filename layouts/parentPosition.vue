<script lang="ts" setup>
  import type { UseFetchOptions } from "#app";
  import type { FetchResponse } from "ofetch";
  import { useDelayedLoading } from "~/composables/useDelayedLoading";
  import { useCurrentPositionKey } from "~/composables/useFetchKeys";
  import type { SingleOrg, SinglePos } from "~/types";

  const props = defineProps<{
    parentOrganization: SingleOrg["slug"];
    isFirstPosition?: boolean;
  }>();

  const currentPosition = useCurrentRoutePosition();
  const computedParams = computed(
    () => `/${props.parentOrganization}/position/${currentPosition.value}`
  );
  const toRefKey = useCurrentPositionKey();
  const OPTIONS_POSITION: UseFetchOptions<SinglePos> = {
    key: toRefKey.value,
    baseURL: "/api/organization",
    deep: false,
    immediate: !props.isFirstPosition ? true : false,
  } as const;

  const { data: position } = await useLazyFetch<SinglePos>(computedParams, {
    ...OPTIONS_POSITION,
  });
</script>

<template>
  <app-data-position-pageHeader
    :position="position?.title ?? ''"
    class="border border-neutral-grey-600"
  />
  {{ JSON.stringify(position) }}
</template>
