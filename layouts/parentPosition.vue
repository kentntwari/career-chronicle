<script lang="ts" setup>
  import type { UseFetchOptions } from "#app";
  import type { SingleOrg, SinglePos } from "~/types";

  const props = defineProps<{
    parentOrganization?: SingleOrg["slug"];
    isFirstPosition?: boolean;
  }>();

  const emit = defineEmits<{
    selected: [pos: SinglePos["slug"]];
  }>();

  const route = useRoute();

  const k = useOrgPositionsKey();

  const OPTIONS_POSITION: UseFetchOptions<SinglePos> = {
    key: k.value,
    baseURL: "/api/organization",
    deep: false,
    immediate: !props.isFirstPosition ? true : false,
  } as const;

  const { data: position } = await useLazyFetch<SinglePos>(
    `${props.parentOrganization ?? route.params.orgSlug}/position/${route.params.positionSlug}`,
    {
      ...OPTIONS_POSITION,
    }
  );
</script>

<template>
  <app-data-position-pageHeader
    :position="position?.title ?? ''"
    class="border border-neutral-grey-600"
    @selected="(pos) => emit('selected', pos)"
  />
  <slot />
</template>
